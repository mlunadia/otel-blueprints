export type ComponentId = 
  | 'otel-sdk'
  | 'agent-collector'
  | 'gateway-collector'
  | 'loadbalancing-exporter'
  | 'tail-sampling'
  | 'kafka'
  | 'backend';

export interface ComponentConfig {
  title: string;
  yaml: string;
  description?: string;
}

export interface Component {
  id: ComponentId;
  name: string;
  shortDescription: string;
  description: string;
  whatItDoes: string[];
  whenToUse: string[];
  whenNotToUse?: string[];
  configuration?: ComponentConfig[];
  relatedLayers: string[];  // Changed from relatedLayers
  externalLinks?: { label: string; url: string }[];
}

export const components: Component[] = [
  {
    id: 'otel-sdk',
    name: 'OpenTelemetry SDK',
    shortDescription: 'Client library that instruments your application to generate telemetry data.',
    description: `The OpenTelemetry SDK is a language-specific library that you integrate into your application code to generate traces, metrics, and logs. It provides automatic instrumentation for popular frameworks and libraries, as well as APIs for manual instrumentation when needed.`,
    whatItDoes: [
      'Automatically instruments common frameworks (HTTP, gRPC, databases)',
      'Provides APIs for manual span creation and context propagation',
      'Collects application metrics and logs',
      'Exports telemetry data via OTLP protocol',
      'Supports context propagation across service boundaries',
    ],
    whenToUse: [
      'Every application that needs observability',
      'When you want automatic instrumentation with minimal code changes',
      'When you need to add custom spans or attributes',
    ],
    whenNotToUse: [
      'Legacy applications that cannot be modified',
      'When using agent-based instrumentation (e.g., Java agent)',
    ],
    relatedLayers: ['direct-to-backend', 'agent-only', 'gateway-only', 'agent-gateway', 'agent-kafka-gateway', 'agent-lb-sampling'],
    externalLinks: [
      { label: 'OpenTelemetry SDK Documentation', url: 'https://opentelemetry.io/docs/instrumentation/' },
    ],
  },
  {
    id: 'agent-collector',
    name: 'Agent Collector',
    shortDescription: 'A collector deployed close to applications for local telemetry collection and forwarding.',
    description: `The Agent Collector runs on the same host as your applications, typically deployed as a DaemonSet in Kubernetes or as a sidecar container. It receives telemetry from local applications, performs initial processing, and forwards data to a gateway or directly to backends. Being co-located with applications enables host-level metrics collection and resource detection.`,
    whatItDoes: [
      'Receives telemetry from applications on the same host',
      'Collects host metrics (CPU, memory, disk, network)',
      'Performs resource detection and enrichment',
      'Provides local buffering and retry on failures',
      'Scrapes log files from the local filesystem',
      'Adds Kubernetes metadata when running in K8s',
    ],
    whenToUse: [
      'You need host-level metrics collection',
      'You want to collect log files from disk',
      'You need resource detection from the application host',
      'You want to offload credential management from applications',
      'Running in Kubernetes and need pod/node metadata',
    ],
    whenNotToUse: [
      'Managed container platforms where you cannot deploy agents',
      'When operational simplicity is the top priority',
      'Very resource-constrained environments',
    ],
    configuration: [
      {
        title: 'Basic Agent Configuration',
        description: 'A minimal agent collector configuration that receives OTLP and forwards to a gateway.',
        yaml: `receivers:
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

processors:
  batch:
    timeout: 1s
    send_batch_size: 1024
  resourcedetection:
    detectors: [env, system, docker, ec2, gcp, azure]
  memory_limiter:
    check_interval: 1s
    limit_mib: 512

exporters:
  otlp:
    endpoint: gateway-collector:4317
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
      receivers: [otlp]
      processors: [memory_limiter, resourcedetection, batch]
      exporters: [otlp]`,
      },
      {
        title: 'Kubernetes DaemonSet Deployment',
        description: 'Deploy the agent as a DaemonSet to run on every node.',
        yaml: `apiVersion: apps/v1
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
      containers:
        - name: otel-agent
          image: otel/opentelemetry-collector-contrib:latest
          args: ["--config=/etc/otel/config.yaml"]
          ports:
            - containerPort: 4317
              hostPort: 4317
            - containerPort: 4318
              hostPort: 4318
          volumeMounts:
            - name: config
              mountPath: /etc/otel
          resources:
            limits:
              memory: 512Mi
            requests:
              memory: 256Mi
      volumes:
        - name: config
          configMap:
            name: otel-agent-config`,
      },
    ],
    relatedLayers: ['agent-only', 'agent-gateway', 'agent-kafka-gateway', 'agent-lb-sampling'],
    externalLinks: [
      { label: 'Collector Deployment Modes', url: 'https://opentelemetry.io/docs/collector/deployment/' },
      { label: 'Host Metrics Receiver', url: 'https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/hostmetricsreceiver' },
    ],
  },
  {
    id: 'gateway-collector',
    name: 'Gateway Collector',
    shortDescription: 'A centralized collector pool for aggregation, processing, and multi-backend routing.',
    description: `The Gateway Collector is a horizontally-scalable pool of collectors that sits between agents (or applications) and observability backends. It provides centralized processing, credential management, and the ability to route telemetry to multiple destinations. Gateways are typically deployed as a Kubernetes Deployment behind a load balancer.`,
    whatItDoes: [
      'Centralizes telemetry processing and transformation',
      'Routes data to multiple backends (fan-out)',
      'Manages backend credentials in one place',
      'Applies consistent sampling and filtering policies',
      'Provides horizontal scaling for high-volume workloads',
      'Enables multi-tenant routing with the routing connector',
    ],
    whenToUse: [
      'You need to route telemetry to multiple backends',
      'You want centralized credential management',
      'You need consistent processing policies across all telemetry',
      'You require horizontal scaling for high volumes',
      'You have multi-tenant requirements',
    ],
    whenNotToUse: [
      'Simple, low-volume deployments where agents suffice',
      'When minimizing latency is critical (adds a hop)',
      'When operational simplicity is the top priority',
    ],
    configuration: [
      {
        title: 'Gateway with Multi-Backend Routing',
        description: 'A gateway that routes telemetry to multiple observability backends.',
        yaml: `receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 5s
    send_batch_size: 8192
  memory_limiter:
    check_interval: 1s
    limit_mib: 2048
  filter/drop-health:
    spans:
      exclude:
        match_type: strict
        span_names: ["health", "healthcheck", "ping"]

exporters:
  otlp/elastic:
    endpoint: https://your-elastic-endpoint:443
    headers:
      Authorization: "ApiKey your-api-key"
  otlp/jaeger:
    endpoint: jaeger-collector:4317
    tls:
      insecure: true
  prometheus:
    endpoint: 0.0.0.0:8889

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, filter/drop-health, batch]
      exporters: [otlp/elastic, otlp/jaeger]
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [otlp/elastic, prometheus]
    logs:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [otlp/elastic]`,
      },
      {
        title: 'Kubernetes Deployment with HPA',
        description: 'Deploy the gateway as a scalable Deployment with Horizontal Pod Autoscaler.',
        yaml: `apiVersion: apps/v1
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
      containers:
        - name: otel-gateway
          image: otel/opentelemetry-collector-contrib:latest
          args: ["--config=/etc/otel/config.yaml"]
          ports:
            - containerPort: 4317
            - containerPort: 4318
          resources:
            limits:
              memory: 2Gi
            requests:
              memory: 1Gi
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
        name: memory
        target:
          type: Utilization
          averageUtilization: 80`,
      },
    ],
    relatedLayers: ['gateway-only', 'agent-gateway', 'agent-kafka-gateway'],
    externalLinks: [
      { label: 'Collector Scaling', url: 'https://opentelemetry.io/docs/collector/scaling/' },
      { label: 'Routing Connector', url: 'https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/routingconnector' },
    ],
  },
  {
    id: 'loadbalancing-exporter',
    name: 'Load Balancing Exporter',
    shortDescription: 'Routes spans to collectors based on trace ID for stateful processing like tail sampling.',
    description: `The Load Balancing Exporter is a specialized exporter that routes telemetry data to downstream collectors based on consistent hashing of the trace ID. This ensures all spans belonging to the same trace are sent to the same collector instance, which is essential for stateful processing like tail sampling or span-to-metrics generation.

Unlike a traditional load balancer that distributes requests randomly, the load balancing exporter uses trace-ID hashing to maintain trace affinity. This means:
- Trace ABC always goes to Collector #2
- Trace XYZ always goes to Collector #1

This is critical because tail sampling needs to see ALL spans of a trace before making a keep/drop decision.`,
    whatItDoes: [
      'Routes spans by trace ID using consistent hashing',
      'Discovers downstream collectors via DNS (headless service)',
      'Maintains trace affinity across the sampling tier',
      'Enables horizontal scaling of stateful processors',
      'Automatically rebalances when collectors scale up/down',
    ],
    whenToUse: [
      'You need tail-based sampling at scale',
      'You want to generate accurate span metrics',
      'You need service graph generation',
      'You have stateful processing requirements',
    ],
    whenNotToUse: [
      'Simple probabilistic (head) sampling is sufficient',
      'You want to minimize operational complexity',
      'Low-volume scenarios where a single collector suffices',
    ],
    configuration: [
      {
        title: 'Load Balancing Exporter Configuration',
        description: 'Configure the load balancing exporter to route by trace ID to a headless service.',
        yaml: `exporters:
  loadbalancing:
    routing_key: traceID
    protocol:
      otlp:
        tls:
          insecure: true
    resolver:
      dns:
        hostname: otel-sampling-headless.observability.svc.cluster.local
        port: 4317

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [loadbalancing]`,
      },
      {
        title: 'Headless Service for Collector Discovery',
        description: 'Create a headless service so the load balancing exporter can discover all collector pods.',
        yaml: `apiVersion: v1
kind: Service
metadata:
  name: otel-sampling-headless
  namespace: observability
spec:
  clusterIP: None  # Headless service
  selector:
    app: otel-sampling
  ports:
    - port: 4317
      targetPort: 4317
      name: otlp-grpc`,
      },
    ],
    relatedLayers: ['agent-lb-sampling'],
    externalLinks: [
      { label: 'Load Balancing Exporter', url: 'https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/loadbalancingexporter' },
    ],
  },
  {
    id: 'tail-sampling',
    name: 'Tail Sampling Processor',
    shortDescription: 'Makes sampling decisions after seeing the complete trace, enabling intelligent filtering.',
    description: `Tail-based sampling analyzes a complete trace before deciding whether to keep it, enabling intelligent decisions based on factors like errors, high latency, or specific attributes. This is different from head-based sampling, which makes an early decision at the start of a trace.

**Important**: Within the OpenTelemetry Collector, any processor that generates metrics from traces must run before the tail-sampling processor. If sampling happens first, metrics will be calculated on an incomplete data set, leading to inaccurate and misleading reporting.

To enforce a specific order of calculations and sampling decisions, you should use the Forward connector to split the traces pipeline into two steps: the first part applies calculations (like the elasticapm connector), and the second part applies the tail-based sampling decision.`,
    whatItDoes: [
      'Waits for all spans of a trace before making a decision',
      'Applies policy-based sampling (latency, errors, attributes)',
      'Enables keeping 100% of error traces while sampling normal ones',
      'Supports composite policies combining multiple criteria',
      'Can generate accurate span metrics before sampling',
    ],
    whenToUse: [
      'You want to keep all error traces regardless of sample rate',
      'You need latency-based sampling (keep slow requests)',
      'You want intelligent sampling based on trace attributes',
      'You need accurate span metrics before sampling',
    ],
    whenNotToUse: [
      'Simple probabilistic sampling is sufficient',
      'You cannot tolerate the added latency of waiting for traces',
      'Operational complexity is a concern',
      'Low-volume scenarios where you can keep all traces',
    ],
    configuration: [
      {
        title: 'Two-Step Pipeline with Forward Connector',
        description: 'Required configuration to ensure metrics are calculated before sampling. The elasticapm connector must run before tail_sampling.',
        yaml: `connectors:
  elasticapm: {}
  forward: {}

processors:
  tail_sampling:
    decision_wait: 10s
    num_traces: 100
    expected_new_traces_per_sec: 10
    policies:
      - name: errors-policy
        type: status_code
        status_code:
          status_codes: [ERROR]
      - name: latency-policy
        type: latency
        latency:
          threshold_ms: 5000
          upper_threshold_ms: 10000
      - name: probabilistic-policy
        type: probabilistic
        probabilistic:
          sampling_percentage: 10

service:
  pipelines:
    traces/1-process-elastic:
      receivers: [otlp]
      processors: [batch]
      exporters: [elasticapm, forward]
    traces/2-tail-sampling:
      receivers: [forward]
      processors: [tail_sampling]
      exporters: [otlp/backend]`,
      },
      {
        title: 'Load-Balancing Collector (Upstream)',
        description: 'The upstream collector that routes traces by ID to the sampling tier.',
        yaml: `exporters:
  loadbalancing:
    routing_key: traceID
    protocol:
      otlp:
        tls:
          insecure: true
    resolver:
      dns:
        hostname: otel-sampling-headless.observability.svc.cluster.local
        port: 4317

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [loadbalancing]`,
      },
      {
        title: 'Complete Tail Sampling Architecture',
        description: 'Full downstream collector configuration with two-step pipeline for accurate metrics and sampling.',
        yaml: `# Downstream Tail-Sampling Collector
connectors:
  elasticapm: {}
  forward: {}

processors:
  tail_sampling:
    decision_wait: 10s
    num_traces: 100
    expected_new_traces_per_sec: 10
    policies:
      - name: latency-5000ms-10000ms
        type: latency
        latency:
          threshold_ms: 5000
          upper_threshold_ms: 10000
      - name: error-traces
        type: status_code
        status_code:
          status_codes: [ERROR]
      - name: default-sampling
        type: probabilistic
        probabilistic:
          sampling_percentage: 5

exporters:
  otlp/backend:
    endpoint: https://your-backend:443
    headers:
      Authorization: "Bearer token"

service:
  pipelines:
    # Step 1: Process with elasticapm for metrics
    traces/1-process-elastic:
      receivers: [otlp]
      processors: []
      exporters: [elasticapm, forward]
    # Step 2: Apply tail sampling
    traces/2-process-tbs:
      receivers: [forward]
      processors: [tail_sampling]
      exporters: [otlp/backend]`,
      },
    ],
    relatedLayers: ['agent-lb-sampling'],
    externalLinks: [
      { label: 'Tail Sampling Processor', url: 'https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/tailsamplingprocessor' },
      { label: 'Elastic Tail Sampling Guide', url: 'https://www.elastic.co/docs/reference/edot-collector/config/tail-based-sampling' },
      { label: 'Forward Connector', url: 'https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/connector/forwardconnector' },
    ],
  },
  {
    id: 'kafka',
    name: 'Kafka / Message Queue',
    shortDescription: 'Provides durable buffering and decoupling between collection and processing tiers.',
    description: `Apache Kafka (or similar message queues) acts as a durable buffer between the collection tier and the processing/indexing tier. This architecture provides resilience against backend outages, enables replay capabilities, and allows independent scaling of producers and consumers.`,
    whatItDoes: [
      'Provides durable, persistent buffering of telemetry',
      'Decouples collection from processing/indexing',
      'Enables replay of historical data for reprocessing',
      'Supports multi-consumer fan-out patterns',
      'Survives extended backend outages (hours/days)',
    ],
    whenToUse: [
      'Zero data loss is a hard requirement',
      'You need to survive extended backend outages',
      'You want replay capability for reprocessing',
      'You have multiple consumers for the same data',
      'You need to decouple scaling of collection and processing',
    ],
    whenNotToUse: [
      'You don\'t have Kafka expertise on the team',
      'Low-latency requirements (queuing adds latency)',
      'Simple deployments where complexity isn\'t justified',
      'Cost-sensitive environments',
    ],
    configuration: [
      {
        title: 'Kafka Exporter Configuration',
        description: 'Configure the collector to export telemetry to Kafka topics.',
        yaml: `exporters:
  kafka:
    brokers:
      - kafka-broker-1:9092
      - kafka-broker-2:9092
    topic: otel-traces
    encoding: otlp_proto
    producer:
      max_message_bytes: 1000000
      required_acks: -1  # Wait for all replicas

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [kafka]`,
      },
      {
        title: 'Kafka Receiver Configuration',
        description: 'Configure the collector to consume telemetry from Kafka topics.',
        yaml: `receivers:
  kafka:
    brokers:
      - kafka-broker-1:9092
      - kafka-broker-2:9092
    topic: otel-traces
    encoding: otlp_proto
    group_id: otel-gateway-consumer

service:
  pipelines:
    traces:
      receivers: [kafka]
      processors: [batch]
      exporters: [otlp/backend]`,
      },
    ],
    relatedLayers: ['agent-kafka-gateway'],
    externalLinks: [
      { label: 'Kafka Exporter', url: 'https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/kafkaexporter' },
      { label: 'Kafka Receiver', url: 'https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/kafkareceiver' },
    ],
  },
  {
    id: 'backend',
    name: 'Observability Backend',
    shortDescription: 'The destination system that stores, indexes, and visualizes your telemetry data.',
    description: `The observability backend is the final destination for your telemetry data. It stores traces, metrics, and logs, provides querying capabilities, and offers visualization through dashboards and explorers. Common backends include Elastic APM, Jaeger, Grafana Tempo, and cloud-native solutions.`,
    whatItDoes: [
      'Stores and indexes telemetry data',
      'Provides query interfaces for traces, metrics, and logs',
      'Offers visualization and dashboarding',
      'Enables alerting based on telemetry',
      'Correlates signals across traces, metrics, and logs',
    ],
    whenToUse: [
      'Always needed as the final destination for telemetry',
    ],
    relatedLayers: ['direct-to-backend', 'agent-only', 'gateway-only', 'agent-gateway', 'agent-kafka-gateway', 'agent-lb-sampling'],
    externalLinks: [
      { label: 'Elastic APM', url: 'https://www.elastic.co/observability/application-performance-monitoring' },
      { label: 'Jaeger', url: 'https://www.jaegertracing.io/' },
      { label: 'Grafana Tempo', url: 'https://grafana.com/oss/tempo/' },
    ],
  },
];

export function getComponent(id: ComponentId): Component | undefined {
  return components.find(c => c.id === id);
}

// Map diagram node types to component IDs
export function nodeTypeToComponentId(nodeType: string): ComponentId | null {
  const mapping: Record<string, ComponentId> = {
    'app': 'otel-sdk',
    'agent': 'agent-collector',
    'gateway': 'gateway-collector',
    'loadbalancer': 'loadbalancing-exporter',
    'kafka': 'kafka',
    'backend': 'backend',
  };
  return mapping[nodeType] || null;
}
