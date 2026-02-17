import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowRight, Database, HardDrive, Zap } from 'lucide-react';
import { ComposedArchitecture } from '../../data/composer';
import { CollectorIcon } from '../UI/OTelLogo';

interface PipelineDiagramProps {
  architecture: ComposedArchitecture;
}

// Color mapping for node types
const nodeColors: Record<string, string> = {
  app: 'bg-blue-500/20 border-blue-500 text-blue-400',
  agent: 'bg-green-500/20 border-green-500 text-green-400',
  sidecar: 'bg-purple-500/20 border-purple-500 text-purple-400',
  gateway: 'bg-orange-500/20 border-orange-500 text-orange-400',
  loadbalancer: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
  kafka: 'bg-red-500/20 border-red-500 text-red-400',
  backend: 'bg-cyan-500/20 border-cyan-500 text-cyan-400',
};

// Types that represent OTel Collectors
const collectorTypes = new Set(['agent', 'sidecar', 'gateway', 'loadbalancer']);

export function PipelineDiagram({ architecture }: PipelineDiagramProps) {
  const [showDetailed, setShowDetailed] = useState(false);

  return (
    <div className="space-y-4">
      {/* Summary View - Always visible */}
      <SummaryView architecture={architecture} />
      
      {/* Toggle for detailed view */}
      <button
        onClick={() => setShowDetailed(!showDetailed)}
        className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--otel-blue)] transition-colors"
      >
        {showDetailed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {showDetailed ? 'Hide detailed diagram' : 'Show detailed diagram'}
      </button>

      {/* Detailed View - Expandable */}
      {showDetailed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <DetailedView architecture={architecture} />
        </motion.div>
      )}
    </div>
  );
}

// Summary view showing layer boxes - only show categories with components
function SummaryView({ architecture }: { architecture: ComposedArchitecture }) {
  const layers: Array<{
    name: string;
    items: string[];
    color: string;
    bgColor: string;
  }> = [];

  // Edge layer - check if it's not just direct SDK (which means no collector)
  const hasEdgeCollector = architecture.edge.some(e => e.id !== 'direct-sdk');
  if (hasEdgeCollector) {
    layers.push({
      name: 'Edge',
      items: architecture.edge.filter(e => e.id !== 'direct-sdk').map(l => l.name),
      color: 'border-green-500',
      bgColor: 'bg-green-500/10',
    });
  }

  // Processing layer - only if there are active processing layers
  const activeProcessing = architecture.processing.filter(p => p.id !== 'none');
  if (activeProcessing.length > 0) {
    layers.push({
      name: 'Processing',
      items: activeProcessing.map(l => l.name),
      color: 'border-orange-500',
      bgColor: 'bg-orange-500/10',
    });
  }

  // Buffering layer - only if not default memory queue
  if (architecture.buffering.id !== 'memory-queue') {
    layers.push({
      name: 'Buffering',
      items: [architecture.buffering.name],
      color: 'border-red-500',
      bgColor: 'bg-red-500/10',
    });
  }

  // Always show backend
  layers.push({
    name: 'Backend',
    items: ['Your Destination'],
    color: 'border-cyan-500',
    bgColor: 'bg-cyan-500/10',
  });

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 py-4">
      {layers.map((layer, idx) => (
        <motion.div
          key={layer.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex items-center gap-2 md:gap-4"
        >
          <div className={`px-4 py-3 rounded-lg border-2 ${layer.color} ${layer.bgColor} min-w-[120px] text-center`}>
            <div className="text-xs font-medium text-[var(--text-secondary)] mb-1">
              {layer.name}
            </div>
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              {layer.items.join(' + ')}
            </div>
          </div>
          {idx < layers.length - 1 && (
            <ArrowRight className="text-[var(--text-secondary)] flex-shrink-0" size={20} />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Detailed view showing individual nodes with symmetric boxes
function DetailedView({ architecture }: { architecture: ComposedArchitecture }) {
  const { nodes, edges } = architecture.diagram;

  if (nodes.length === 0) {
    return (
      <div className="text-center text-[var(--text-secondary)] py-8">
        No diagram available
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-tertiary)] rounded-lg p-6 overflow-x-auto">
      <div className="flex items-center justify-start gap-4 min-w-max">
        {nodes.map((node, idx) => {
          const colorClass = nodeColors[node.type] || nodeColors.agent;
          const isCollector = collectorTypes.has(node.type);
          
          // Find edges that end at this node to get labels
          const incomingEdge = edges.find(e => e.to === node.id);
          
          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-4"
            >
              {/* Edge label (if any) */}
              {idx > 0 && (
                <div className="flex flex-col items-center">
                  <ArrowRight className="text-[var(--text-secondary)]" size={24} />
                  {incomingEdge?.label && (
                    <span className="text-xs text-[var(--text-secondary)] whitespace-pre-line text-center mt-1">
                      {incomingEdge.label}
                    </span>
                  )}
                </div>
              )}
              
              {/* Node - fixed size for symmetry */}
              <div className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 ${colorClass} w-[100px] h-[100px]`}>
                {isCollector ? (
                  <CollectorIcon size={28} className="mb-2" />
                ) : node.type === 'app' ? (
                  <Zap size={28} className="mb-2" />
                ) : node.type === 'kafka' ? (
                  <Database size={28} className="mb-2" />
                ) : (
                  <HardDrive size={28} className="mb-2" />
                )}
                <span className="text-xs font-medium text-center whitespace-pre-line leading-tight">
                  {node.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
        <div className="text-xs text-[var(--text-secondary)] mb-2">Legend:</div>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-blue-500/20 border border-blue-500/50 text-blue-400">
              <Zap size={14} />
            </div>
            <span className="text-xs text-[var(--text-secondary)]">App</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-green-500/20 border border-green-500/50 text-green-400">
              <CollectorIcon size={14} />
            </div>
            <span className="text-xs text-[var(--text-secondary)]">Agent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-purple-500/20 border border-purple-500/50 text-purple-400">
              <CollectorIcon size={14} />
            </div>
            <span className="text-xs text-[var(--text-secondary)]">Sidecar</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-orange-500/20 border border-orange-500/50 text-orange-400">
              <CollectorIcon size={14} />
            </div>
            <span className="text-xs text-[var(--text-secondary)]">Gateway</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-yellow-500/20 border border-yellow-500/50 text-yellow-400">
              <CollectorIcon size={14} />
            </div>
            <span className="text-xs text-[var(--text-secondary)]">Loadbalancer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-red-500/20 border border-red-500/50 text-red-400">
              <Database size={14} />
            </div>
            <span className="text-xs text-[var(--text-secondary)]">Kafka</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-cyan-500/20 border border-cyan-500/50 text-cyan-400">
              <HardDrive size={14} />
            </div>
            <span className="text-xs text-[var(--text-secondary)]">Backend</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for smaller spaces
export function CompactPipelineDiagram({ architecture }: PipelineDiagramProps) {
  const parts: string[] = [];
  
  // Edge - only if not just direct SDK
  const edgeCollectors = architecture.edge.filter(e => e.id !== 'direct-sdk');
  if (edgeCollectors.length > 0) {
    parts.push(edgeCollectors.map(e => e.name.split(' ')[0]).join('+'));
  }
  
  // Processing
  const processing = architecture.processing.filter(p => p.id !== 'none');
  if (processing.length > 0) {
    parts.push(processing.map(p => p.name.split(' ')[0]).join('→'));
  }
  
  // Buffering (only if not default)
  if (architecture.buffering.id !== 'memory-queue') {
    parts.push(architecture.buffering.name.split(' ')[0]);
  }
  
  parts.push('Backend');
  
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
      {parts.map((part, idx) => (
        <span key={idx} className="flex items-center gap-2">
          {idx > 0 && <ArrowRight size={14} />}
          <span>{part}</span>
        </span>
      ))}
    </div>
  );
}
