// 3-position slider with discrete options
export interface ThreePositionLever {
  id: string;
  name: string;
  description: string;
  icon: string;
  positions: {
    value: number | string;
    label: string;
    description: string;
  }[];
}

// Scale levers - 3 discrete positions
export const scaleLevers: ThreePositionLever[] = [
  {
    id: 'dataVolume',
    name: 'Data Volume',
    description: 'Expected telemetry throughput',
    icon: 'Activity',
    positions: [
      { value: 0, label: 'Low', description: '<1K events/sec' },
      { value: 50, label: 'Medium', description: '1K-50K events/sec' },
      { value: 100, label: 'High', description: '>50K events/sec' },
    ],
  },
  {
    id: 'latencyTolerance',
    name: 'Latency Tolerance',
    description: 'How quickly must data reach the backend?',
    icon: 'Clock',
    positions: [
      { value: 0, label: 'Real-time', description: 'Sub-second delivery' },
      { value: 50, label: 'Near real-time', description: 'Seconds delay OK' },
      { value: 100, label: 'Batch OK', description: 'Minutes delay OK' },
    ],
  },
];

// Resilience lever - now a 3-position slider
export const resilienceLever: ThreePositionLever = {
  id: 'dataLossPolicy',
  name: 'Data Resilience',
  description: 'How important is preventing data loss?',
  icon: 'Shield',
  positions: [
    { value: 'acceptable', label: 'Some Loss OK', description: 'Dev/test environments' },
    { value: 'minimize', label: 'Minimize Loss', description: 'Production workloads' },
    { value: 'zero', label: 'Zero Loss', description: 'Compliance/audit' },
  ],
};

// Capability toggles - what the pipeline needs to do
export interface CapabilityLever {
  id: string;
  name: string;
  description: string;
  impact: string;
  icon: string;
  category: 'app-collection' | 'infra-collection' | 'processing' | 'routing';
  isCollector?: boolean; // True if this capability involves an OTel Collector component
}

export const capabilityLevers: CapabilityLever[] = [
  // Application Collection capabilities
  {
    id: 'needsAppLogs',
    name: 'Application Logs',
    description: 'Collect logs emitted by your applications via OTLP',
    impact: 'Applications send logs directly via SDK or through collector',
    icon: 'FileText',
    category: 'app-collection',
    isCollector: false,
  },
  {
    id: 'needsAppTraces',
    name: 'Application Traces',
    description: 'Collect distributed traces from your applications',
    impact: 'Applications send traces via SDK - enables end-to-end request tracking',
    icon: 'GitCommit',
    category: 'app-collection',
    isCollector: false,
  },
  {
    id: 'needsAppMetrics',
    name: 'Application Metrics',
    description: 'Collect custom metrics from your applications',
    impact: 'Applications emit metrics via SDK for business and performance insights',
    icon: 'BarChart2',
    category: 'app-collection',
    isCollector: false,
  },
  // Infrastructure Collection capabilities
  {
    id: 'needsInfraLogs',
    name: 'Infrastructure Logs',
    description: 'Collect logs from disk (container logs, system logs)',
    impact: 'Requires DaemonSet agent with filelog receiver (not available on serverless K8s)',
    icon: 'HardDrive',
    category: 'infra-collection',
    isCollector: true,
  },
  {
    id: 'needsInfraMetrics',
    name: 'Infrastructure Metrics',
    description: 'Collect CPU, memory, disk, and network metrics from nodes',
    impact: 'Requires DaemonSet agent with hostmetrics receiver (not available on serverless K8s)',
    icon: 'Cpu',
    category: 'infra-collection',
    isCollector: true,
  },
  // Processing capabilities
  {
    id: 'needsCentralPolicy',
    name: 'Central Policy',
    description: 'Apply consistent filtering, transformation, and PII redaction',
    impact: 'Adds Gateway pool for centralized processing',
    icon: 'Shield',
    category: 'processing',
    isCollector: true,
  },
  {
    id: 'needsTailSampling',
    name: 'Tail Sampling',
    description: 'Intelligent sampling that keeps errors, slow traces, and samples the rest',
    impact: 'Adds Sampling Tier (StatefulSet) with load-balancing exporter for trace routing',
    icon: 'GitBranch',
    category: 'processing',
    isCollector: true,
  },
  // Routing capabilities
  {
    id: 'needsMultiBackend',
    name: 'Multiple Backends',
    description: 'Send telemetry to more than one destination',
    impact: 'Adds Gateway for centralized routing to multiple exporters',
    icon: 'Share2',
    category: 'routing',
    isCollector: true,
  },
  {
    id: 'needsMultiRegion',
    name: 'Multi-Region',
    description: 'Deploy across multiple regions with data sovereignty requirements',
    impact: 'Adds Regional Federation - regional gateways forward to global gateway',
    icon: 'Globe',
    category: 'routing',
    isCollector: true,
  },
];

// Environment constraints
export interface ConstraintLever {
  id: string;
  name: string;
  description: string;
  impact: string;
  icon: string;
}

export const constraintLevers: ConstraintLever[] = [
  {
    id: 'serverlessKubernetes',
    name: 'Serverless Kubernetes',
    description: 'Running on Fargate, Cloud Run, or similar (no DaemonSets)',
    impact: 'DaemonSet agents unavailable - must use Sidecar or Gateway-only patterns',
    icon: 'Cloud',
  },
  {
    id: 'needsPerServiceIsolation',
    name: 'Per-Service Isolation',
    description: 'Each service has its own collector with custom config',
    impact: 'Adds Sidecar agent per pod - higher resource overhead but better isolation',
    icon: 'Box',
  },
];

// Helper to get all capability IDs
export function getCapabilityIds(): string[] {
  return capabilityLevers.map(l => l.id);
}

// Helper to get capabilities by category
export function getCapabilitiesByCategory(category: CapabilityLever['category']): CapabilityLever[] {
  return capabilityLevers.filter(l => l.category === category);
}

// Helper to get position index from value
export function getPositionIndex(lever: ThreePositionLever, value: number | string): number {
  const idx = lever.positions.findIndex(p => p.value === value);
  return idx >= 0 ? idx : 0;
}

// Helper to get value from position index
export function getValueFromIndex(lever: ThreePositionLever, index: number): number | string {
  return lever.positions[index]?.value ?? lever.positions[0].value;
}
