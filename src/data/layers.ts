// Composable layers for OTel Collector deployment architectures

export type LayerType = 'edge' | 'processing' | 'buffering';

export interface DiagramNode {
  id: string;
  type: 'app' | 'agent' | 'gateway' | 'loadbalancer' | 'kafka' | 'backend' | 'sidecar';
  label: string;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
}

export interface Layer {
  id: string;
  type: LayerType;
  name: string;
  description: string;
  icon: string;
  // What this layer requires/provides
  requires: string[];
  provides: string[];
  incompatibleWith: string[];
  // Visual representation
  diagramNodes: DiagramNode[];
  diagramEdges: DiagramEdge[];
  // Configuration snippets
  configSnippets: {
    agent?: string;
    gateway?: string;
    kubernetes?: string;
  };
  // Resource sizing recommendations
  resources?: {
    cpu: string;
    memory: string;
    replicas?: number;
  };
}

// ============================================================================
// EDGE LAYERS - How telemetry enters the pipeline
// ============================================================================

export const edgeLayers: Layer[] = [
  {
    id: 'direct-sdk',
    type: 'edge',
    name: 'Direct SDK Export',
    description: 'Applications export telemetry directly to the next tier (gateway or backend). No local collector.',
    icon: 'Zap',
    requires: [],
    provides: [],
    incompatibleWith: [],
    diagramNodes: [
      { id: 'app', type: 'app', label: 'Application\n+ OTel SDK' },
    ],
    diagramEdges: [],
    configSnippets: {
      agent: `# SDK Configuration (environment variables)
# Point directly to gateway or backend
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-gateway:4317
OTEL_SERVICE_NAME=my-service
OTEL_RESOURCE_ATTRIBUTES=deployment.environment=production`,
    },
  },
  {
    id: 'daemonset-agent',
    type: 'edge',
    name: 'DaemonSet Agent',
    description: 'One collector per Kubernetes node. Collects host metrics, enriches with k8s metadata. Apps export to localhost.',
    icon: 'Server',
    requires: ['kubernetes', 'daemonset-capable'],
    provides: ['host-metrics', 'resource-detection', 'k8s-metadata', 'log-collection'],
    incompatibleWith: ['managed-containers'],
    diagramNodes: [
      { id: 'app', type: 'app', label: 'Application' },
      { id: 'daemonset', type: 'agent', label: 'DaemonSet\nAgent' },
    ],
    diagramEdges: [
      { from: 'app', to: 'daemonset', label: 'localhost' },
    ],
    configSnippets: {
      agent: `# DaemonSet Agent Configuration
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
  hostmetrics:
    collection_interval: 30s
    scrapers:
      cpu:
      memory:
      disk:
      network:
  filelog:
    include: [/var/log/containers/*.log]
    operators:
      - type: container
        id: container-parser

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 512
    spike_limit_mib: 128
  resourcedetection:
    detectors: [env, system, gcp, aws, azure]
  k8sattributes:
    auth_type: serviceAccount
    passthrough: false
    filter:
      node_from_env_var: KUBE_NODE_NAME
    extract:
      metadata:
        - k8s.namespace.name
        - k8s.deployment.name
        - k8s.pod.name
        - k8s.node.name
  batch:
    send_batch_size: 1024
    timeout: 5s

exporters:
  otlp:
    endpoint: otel-gateway.observability.svc:4317
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, resourcedetection, k8sattributes, batch]
      exporters: [otlp]
    metrics:
      receivers: [otlp, hostmetrics]
      processors: [memory_limiter, resourcedetection, k8sattributes, batch]
      exporters: [otlp]
    logs:
      receivers: [otlp, filelog]
      processors: [memory_limiter, resourcedetection, k8sattributes, batch]
      exporters: [otlp]`,
      kubernetes: `# DaemonSet for Agent Collector
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: otel-agent
  namespace: observability
spec:
  selector:
    matchLabels:
      app: otel-agent
  template:
    metadata:
      labels:
        app: otel-agent
    spec:
      serviceAccountName: otel-collector
      containers:
        - name: collector
          image: otel/opentelemetry-collector-contrib:latest
          args: ["--config=/conf/config.yaml"]
          env:
            - name: GOMEMLIMIT
              value: "400MiB"
            - name: KUBE_NODE_NAME
              valueFrom:
                fieldRef:
                  fieldPath: spec.nodeName
          ports:
            - containerPort: 4317
              hostPort: 4317
              name: otlp-grpc
            - containerPort: 4318
              hostPort: 4318
              name: otlp-http
          resources:
            requests:
              memory: 256Mi
              cpu: 250m
            limits:
              memory: 512Mi
              cpu: 500m
          volumeMounts:
            - name: config
              mountPath: /conf
            - name: varlog
              mountPath: /var/log
              readOnly: true
      volumes:
        - name: config
          configMap:
            name: otel-agent-config
        - name: varlog
          hostPath:
            path: /var/log`,
    },
    resources: {
      cpu: '250m-500m',
      memory: '256Mi-512Mi',
    },
  },
  {
    id: 'sidecar-agent',
    type: 'edge',
    name: 'Sidecar Agent',
    description: 'One collector per pod. Provides per-service isolation and custom config. Works on managed container platforms.',
    icon: 'Box',
    requires: ['kubernetes'],
    provides: ['per-service-isolation', 'custom-per-service-config'],
    incompatibleWith: [],
    diagramNodes: [
      { id: 'app', type: 'app', label: 'Application' },
      { id: 'sidecar', type: 'sidecar', label: 'Sidecar\nAgent' },
    ],
    diagramEdges: [
      { from: 'app', to: 'sidecar', label: 'localhost' },
    ],
    configSnippets: {
      agent: `# Sidecar Agent Configuration
# Lightweight config - no host metrics (can't access node)
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 128
    spike_limit_mib: 32
  batch:
    send_batch_size: 512
    timeout: 5s

exporters:
  otlp:
    endpoint: otel-gateway.observability.svc:4317
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [otlp]
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [otlp]
    logs:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [otlp]`,
      kubernetes: `# Sidecar injection via OpenTelemetry Operator
# Add annotation to enable sidecar injection:
apiVersion: v1
kind: Pod
metadata:
  annotations:
    sidecar.opentelemetry.io/inject: "true"
    instrumentation.opentelemetry.io/inject-java: "true"
spec:
  containers:
    - name: my-app
      image: my-app:latest
      # Sidecar will be injected automatically
---
# OpenTelemetryCollector CR for sidecar mode
apiVersion: opentelemetry.io/v1beta1
kind: OpenTelemetryCollector
metadata:
  name: sidecar
  namespace: observability
spec:
  mode: sidecar
  config:
    receivers:
      otlp:
        protocols:
          grpc:
            endpoint: 0.0.0.0:4317
    processors:
      memory_limiter:
        limit_mib: 128
      batch:
        send_batch_size: 512
    exporters:
      otlp:
        endpoint: otel-gateway.observability.svc:4317
    service:
      pipelines:
        traces:
          receivers: [otlp]
          processors: [memory_limiter, batch]
          exporters: [otlp]`,
    },
    resources: {
      cpu: '50m-100m',
      memory: '64Mi-128Mi',
    },
  },
  {
    id: 'host-agent',
    type: 'edge',
    name: 'Host Agent',
    description: 'Standalone collector running on a bare-metal host or VM. Collects host metrics and local application telemetry.',
    icon: 'Server',
    requires: [],
    provides: ['host-metrics', 'resource-detection', 'log-collection'],
    incompatibleWith: [],
    diagramNodes: [
      { id: 'app', type: 'app', label: 'Application' },
      { id: 'host-agent', type: 'agent', label: 'Host\nAgent' },
    ],
    diagramEdges: [
      { from: 'app', to: 'host-agent', label: 'localhost' },
    ],
    configSnippets: {
      agent: `# Host Agent Configuration (systemd / standalone)
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
  hostmetrics:
    collection_interval: 30s
    scrapers:
      cpu:
      memory:
      disk:
      network:
      filesystem:
      load:
  filelog:
    include: [/var/log/syslog, /var/log/*.log]
    operators:
      - type: regex_parser
        regex: '^(?P<time>\\S+) (?P<host>\\S+) (?P<ident>\\S+): (?P<message>.*)$'
        timestamp:
          parse_from: attributes.time
          layout_type: gotime
          layout: '2006-01-02T15:04:05.000Z'

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 512
    spike_limit_mib: 128
  resourcedetection:
    detectors: [env, system, gcp, aws, azure]
  batch:
    send_batch_size: 1024
    timeout: 5s

exporters:
  otlp:
    endpoint: otel-gateway:4317
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, resourcedetection, batch]
      exporters: [otlp]
    metrics:
      receivers: [otlp, hostmetrics]
      processors: [memory_limiter, resourcedetection, batch]
      exporters: [otlp]
    logs:
      receivers: [otlp, filelog]
      processors: [memory_limiter, resourcedetection, batch]
      exporters: [otlp]`,
      kubernetes: `# Install via package manager or download binary
# Debian/Ubuntu:
#   sudo apt-get install otelcol-contrib
#
# Or download from GitHub releases:
#   https://github.com/open-telemetry/opentelemetry-collector-releases
#
# systemd service file:
# /etc/systemd/system/otelcol.service
[Unit]
Description=OpenTelemetry Collector
After=network.target

[Service]
ExecStart=/usr/bin/otelcol-contrib --config /etc/otelcol/config.yaml
Restart=always
RestartSec=5
User=otelcol
Group=otelcol
Environment=GOMEMLIMIT=400MiB
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target`,
    },
    resources: {
      cpu: '250m-500m',
      memory: '256Mi-512Mi',
    },
  },
];

// ============================================================================
// PROCESSING LAYERS - Central processing, routing, and sampling
// ============================================================================

export const processingLayers: Layer[] = [
  {
    id: 'none',
    type: 'processing',
    name: 'No Central Processing',
    description: 'Edge collectors export directly to backend. Simplest setup but no centralized policy.',
    icon: 'MinusCircle',
    requires: [],
    provides: [],
    incompatibleWith: ['tail-sampling', 'multi-backend', 'central-policy'],
    diagramNodes: [],
    diagramEdges: [],
    configSnippets: {},
  },
  {
    id: 'gateway-pool',
    type: 'processing',
    name: 'Gateway Pool',
    description: 'Centralized collector deployment for policy enforcement, multi-backend routing, and credential isolation. Replica count scales with data volume.',
    icon: 'Layers',
    requires: [],
    provides: ['central-policy', 'multi-backend', 'credential-isolation', 'pii-filtering'],
    incompatibleWith: [],
    diagramNodes: [
      { id: 'lb', type: 'loadbalancer', label: 'Load\nBalancer' },
      { id: 'gateway', type: 'gateway', label: 'Gateway\nPool' },
    ],
    diagramEdges: [
      { from: 'lb', to: 'gateway' },
    ],
    configSnippets: {
      gateway: `# Gateway Pool Configuration
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 2048
    spike_limit_mib: 512
  filter:
    error_mode: ignore
    traces:
      span:
        - 'attributes["http.route"] == "/health"'
        - 'attributes["http.route"] == "/ready"'
  transform:
    error_mode: ignore
    trace_statements:
      - context: span
        statements:
          - delete_key(attributes, "http.request.header.authorization")
  batch:
    send_batch_size: 2048
    timeout: 10s

exporters:
  otlp/backend:
    endpoint: \${BACKEND_ENDPOINT}
    headers:
      Authorization: Bearer \${BACKEND_TOKEN}
    sending_queue:
      enabled: true
      queue_size: 10000
    retry_on_failure:
      enabled: true
      max_elapsed_time: 300s

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, filter, transform, batch]
      exporters: [otlp/backend]
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [otlp/backend]
    logs:
      receivers: [otlp]
      processors: [memory_limiter, filter, batch]
      exporters: [otlp/backend]`,
      kubernetes: `# Gateway Deployment with HPA
apiVersion: apps/v1
kind: Deployment
metadata:
  name: otel-gateway
  namespace: observability
spec:
  replicas: 3
  selector:
    matchLabels:
      app: otel-gateway
  template:
    metadata:
      labels:
        app: otel-gateway
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchLabels:
                    app: otel-gateway
                topologyKey: kubernetes.io/hostname
      containers:
        - name: collector
          image: otel/opentelemetry-collector-contrib:latest
          args: ["--config=/conf/config.yaml"]
          env:
            - name: GOMEMLIMIT
              value: "3200MiB"
          ports:
            - containerPort: 4317
            - containerPort: 4318
          resources:
            requests:
              memory: 2Gi
              cpu: 1000m
            limits:
              memory: 4Gi
              cpu: 2000m
---
apiVersion: v1
kind: Service
metadata:
  name: otel-gateway
  namespace: observability
spec:
  selector:
    app: otel-gateway
  ports:
    - port: 4317
      name: otlp-grpc
    - port: 4318
      name: otlp-http
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: otel-gateway-hpa
  namespace: observability
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: otel-gateway
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 70
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300`,
    },
    resources: {
      cpu: '1-2 cores',
      memory: '2Gi-4Gi',
    },
  },
  {
    id: 'sampling-tier',
    type: 'processing',
    name: 'Tail Sampling Tier',
    description: 'StatefulSet with loadbalancingexporter for trace-aware sampling. All spans of a trace reach the same collector.',
    icon: 'GitBranch',
    requires: ['gateway-pool'],
    provides: ['tail-sampling', 'span-metrics', 'service-graph'],
    incompatibleWith: [],
    diagramNodes: [
      { id: 'lb-exporter', type: 'loadbalancer', label: 'LB\nExporter' },
      { id: 'sampling', type: 'gateway', label: 'Sampling\nTier' },
    ],
    diagramEdges: [
      { from: 'lb-exporter', to: 'sampling', label: 'traceID\nhash' },
    ],
    configSnippets: {
      agent: `# Add to agent config - Load Balancing Exporter
exporters:
  loadbalancing:
    routing_key: traceID
    protocol:
      otlp:
        tls:
          insecure: true
    resolver:
      dns:
        hostname: otel-sampling.observability.svc.cluster.local
        port: 4317`,
      gateway: `# Sampling Tier Configuration
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 4096
    spike_limit_mib: 1024
  tail_sampling:
    decision_wait: 30s
    num_traces: 100000
    expected_new_traces_per_sec: 10000
    policies:
      - name: errors-policy
        type: status_code
        status_code:
          status_codes: [ERROR]
      - name: slow-traces
        type: latency
        latency:
          threshold_ms: 1000
      - name: probabilistic-sample
        type: probabilistic
        probabilistic:
          sampling_percentage: 10

connectors:
  spanmetrics:
    histogram:
      explicit:
        buckets: [5ms, 10ms, 25ms, 50ms, 100ms, 250ms, 500ms, 1s, 2.5s, 5s, 10s]
    dimensions:
      - name: http.method
      - name: http.status_code
    exemplars:
      enabled: true

exporters:
  otlp/traces:
    endpoint: backend.example.com:4317
  prometheusremotewrite:
    endpoint: https://prometheus.example.com/api/v1/write

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, tail_sampling]
      exporters: [spanmetrics, otlp/traces]
    metrics:
      receivers: [spanmetrics]
      exporters: [prometheusremotewrite]`,
      kubernetes: `# StatefulSet for Sampling Tier
apiVersion: v1
kind: Service
metadata:
  name: otel-sampling
  namespace: observability
spec:
  clusterIP: None  # Headless for DNS discovery
  selector:
    app: otel-sampling
  ports:
    - port: 4317
      name: otlp-grpc
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: otel-sampling
  namespace: observability
spec:
  serviceName: otel-sampling
  replicas: 3
  selector:
    matchLabels:
      app: otel-sampling
  template:
    metadata:
      labels:
        app: otel-sampling
    spec:
      containers:
        - name: collector
          image: otel/opentelemetry-collector-contrib:latest
          args: ["--config=/conf/config.yaml"]
          env:
            - name: GOMEMLIMIT
              value: "6400MiB"
          ports:
            - containerPort: 4317
          resources:
            requests:
              memory: 4Gi
              cpu: 2000m
            limits:
              memory: 8Gi
              cpu: 4000m`,
    },
    resources: {
      cpu: '2-4 cores',
      memory: '4Gi-8Gi',
      replicas: 3,
    },
  },
];

// ============================================================================
// BUFFERING LAYERS - Resilience and data durability
// ============================================================================

export const bufferingLayers: Layer[] = [
  {
    id: 'memory-queue',
    type: 'buffering',
    name: 'In-Memory Queues',
    description: 'Default sending queues with retry. Data lost on collector crash. Suitable when some loss is acceptable.',
    icon: 'Cpu',
    requires: [],
    provides: ['basic-retry', 'backpressure'],
    incompatibleWith: [],
    diagramNodes: [],
    diagramEdges: [],
    configSnippets: {
      agent: `# In-memory queue configuration (default)
exporters:
  otlp:
    endpoint: backend:4317
    sending_queue:
      enabled: true
      num_consumers: 10
      queue_size: 1000
    retry_on_failure:
      enabled: true
      initial_interval: 5s
      max_interval: 30s
      max_elapsed_time: 300s`,
    },
  },
  {
    id: 'persistent-queue',
    type: 'buffering',
    name: 'Persistent Queues',
    description: 'File-based WAL survives collector crashes. Requires PVC in Kubernetes. Good balance of resilience and simplicity.',
    icon: 'HardDrive',
    requires: [],
    provides: ['crash-recovery', 'restart-resilience'],
    incompatibleWith: [],
    diagramNodes: [],
    diagramEdges: [],
    configSnippets: {
      agent: `# Persistent queue configuration
extensions:
  file_storage:
    directory: /var/lib/otelcol/file_storage

exporters:
  otlp:
    endpoint: backend:4317
    sending_queue:
      enabled: true
      storage: file_storage
      queue_size: 10000
    retry_on_failure:
      enabled: true
      max_elapsed_time: 3600s  # Retry for up to 1 hour

service:
  extensions: [file_storage]`,
      kubernetes: `# StatefulSet with PVC for persistent queue
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: otel-collector
spec:
  serviceName: otel-collector
  replicas: 3
  template:
    spec:
      containers:
        - name: collector
          volumeMounts:
            - name: queue-storage
              mountPath: /var/lib/otelcol/file_storage
  volumeClaimTemplates:
    - metadata:
        name: queue-storage
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi`,
    },
  },
  {
    id: 'kafka-buffer',
    type: 'buffering',
    name: 'Kafka Buffer',
    description: 'External Kafka cluster for maximum durability. Survives hours of backend outages. Enables replay and multi-consumer.',
    icon: 'Database',
    requires: ['kafka-cluster'],
    provides: ['extended-outage-survival', 'replay', 'multi-consumer', 'decoupling'],
    incompatibleWith: [],
    diagramNodes: [
      { id: 'kafka', type: 'kafka', label: 'Kafka' },
    ],
    diagramEdges: [],
    configSnippets: {
      agent: `# Kafka exporter configuration (agent side)
exporters:
  kafka/traces:
    protocol_version: 3.5.0
    brokers:
      - kafka-0.kafka.svc:9092
      - kafka-1.kafka.svc:9092
      - kafka-2.kafka.svc:9092
    topic: otel-traces
    encoding: otlp_proto
    partition_traces_by_id: true  # For tail sampling compatibility
    producer:
      required_acks: -1  # Wait for all replicas
      compression: zstd
  kafka/metrics:
    protocol_version: 3.5.0
    brokers:
      - kafka-0.kafka.svc:9092
    topic: otel-metrics
    encoding: otlp_proto
  kafka/logs:
    protocol_version: 3.5.0
    brokers:
      - kafka-0.kafka.svc:9092
    topic: otel-logs
    encoding: otlp_proto`,
      gateway: `# Kafka receiver configuration (gateway side)
receivers:
  kafka/traces:
    protocol_version: 3.5.0
    brokers:
      - kafka-0.kafka.svc:9092
    topic: otel-traces
    encoding: otlp_proto
    group_id: otel-gateway-traces
    initial_offset: earliest
  kafka/metrics:
    protocol_version: 3.5.0
    brokers:
      - kafka-0.kafka.svc:9092
    topic: otel-metrics
    encoding: otlp_proto
    group_id: otel-gateway-metrics
  kafka/logs:
    protocol_version: 3.5.0
    brokers:
      - kafka-0.kafka.svc:9092
    topic: otel-logs
    encoding: otlp_proto
    group_id: otel-gateway-logs

service:
  pipelines:
    traces:
      receivers: [kafka/traces]
      processors: [batch]
      exporters: [otlp/backend]`,
      kubernetes: `# Note: Kafka cluster deployment is separate
# Ensure Kafka topics are created with appropriate partitions
# Partitions should >= number of consumer (gateway) replicas

# Example topic creation:
# kafka-topics.sh --create --topic otel-traces \\
#   --partitions 12 --replication-factor 3 \\
#   --bootstrap-server kafka:9092`,
    },
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getLayer(id: string): Layer | undefined {
  return [...edgeLayers, ...processingLayers, ...bufferingLayers].find(l => l.id === id);
}

export function getLayersByType(type: LayerType): Layer[] {
  switch (type) {
    case 'edge':
      return edgeLayers;
    case 'processing':
      return processingLayers;
    case 'buffering':
      return bufferingLayers;
  }
}

export function getAllLayers(): Layer[] {
  return [...edgeLayers, ...processingLayers, ...bufferingLayers];
}

export function isLayerCompatible(layer: Layer, constraints: string[]): boolean {
  // Check if any constraint is in the layer's incompatibleWith list
  return !layer.incompatibleWith.some(inc => constraints.includes(inc));
}

export function getLayerRequirements(layer: Layer): string[] {
  return layer.requires;
}

export function getLayerCapabilities(layer: Layer): string[] {
  return layer.provides;
}
