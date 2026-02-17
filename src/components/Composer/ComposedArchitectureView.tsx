import { motion } from 'framer-motion';
import { AlertTriangle, Lightbulb, CheckCircle, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { ComposedArchitecture, getArchitectureCapabilities } from '../../data/composer';
import { PipelineDiagram } from './PipelineDiagram';
import { LayerCard } from './LayerCard';

interface ComposedArchitectureViewProps {
  architecture: ComposedArchitecture;
}

export function ComposedArchitectureView({ architecture }: ComposedArchitectureViewProps) {
  const [copiedAll, setCopiedAll] = useState(false);
  const capabilities = getArchitectureCapabilities(architecture);

  const handleCopyAllConfigs = async () => {
    const allConfigs: string[] = [];
    
    if (architecture.configSnippets.agent) {
      allConfigs.push('# ========== AGENT CONFIGURATION ==========\n' + architecture.configSnippets.agent);
    }
    if (architecture.configSnippets.gateway) {
      allConfigs.push('# ========== GATEWAY CONFIGURATION ==========\n' + architecture.configSnippets.gateway);
    }
    if (architecture.configSnippets.kubernetes) {
      allConfigs.push('# ========== KUBERNETES MANIFESTS ==========\n' + architecture.configSnippets.kubernetes);
    }
    
    await navigator.clipboard.writeText(allConfigs.join('\n\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Your Architecture
        </h2>
        <div className="flex items-center justify-center gap-3">
          <ComplexityBadge complexity={architecture.complexity} />
          <span className="text-[var(--text-secondary)]">|</span>
          <span className="text-sm text-[var(--text-secondary)]">
            {architecture.edge.length} edge layer{architecture.edge.length !== 1 ? 's' : ''} + {' '}
            {architecture.processing.filter(p => p.id !== 'none').length} processing layer{architecture.processing.filter(p => p.id !== 'none').length !== 1 ? 's' : ''}
          </span>
        </div>
      </motion.div>

      {/* Pipeline Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] p-6"
      >
        <PipelineDiagram architecture={architecture} />
      </motion.div>

      {/* Warnings */}
      {architecture.warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          {architecture.warnings.map((warning, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30"
            >
              <AlertTriangle className="text-yellow-400 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-[var(--text-primary)]">{warning}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Recommendations */}
      {architecture.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <h3 className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
            <Lightbulb size={16} />
            Recommendations
          </h3>
          {architecture.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-4 rounded-lg bg-[var(--otel-blue)]/10 border border-[var(--otel-blue)]/30"
            >
              <CheckCircle className="text-[var(--otel-blue)] flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-[var(--text-primary)]">{rec}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Capabilities provided */}
      {capabilities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] p-4"
        >
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">
            Capabilities Enabled
          </h3>
          <div className="flex flex-wrap gap-2">
            {capabilities.map(cap => (
              <span
                key={cap}
                className="text-xs px-3 py-1.5 rounded-full bg-[var(--otel-blue)]/20 text-[var(--otel-blue)]"
              >
                {cap.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Layer Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Layer Details
          </h3>
          <button
            onClick={handleCopyAllConfigs}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--otel-blue)] transition-colors text-sm"
          >
            {copiedAll ? (
              <>
                <Check size={14} className="text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} className="text-[var(--text-secondary)]" />
                <span className="text-[var(--text-secondary)]">Copy all configs</span>
              </>
            )}
          </button>
        </div>

        {/* Edge Layers */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[var(--text-secondary)]">
            Edge Layer{architecture.edge.length > 1 ? 's' : ''}
          </h4>
          {architecture.edge.map((layer, idx) => (
            <LayerCard key={layer.id} layer={layer} layerType="edge" index={idx} />
          ))}
        </div>

        {/* Processing Layers */}
        {architecture.processing.filter(p => p.id !== 'none').length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-[var(--text-secondary)]">
              Processing Layer{architecture.processing.filter(p => p.id !== 'none').length > 1 ? 's' : ''}
            </h4>
            {architecture.processing
              .filter(p => p.id !== 'none')
              .map((layer, idx) => (
                <LayerCard key={layer.id} layer={layer} layerType="processing" index={idx} />
              ))}
          </div>
        )}

        {/* Buffering Layer */}
        {architecture.buffering.id !== 'memory-queue' && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-[var(--text-secondary)]">
              Buffering Layer
            </h4>
            <LayerCard layer={architecture.buffering} layerType="buffering" />
          </div>
        )}

        {/* Default buffering note */}
        {architecture.buffering.id === 'memory-queue' && (
          <div className="text-sm text-[var(--text-secondary)] p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
            <strong>Buffering:</strong> Using default in-memory queues with retry. 
            Data may be lost on collector crash. Select "Minimize Data Loss" or "Zero Data Loss" 
            in resilience options for persistent buffering.
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ComplexityBadge({ complexity }: { complexity: ComposedArchitecture['complexity'] }) {
  const colors = {
    'Low': 'bg-green-500/20 text-green-400',
    'Medium': 'bg-yellow-500/20 text-yellow-400',
    'High': 'bg-orange-500/20 text-orange-400',
    'Very High': 'bg-red-500/20 text-red-400',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[complexity]}`}>
      {complexity} Complexity
    </span>
  );
}
