// Composition logic for building OTel architectures from layers

import {
  Layer,
  DiagramNode,
  DiagramEdge,
  getLayer,
} from './layers';

export type DataLossPolicy = 'acceptable' | 'minimize' | 'zero';
export type EnvironmentType = 'kubernetes' | 'host';
export type VolumeTier = 'low' | 'medium' | 'high';

export interface VolumeProfile {
  tier: VolumeTier;
  replicas: string;
  placement: string;
  loadBalancerType: string;
}

export interface Requirements {
  // Environment
  environmentType: EnvironmentType;

  // Scale
  dataVolume: number;           // 0-100
  
  // Application Collection
  needsAppLogs: boolean;
  needsAppTraces: boolean;
  needsAppMetrics: boolean;
  
  // Infrastructure Collection
  needsInfraLogs: boolean;
  needsInfraMetrics: boolean;
  
  // Processing capabilities
  needsCentralPolicy: boolean;
  needsMultiBackend: boolean;
  needsTailSampling: boolean;
  
  // Resilience
  dataLossPolicy: DataLossPolicy;
  
  // Environment constraints (Kubernetes-only)
  serverlessKubernetes: boolean;
  needsPerServiceIsolation: boolean;
}

export interface ComposedArchitecture {
  edge: Layer[];
  processing: Layer[];
  buffering: Layer;
  requirements: Requirements;
  needsLoadBalancer: boolean;
  volumeProfile: VolumeProfile;
  // Computed outputs
  diagram: { nodes: DiagramNode[]; edges: DiagramEdge[] };
  configSnippets: {
    agent?: string;
    gateway?: string;
    kubernetes?: string;
  };
  warnings: string[];
  recommendations: string[];
  complexity: 'Low' | 'Medium' | 'High' | 'Very High';
}

export const defaultRequirements: Requirements = {
  environmentType: 'kubernetes',
  dataVolume: 0,
  // Application collection - all on by default
  needsAppLogs: true,
  needsAppTraces: true,
  needsAppMetrics: true,
  // Infrastructure collection - off by default
  needsInfraLogs: false,
  needsInfraMetrics: false,
  // Processing
  needsCentralPolicy: false,
  needsMultiBackend: false,
  needsTailSampling: false,
  // Resilience
  dataLossPolicy: 'acceptable',
  // Constraints
  serverlessKubernetes: false,
  needsPerServiceIsolation: false,
};

/**
 * Main composition function - builds an architecture from requirements
 */
export function composeArchitecture(requirements: Requirements): ComposedArchitecture {
  const arch: ComposedArchitecture = {
    edge: [],
    processing: [],
    buffering: getLayer('memory-queue')!,
    requirements,
    needsLoadBalancer: false,
    volumeProfile: getVolumeProfile(requirements.dataVolume),
    diagram: { nodes: [], edges: [] },
    configSnippets: {},
    warnings: [],
    recommendations: [],
    complexity: 'Low',
  };

  // Step 1: Determine Edge Layer(s)
  determineEdgeLayers(requirements, arch);

  // Step 2: Determine Processing Layer(s)
  determineProcessingLayers(requirements, arch);

  // Step 3: Determine Buffering Layer
  determineBufferingLayer(requirements, arch);

  // Step 4: Add volume-based recommendations
  addVolumeRecommendations(arch);

  // Step 5: Calculate complexity
  arch.complexity = calculateComplexity(arch);

  // Step 6: Build combined diagram
  arch.diagram = buildCombinedDiagram(arch);

  // Step 7: Merge config snippets
  arch.configSnippets = mergeConfigSnippets(arch);

  return arch;
}

function getVolumeProfile(dataVolume: number): VolumeProfile {
  if (dataVolume >= 100) {
    return {
      tier: 'high',
      replicas: '5-20+',
      placement: 'Dedicated node pool or separate gateway cluster',
      loadBalancerType: 'L7 load balancer (NGINX/Envoy)',
    };
  }
  if (dataVolume >= 50) {
    return {
      tier: 'medium',
      replicas: '3-5',
      placement: 'Same cluster, dedicated node pool',
      loadBalancerType: 'Standard K8s Service',
    };
  }
  return {
    tier: 'low',
    replicas: '2',
    placement: 'Same cluster as applications',
    loadBalancerType: 'Standard K8s Service',
  };
}

function determineEdgeLayers(requirements: Requirements, arch: ComposedArchitecture): void {
  const needsInfraCollection = requirements.needsInfraLogs || requirements.needsInfraMetrics;

  if (requirements.environmentType === 'host') {
    // Host / VM environment — standalone collector, no DaemonSet or Sidecar
    if (needsInfraCollection) {
      arch.edge.push(getLayer('host-agent')!);
      arch.recommendations.push(
        'Host agent runs as a systemd service collecting host metrics (hostmetrics receiver) ' +
        'and local logs (filelog receiver). Applications export to localhost:4317.'
      );
    } else {
      // No infra collection — still recommend a local agent for buffering
      arch.edge.push(getLayer('host-agent')!);
      arch.recommendations.push(
        'A local host agent is recommended even without infrastructure collection — it provides ' +
        'buffering, retry, and resource detection for application telemetry.'
      );
    }
  } else if (requirements.serverlessKubernetes) {
    // Serverless K8s — no DaemonSet
    if (needsInfraCollection) {
      arch.warnings.push(
        'Infrastructure collection (host metrics, disk logs) is unavailable on serverless Kubernetes. ' +
        'DaemonSet agents cannot run on Fargate/Cloud Run. Consider using cloud provider metrics instead.'
      );
    }

    if (requirements.needsPerServiceIsolation) {
      arch.edge.push(getLayer('sidecar-agent')!);
    } else {
      arch.edge.push(getLayer('direct-sdk')!);
    }
  } else {
    // Standard Kubernetes — can use DaemonSet
    if (needsInfraCollection) {
      arch.edge.push(getLayer('daemonset-agent')!);
      if (requirements.needsInfraLogs && requirements.needsInfraMetrics) {
        arch.recommendations.push(
          'DaemonSet agent will collect both infrastructure logs (filelog receiver) and ' +
          'host metrics (hostmetrics receiver) from each node.'
        );
      }
    }

    if (requirements.needsPerServiceIsolation) {
      arch.edge.push(getLayer('sidecar-agent')!);
      if (needsInfraCollection) {
        arch.recommendations.push(
          'Running both DaemonSet and Sidecar agents: DaemonSet collects infrastructure telemetry, ' +
          'Sidecar provides per-service isolation for application telemetry. Both forward to the same gateway.'
        );
      }
    }

    // Default to direct SDK if no edge collector needed
    if (arch.edge.length === 0) {
      arch.edge.push(getLayer('direct-sdk')!);
    }
  }
}

function determineProcessingLayers(requirements: Requirements, arch: ComposedArchitecture): void {
  const needsGateway = 
    requirements.needsCentralPolicy ||
    requirements.needsMultiBackend ||
    requirements.dataLossPolicy !== 'acceptable' ||
    requirements.dataVolume >= 50;

  if (needsGateway) {
    arch.processing.push(getLayer('gateway-pool')!);
    arch.needsLoadBalancer = true;
  }

  if (requirements.needsTailSampling) {
    arch.processing.push(getLayer('sampling-tier')!);
    arch.recommendations.push(
      'Tail sampling requires the loadbalancingexporter with routing_key: traceID. ' +
      'All spans of a trace must reach the same sampling collector.'
    );
    
    if (requirements.needsMultiBackend) {
      arch.warnings.push(
        'Note: spanmetrics connector requires routing_key: service, which is incompatible with ' +
        'tail sampling (traceID routing). Consider running spanmetrics on the agent tier before sampling.'
      );
    }
  }

  // If no processing needed, explicitly set to none
  if (arch.processing.length === 0) {
    const noneLayer = getLayer('none');
    if (noneLayer) {
      arch.processing.push(noneLayer);
    }
  }
}

function determineBufferingLayer(requirements: Requirements, arch: ComposedArchitecture): void {
  if (requirements.dataLossPolicy === 'zero') {
    arch.buffering = getLayer('kafka-buffer')!;
    arch.recommendations.push(
      'Kafka provides the strongest durability guarantee. Use partition_traces_by_id: true ' +
      'if you need tail sampling downstream. Ensure Kafka topic partitions >= consumer replicas.'
    );
    arch.warnings.push(
      'Kafka adds operational complexity. Ensure your team has Kafka expertise or consider ' +
      'a managed Kafka service.'
    );
  } else if (requirements.dataLossPolicy === 'minimize') {
    arch.buffering = getLayer('persistent-queue')!;
    arch.recommendations.push(
      'Persistent queues (file_storage extension) survive collector restarts. ' +
      'Requires StatefulSet with PVC in Kubernetes.'
    );
  }
  // Default is memory-queue, already set
}

function addVolumeRecommendations(arch: ComposedArchitecture): void {
  const hasGateway = arch.processing.some(p => p.id === 'gateway-pool');
  if (!hasGateway) return;

  const { tier } = arch.volumeProfile;

  if (tier === 'low') {
    arch.recommendations.push(
      '2 gateway replicas co-located with application workloads. ' +
      'Standard Kubernetes Service provides load balancing.'
    );
  } else if (tier === 'medium') {
    arch.recommendations.push(
      '3-5 gateway replicas on a dedicated node pool. ' +
      'Use node affinity and taints to isolate collector workloads from application pods.'
    );
  } else {
    arch.recommendations.push(
      '5-20+ gateway replicas on a dedicated node pool or separate gateway cluster. ' +
      'Use an L7 load balancer (NGINX, Envoy) for advanced traffic management and backpressure handling. ' +
      'Consider head sampling at the SDK or agent tier to reduce load before gateway processing.'
    );
  }
}

function calculateComplexity(arch: ComposedArchitecture): 'Low' | 'Medium' | 'High' | 'Very High' {
  const hasGateway = arch.processing.some(p => p.id === 'gateway-pool');
  const hasSampling = arch.processing.some(p => p.id === 'sampling-tier');
  const hasKafka = arch.buffering.id === 'kafka-buffer';
  const hasPersistentQueue = arch.buffering.id === 'persistent-queue';
  const hasDaemonSet = arch.edge.some(e => e.id === 'daemonset-agent');
  const hasSidecar = arch.edge.some(e => e.id === 'sidecar-agent');
  const multipleEdge = arch.edge.length > 1;
  const volumeTier = arch.volumeProfile.tier;

  // Kafka or tail sampling are always High+ — dedicated infrastructure to operate
  if (hasKafka || hasSampling) {
    // Kafka + sampling together, or either combined with high volume = Very High
    if ((hasKafka && hasSampling) || (hasKafka && volumeTier === 'high') || (hasSampling && volumeTier === 'high')) {
      return 'Very High';
    }
    return 'High';
  }

  // High-volume gateway (dedicated node pool/cluster, L7 LB) = High
  if (hasGateway && volumeTier === 'high') {
    return 'High';
  }

  // Medium-volume gateway (dedicated node pool) or gateway + WAL = Medium
  if (hasGateway) {
    if (volumeTier === 'medium' || hasPersistentQueue || multipleEdge) {
      return 'Medium';
    }
    // Low-volume gateway with simple edge = Low-Medium boundary
    if (hasDaemonSet || hasSidecar) {
      return 'Medium';
    }
    return 'Low';
  }

  // No gateway — edge-only architectures
  if (multipleEdge || hasSidecar) return 'Medium';
  if (hasDaemonSet) return 'Low';

  return 'Low';
}

/**
 * Build a combined diagram from all active layers
 */
function buildCombinedDiagram(arch: ComposedArchitecture): { nodes: DiagramNode[]; edges: DiagramEdge[] } {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];
  const addedNodeIds = new Set<string>();

  // Helper to add node if not already added
  const addNode = (node: DiagramNode, prefix?: string) => {
    const id = prefix ? `${prefix}-${node.id}` : node.id;
    if (!addedNodeIds.has(id)) {
      addedNodeIds.add(id);
      nodes.push({ ...node, id });
    }
    return id;
  };

  // Track the last node(s) for connecting layers
  let previousNodeIds: string[] = [];

  // Add edge layer nodes
  arch.edge.forEach((layer, idx) => {
    const prefix = arch.edge.length > 1 ? `edge${idx}` : undefined;
    
    layer.diagramNodes.forEach(node => {
      addNode(node, prefix);
    });
    
    // Connect internal edges
    layer.diagramEdges.forEach(edge => {
        const fromId = prefix ? `${prefix}-${edge.from}` : edge.from;
        const toId = prefix ? `${prefix}-${edge.to}` : edge.to;
        edges.push({ from: fromId, to: toId, label: edge.label });
      });

    // Track the last node of this edge layer
    if (layer.diagramNodes.length > 0) {
      const lastNode = layer.diagramNodes[layer.diagramNodes.length - 1];
      previousNodeIds.push(prefix ? `${prefix}-${lastNode.id}` : lastNode.id);
    }
  });

  // Add buffering layer if Kafka (it goes between edge and processing)
  if (arch.buffering.id === 'kafka-buffer') {
    arch.buffering.diagramNodes.forEach(node => {
      addNode(node);
    });
    // Connect from edge layers to Kafka
    previousNodeIds.forEach(prevId => {
      edges.push({ from: prevId, to: 'kafka' });
    });
    previousNodeIds = ['kafka'];
  }

  // Add processing layer nodes
  const activeProcessing = arch.processing.filter(p => p.id !== 'none');
  activeProcessing.forEach((layer) => {
    layer.diagramNodes.forEach(node => {
      addNode(node);
    });

    // Connect internal edges
    layer.diagramEdges.forEach(edge => {
      edges.push({ from: edge.from, to: edge.to, label: edge.label });
    });

    // Connect from previous layer
    if (layer.diagramNodes.length > 0) {
      const firstNode = layer.diagramNodes[0];
      previousNodeIds.forEach(prevId => {
        edges.push({ from: prevId, to: firstNode.id });
      });
      
      // Update previous for next iteration
      const lastNode = layer.diagramNodes[layer.diagramNodes.length - 1];
      previousNodeIds = [lastNode.id];
    }
  });

  // Add backend node
  const backendId = addNode({ id: 'backend', type: 'backend', label: 'Backend' });
  previousNodeIds.forEach(prevId => {
    edges.push({ from: prevId, to: backendId, label: 'OTLP' });
  });

  // If no processing and no Kafka, connect edge directly to backend
  if (activeProcessing.length === 0 && arch.buffering.id !== 'kafka-buffer') {
    // Edges were already pointing to backend via previousNodeIds
  }

  return { nodes, edges };
}

/**
 * Merge config snippets from all active layers
 */
function mergeConfigSnippets(arch: ComposedArchitecture): { agent?: string; gateway?: string; kubernetes?: string } {
  const configs: { agent: string[]; gateway: string[]; kubernetes: string[] } = {
    agent: [],
    gateway: [],
    kubernetes: [],
  };

  // Collect from edge layers
  arch.edge.forEach(layer => {
    if (layer.configSnippets.agent) {
      configs.agent.push(`# === ${layer.name} ===\n${layer.configSnippets.agent}`);
    }
    if (layer.configSnippets.gateway) {
      configs.gateway.push(`# === ${layer.name} ===\n${layer.configSnippets.gateway}`);
    }
    if (layer.configSnippets.kubernetes) {
      configs.kubernetes.push(`# === ${layer.name} ===\n${layer.configSnippets.kubernetes}`);
    }
  });

  // Collect from processing layers
  arch.processing.filter(p => p.id !== 'none').forEach(layer => {
    if (layer.configSnippets.agent) {
      configs.agent.push(`# === ${layer.name} ===\n${layer.configSnippets.agent}`);
    }
    if (layer.configSnippets.gateway) {
      configs.gateway.push(`# === ${layer.name} ===\n${layer.configSnippets.gateway}`);
    }
    if (layer.configSnippets.kubernetes) {
      configs.kubernetes.push(`# === ${layer.name} ===\n${layer.configSnippets.kubernetes}`);
    }
  });

  // Collect from buffering layer
  if (arch.buffering.configSnippets.agent) {
    configs.agent.push(`# === ${arch.buffering.name} ===\n${arch.buffering.configSnippets.agent}`);
  }
  if (arch.buffering.configSnippets.gateway) {
    configs.gateway.push(`# === ${arch.buffering.name} ===\n${arch.buffering.configSnippets.gateway}`);
  }
  if (arch.buffering.configSnippets.kubernetes) {
    configs.kubernetes.push(`# === ${arch.buffering.name} ===\n${arch.buffering.configSnippets.kubernetes}`);
  }

  return {
    agent: configs.agent.length > 0 ? configs.agent.join('\n\n') : undefined,
    gateway: configs.gateway.length > 0 ? configs.gateway.join('\n\n') : undefined,
    kubernetes: configs.kubernetes.length > 0 ? configs.kubernetes.join('\n\n') : undefined,
  };
}

/**
 * Get a human-readable summary of the architecture
 */
export function getArchitectureSummary(arch: ComposedArchitecture): string {
  const parts: string[] = [];
  
  // Edge
  const edgeNames = arch.edge.map(e => e.name).join(' + ');
  parts.push(`Edge: ${edgeNames}`);
  
  // Processing
  const processingNames = arch.processing
    .filter(p => p.id !== 'none')
    .map(p => p.name)
    .join(' → ');
  if (processingNames) {
    parts.push(`Processing: ${processingNames}`);
  }
  
  // Buffering
  if (arch.buffering.id !== 'memory-queue') {
    parts.push(`Buffering: ${arch.buffering.name}`);
  }
  
  return parts.join(' | ');
}

/**
 * Check if a specific capability is provided by the architecture
 */
export function architectureProvides(arch: ComposedArchitecture, capability: string): boolean {
  const allLayers = [...arch.edge, ...arch.processing, arch.buffering];
  return allLayers.some(layer => layer.provides.includes(capability));
}

/**
 * Get all capabilities provided by the architecture
 */
export function getArchitectureCapabilities(arch: ComposedArchitecture): string[] {
  const capabilities = new Set<string>();
  const allLayers = [...arch.edge, ...arch.processing, arch.buffering];
  allLayers.forEach(layer => {
    layer.provides.forEach(cap => capabilities.add(cap));
  });
  return Array.from(capabilities);
}
