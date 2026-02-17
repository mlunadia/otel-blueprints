import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check, Server, Box, Layers, Database, HardDrive, Zap, Globe, GitBranch, MinusCircle, Cpu } from 'lucide-react';
import { Layer, LayerType } from '../../data/layers';

interface LayerCardProps {
  layer: Layer;
  layerType: LayerType;
  index?: number;
}

// Icon mapping
const layerIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Zap,
  Server,
  Box,
  Layers,
  Database,
  HardDrive,
  Globe,
  GitBranch,
  MinusCircle,
  Cpu,
};

// Color mapping for layer types
const layerTypeColors: Record<LayerType, { border: string; bg: string; badge: string }> = {
  edge: {
    border: 'border-green-500/50',
    bg: 'bg-green-500/5',
    badge: 'bg-green-500/20 text-green-400',
  },
  processing: {
    border: 'border-orange-500/50',
    bg: 'bg-orange-500/5',
    badge: 'bg-orange-500/20 text-orange-400',
  },
  buffering: {
    border: 'border-red-500/50',
    bg: 'bg-red-500/5',
    badge: 'bg-red-500/20 text-red-400',
  },
};

export function LayerCard({ layer, layerType, index = 0 }: LayerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState<string | null>(null);

  const colors = layerTypeColors[layerType];
  const Icon = layerIcons[layer.icon] || Server;

  const handleCopyConfig = async (configType: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedConfig(configType);
    setTimeout(() => setCopiedConfig(null), 2000);
  };

  const hasConfigs = layer.configSnippets.agent || layer.configSnippets.gateway || layer.configSnippets.kubernetes;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-lg border ${colors.border} ${colors.bg} overflow-hidden`}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-start gap-4 text-left hover:bg-[var(--bg-tertiary)]/50 transition-colors"
      >
        <div className={`p-2 rounded-lg ${colors.badge}`}>
          <Icon size={20} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded ${colors.badge}`}>
              {layerType.charAt(0).toUpperCase() + layerType.slice(1)}
            </span>
            <h4 className="font-semibold text-[var(--text-primary)]">
              {layer.name}
            </h4>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            {layer.description}
          </p>
          
          {/* Capabilities preview */}
          {layer.provides.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {layer.provides.slice(0, 3).map(cap => (
                <span
                  key={cap}
                  className="text-xs px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                >
                  {cap.replace(/-/g, ' ')}
                </span>
              ))}
              {layer.provides.length > 3 && (
                <span className="text-xs text-[var(--text-secondary)]">
                  +{layer.provides.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 text-[var(--text-secondary)]">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-[var(--border-color)]"
        >
          <div className="p-4 space-y-4">
            {/* Capabilities */}
            {layer.provides.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-[var(--text-primary)] mb-2">
                  Provides
                </h5>
                <div className="flex flex-wrap gap-2">
                  {layer.provides.map(cap => (
                    <span
                      key={cap}
                      className="text-xs px-2 py-1 rounded bg-[var(--otel-blue)]/20 text-[var(--otel-blue)]"
                    >
                      {cap.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {layer.requires.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-[var(--text-primary)] mb-2">
                  Requires
                </h5>
                <div className="flex flex-wrap gap-2">
                  {layer.requires.map(req => (
                    <span
                      key={req}
                      className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400"
                    >
                      {req.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resource sizing */}
            {layer.resources && (
              <div>
                <h5 className="text-sm font-medium text-[var(--text-primary)] mb-2">
                  Resource Sizing
                </h5>
                <div className="text-sm text-[var(--text-secondary)] space-y-1">
                  <div>CPU: {layer.resources.cpu}</div>
                  <div>Memory: {layer.resources.memory}</div>
                  {layer.resources.replicas && (
                    <div>Recommended replicas: {layer.resources.replicas}+</div>
                  )}
                </div>
              </div>
            )}

            {/* Config snippets */}
            {hasConfigs && (
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-[var(--text-primary)]">
                  Configuration
                </h5>
                
                {layer.configSnippets.agent && (
                  <ConfigSnippet
                    title="Agent Config"
                    content={layer.configSnippets.agent}
                    configType="agent"
                    copiedConfig={copiedConfig}
                    onCopy={handleCopyConfig}
                  />
                )}
                
                {layer.configSnippets.gateway && (
                  <ConfigSnippet
                    title="Gateway Config"
                    content={layer.configSnippets.gateway}
                    configType="gateway"
                    copiedConfig={copiedConfig}
                    onCopy={handleCopyConfig}
                  />
                )}
                
                {layer.configSnippets.kubernetes && (
                  <ConfigSnippet
                    title="Kubernetes Manifest"
                    content={layer.configSnippets.kubernetes}
                    configType="kubernetes"
                    copiedConfig={copiedConfig}
                    onCopy={handleCopyConfig}
                  />
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

interface ConfigSnippetProps {
  title: string;
  content: string;
  configType: string;
  copiedConfig: string | null;
  onCopy: (configType: string, content: string) => void;
}

function ConfigSnippet({ title, content, configType, copiedConfig, onCopy }: ConfigSnippetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded border border-[var(--border-color)] overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition-colors"
      >
        <span className="text-sm text-[var(--text-primary)]">{title}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy(configType, content);
            }}
            className="p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors"
            title="Copy to clipboard"
          >
            {copiedConfig === configType ? (
              <Check size={14} className="text-green-400" />
            ) : (
              <Copy size={14} className="text-[var(--text-secondary)]" />
            )}
          </button>
          {isOpen ? (
            <ChevronUp size={16} className="text-[var(--text-secondary)]" />
          ) : (
            <ChevronDown size={16} className="text-[var(--text-secondary)]" />
          )}
        </div>
      </button>
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 bg-[var(--bg-primary)] overflow-x-auto"
        >
          <pre className="text-xs text-[var(--text-secondary)] font-mono whitespace-pre">
            {content}
          </pre>
        </motion.div>
      )}
    </div>
  );
}

// Compact version for lists
export function CompactLayerCard({ layer, layerType }: { layer: Layer; layerType: LayerType }) {
  const colors = layerTypeColors[layerType];
  const Icon = layerIcons[layer.icon] || Server;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${colors.border} ${colors.bg}`}>
      <div className={`p-1.5 rounded ${colors.badge}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-[var(--text-primary)]">
          {layer.name}
        </div>
        <div className="text-xs text-[var(--text-secondary)] truncate">
          {layer.description}
        </div>
      </div>
    </div>
  );
}
