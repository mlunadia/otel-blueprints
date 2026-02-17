import { motion } from 'framer-motion';
import { ArrowLeft, Server, Box, Layers, Database, HardDrive, Zap, Globe, GitBranch, MinusCircle, Cpu } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { edgeLayers, processingLayers, bufferingLayers, Layer, LayerType } from '../../data/layers';

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

export function ExplorePage() {
  const { setCurrentPage } = useAppContext();

  return (
    <main className="pt-20 pb-8 px-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Back button */}
        <button
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6"
        >
          <ArrowLeft size={18} />
          <span>Back to advisor</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-3"
          >
            Available Layers
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[var(--text-secondary)] max-w-2xl mx-auto"
          >
            Explore all available building blocks for your OpenTelemetry pipeline. 
            Layers can be combined to create your ideal architecture.
          </motion.p>
        </div>

        {/* Edge Layers */}
        <LayerSection
          title="Edge Layers"
          description="How telemetry enters your pipeline. You can combine multiple edge collectors."
          layers={edgeLayers}
          layerType="edge"
          delay={0.2}
        />

        {/* Processing Layers */}
        <LayerSection
          title="Processing Layers"
          description="Central processing for policy enforcement, sampling, and routing."
          layers={processingLayers}
          layerType="processing"
          delay={0.4}
        />

        {/* Buffering Layers */}
        <LayerSection
          title="Buffering Layers"
          description="How data is buffered for resilience. Higher durability = more complexity."
          layers={bufferingLayers}
          layerType="buffering"
          delay={0.6}
        />
      </motion.div>
    </main>
  );
}

interface LayerSectionProps {
  title: string;
  description: string;
  layers: Layer[];
  layerType: LayerType;
  delay: number;
}

function LayerSection({ title, description, layers, layerType, delay }: LayerSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="mb-10"
    >
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
        <p className="text-sm text-[var(--text-secondary)]">{description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {layers.map((layer, idx) => (
          <LayerExploreCard
            key={layer.id}
            layer={layer}
            layerType={layerType}
            index={idx}
          />
        ))}
      </div>
    </motion.section>
  );
}

interface LayerExploreCardProps {
  layer: Layer;
  layerType: LayerType;
  index: number;
}

function LayerExploreCard({ layer, layerType, index }: LayerExploreCardProps) {
  const Icon = layerIcons[layer.icon] || Server;
  const colors = layerTypeColors[layerType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}
    >
      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-2.5 rounded-lg ${colors.badge}`}>
            <Icon size={22} />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-[var(--text-primary)] mb-1">
              {layer.name}
            </h4>
            <p className="text-sm text-[var(--text-secondary)]">
              {layer.description}
            </p>
          </div>
        </div>

        {/* Capabilities */}
        {layer.provides.length > 0 && (
          <div className="mb-4">
            <h5 className="text-xs font-medium text-[var(--text-secondary)] mb-2">Provides</h5>
            <div className="flex flex-wrap gap-1.5">
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
          <div className="mb-4">
            <h5 className="text-xs font-medium text-[var(--text-secondary)] mb-2">Requires</h5>
            <div className="flex flex-wrap gap-1.5">
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

        {/* Incompatibilities */}
        {layer.incompatibleWith.length > 0 && (
          <div className="mb-4">
            <h5 className="text-xs font-medium text-[var(--text-secondary)] mb-2">Not compatible with</h5>
            <div className="flex flex-wrap gap-1.5">
              {layer.incompatibleWith.map(inc => (
                <span
                  key={inc}
                  className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400"
                >
                  {inc.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Resource sizing */}
        {layer.resources && (
          <div className="pt-3 border-t border-[var(--border-color)]">
            <h5 className="text-xs font-medium text-[var(--text-secondary)] mb-2">Resource Sizing</h5>
            <div className="text-xs text-[var(--text-secondary)] space-y-0.5">
              <div>CPU: {layer.resources.cpu}</div>
              <div>Memory: {layer.resources.memory}</div>
              {layer.resources.replicas && (
                <div>Replicas: {layer.resources.replicas}+</div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
