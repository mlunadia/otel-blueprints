import { motion } from 'framer-motion';
import { Zap, HardDrive, Database } from 'lucide-react';
import { DiagramNode, DiagramEdge } from '../../data/layers';
import { CollectorIcon } from '../UI/OTelLogo';

interface Diagram {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

interface ArchitectureDiagramProps {
  diagram: Diagram;
  compact?: boolean;
}

const nodeColors: Record<string, { bg: string; border: string; text: string }> = {
  app: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400' },
  agent: { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-400' },
  sidecar: { bg: 'bg-purple-500/20', border: 'border-purple-500/50', text: 'text-purple-400' },
  gateway: { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400' },
  loadbalancer: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400' },
  kafka: { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400' },
  backend: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', text: 'text-cyan-400' },
};

const legendColors: Record<string, { bg: string; border: string; label: string }> = {
  app: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', label: 'Application' },
  agent: { bg: 'bg-green-500/20', border: 'border-green-500/50', label: 'DaemonSet Agent' },
  sidecar: { bg: 'bg-purple-500/20', border: 'border-purple-500/50', label: 'Sidecar Agent' },
  gateway: { bg: 'bg-orange-500/20', border: 'border-orange-500/50', label: 'Gateway' },
  loadbalancer: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', label: 'Load Balancer' },
  kafka: { bg: 'bg-red-500/20', border: 'border-red-500/50', label: 'Kafka' },
  backend: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', label: 'Backend' },
};

// Types that represent OTel Collectors
const collectorTypes = new Set(['agent', 'sidecar', 'gateway', 'loadbalancer']);

function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center mx-2">
      {/* Label above the arrow */}
      {label && (
        <span className="text-[10px] text-[var(--text-secondary)] mb-1 whitespace-nowrap">
          {label}
        </span>
      )}
      {/* Arrow line with arrowhead */}
      <svg width="60" height="12" viewBox="0 0 60 12" className="flex-shrink-0">
        <line
          x1="0"
          y1="6"
          x2="50"
          y2="6"
          stroke="var(--text-secondary)"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
        <polygon
          points="50,2 58,6 50,10"
          fill="var(--text-secondary)"
        />
      </svg>
    </div>
  );
}

function Node({ 
  type, 
  label, 
  compact = false 
}: { 
  type: string; 
  label: string; 
  compact?: boolean;
}) {
  const colors = nodeColors[type] || { bg: 'bg-gray-500/20', border: 'border-gray-500/50', text: 'text-gray-400' };
  const isCollector = collectorTypes.has(type);
  const iconSize = compact ? 20 : 24;
  // Fixed box size for symmetry
  const boxSize = compact ? 'w-[80px] h-[80px]' : 'w-[100px] h-[100px]';

  const renderIcon = () => {
    if (isCollector) {
      return <CollectorIcon size={iconSize} />;
    }
    if (type === 'app') {
      return <Zap size={iconSize} />;
    }
    if (type === 'kafka') {
      return <Database size={iconSize} />;
    }
    return <HardDrive size={iconSize} />;
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`${boxSize} rounded-lg border-2 flex flex-col items-center justify-center p-2 ${colors.bg} ${colors.border} ${colors.text}`}>
        {renderIcon()}
        <div className="mt-2 text-center">
          {label.split('\n').map((line, i) => (
            <div
              key={i}
              className={`${compact ? 'text-[10px]' : 'text-xs'} text-[var(--text-primary)] whitespace-nowrap leading-tight`}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ArchitectureDiagram({ diagram, compact = false }: ArchitectureDiagramProps) {
  const { nodes, edges } = diagram;

  if (!nodes || nodes.length === 0) {
    return (
      <div className={`bg-[var(--bg-tertiary)] rounded-xl ${compact ? 'p-4' : 'p-6'} text-center text-[var(--text-secondary)]`}>
        No diagram available
      </div>
    );
  }

  // Build a map of edge labels by from->to
  const edgeLabels = new Map<string, string>();
  edges.forEach(edge => {
    edgeLabels.set(`${edge.from}->${edge.to}`, edge.label || 'OTLP');
  });

  // Get unique node types for legend
  const uniqueTypes = [...new Set(nodes.map(n => n.type))];

  return (
    <div className={`bg-[var(--bg-tertiary)] rounded-xl ${compact ? 'p-4' : 'p-6'}`}>
      {/* Diagram using flexbox for proper centering */}
      <div className={`flex items-center justify-center ${compact ? 'py-4' : 'py-8'} overflow-x-auto`}>
        <div className="flex items-center">
          {nodes.map((node, idx) => {
            const nextNode = nodes[idx + 1];
            const edgeKey = nextNode ? `${node.id}->${nextNode.id}` : null;
            const edgeLabel = edgeKey ? edgeLabels.get(edgeKey) : null;

            return (
              <div key={node.id} className="flex items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  <Node type={node.type} label={node.label} compact={compact} />
                </motion.div>
                
                {/* Arrow to next node */}
                {nextNode && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 + 0.15 }}
                    className="mx-3"
                  >
                    <Arrow label={edgeLabel || undefined} />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend - only show in non-compact mode */}
      {!compact && (
        <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex flex-wrap gap-4 justify-center">
          {uniqueTypes.map(type => {
            const legend = legendColors[type];
            if (!legend) return null;
            const isCollector = collectorTypes.has(type);
            return (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded ${legend.bg} border ${legend.border} flex items-center justify-center`}>
                  {isCollector ? (
                    <CollectorIcon size={14} className={nodeColors[type]?.text || 'text-gray-400'} />
                  ) : type === 'app' ? (
                    <Zap size={14} className={nodeColors[type]?.text || 'text-gray-400'} />
                  ) : type === 'kafka' ? (
                    <Database size={14} className={nodeColors[type]?.text || 'text-gray-400'} />
                  ) : (
                    <HardDrive size={14} className={nodeColors[type]?.text || 'text-gray-400'} />
                  )}
                </div>
                <span className="text-xs text-[var(--text-secondary)]">{legend.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
