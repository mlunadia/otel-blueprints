import { motion } from 'framer-motion';
import { ArrowLeft, Layers, GitBranch, Server, Database, ArrowRight, CheckCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export function HowItWorksPage() {
  const { setCurrentPage } = useAppContext();

  return (
    <main className="pt-20 pb-8 px-4 max-w-4xl mx-auto">
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
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-3"
          >
            How Composition Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[var(--text-secondary)] max-w-2xl mx-auto"
          >
            Understanding how we build your telemetry pipeline from composable layers
          </motion.p>
        </div>

        {/* Content sections */}
        <div className="space-y-8">
          {/* Core Concept */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--otel-blue)]/20 flex items-center justify-center">
                <Layers className="text-[var(--otel-blue)]" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Composable Layers, Not Competing Patterns</h3>
            </div>
            <p className="text-[var(--text-secondary)] mb-4">
              Traditional approaches present deployment patterns as mutually exclusive choices. 
              But in reality, OTel Collector architectures are <strong>composable building blocks that stack</strong>.
            </p>
            <p className="text-[var(--text-secondary)]">
              For example, "Agent + Kafka + Gateway" isn't a third option competing with "Agent + Gateway" — 
              it's the same architecture with Kafka bolted on as a buffering layer. You might even run 
              DaemonSet agents AND sidecars simultaneously (DaemonSet for host metrics, sidecar for per-service isolation).
            </p>
          </motion.section>

          {/* The Three Layers */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--otel-blue)]/20 flex items-center justify-center">
                <GitBranch className="text-[var(--otel-blue)]" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">The Three Layers</h3>
            </div>
            
            <div className="space-y-4">
              {/* Edge Layer */}
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="text-green-400" size={18} />
                  <h4 className="font-medium text-[var(--text-primary)]">Edge Layer</h4>
                  <span className="text-xs text-green-400">(pick one or more)</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">
                  How telemetry enters your pipeline. You can combine multiple edge collectors.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)]">Direct SDK Export</span>
                  <span className="text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)]">DaemonSet Agent</span>
                  <span className="text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)]">Sidecar Agent</span>
                </div>
              </div>

              {/* Processing Layer */}
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="text-orange-400" size={18} />
                  <h4 className="font-medium text-[var(--text-primary)]">Processing Layer</h4>
                  <span className="text-xs text-orange-400">(optional, add when needed)</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">
                  Central processing for policy enforcement, sampling, and routing. Layers can stack.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)]">Gateway Pool</span>
                  <span className="text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)]">Sampling Tier</span>
                  <span className="text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)]">Regional Federation</span>
                </div>
              </div>

              {/* Buffering Layer */}
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="text-red-400" size={18} />
                  <h4 className="font-medium text-[var(--text-primary)]">Buffering Layer</h4>
                  <span className="text-xs text-red-400">(pick one based on resilience needs)</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">
                  How data is buffered for resilience. Higher durability = more complexity.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)]">In-Memory Queues</span>
                  <span className="text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)]">Persistent Queues</span>
                  <span className="text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)]">Kafka Buffer</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* How Composition Works */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--otel-blue)]/20 flex items-center justify-center">
                <CheckCircle className="text-[var(--otel-blue)]" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Additive Decision Flow</h3>
            </div>
            <p className="text-[var(--text-secondary)] mb-4">
              Instead of scoring patterns competitively, we guide you through additive decisions:
            </p>
            <div className="space-y-3">
              <DecisionStep 
                question="Do you need host metrics?" 
                answer="Yes = DaemonSet required at edge"
              />
              <DecisionStep 
                question="Do you need per-service isolation?" 
                answer="Yes = Add Sidecar (can coexist with DaemonSet)"
              />
              <DecisionStep 
                question="Do you need central policy or multi-backend?" 
                answer="Yes = Add Gateway layer"
              />
              <DecisionStep 
                question="Do you need tail sampling?" 
                answer="Yes = Add LB tier + StatefulSet sampling tier"
              />
              <DecisionStep 
                question="Do you need backend outage survival?" 
                answer="Yes = Add Kafka or persistent queues"
              />
              <DecisionStep 
                question="Multi-region deployment?" 
                answer="Yes = Add regional gateway federation"
              />
            </div>
          </motion.section>

          {/* Example Compositions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] p-6"
          >
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Example Compositions</h3>
            
            <div className="space-y-4">
              <CompositionExample
                name="Simple Development"
                edge={['Direct SDK']}
                processing={[]}
                buffering="In-Memory"
                complexity="Low"
              />
              <CompositionExample
                name="Production Standard"
                edge={['DaemonSet Agent']}
                processing={['Gateway Pool']}
                buffering="In-Memory"
                complexity="Medium"
              />
              <CompositionExample
                name="High Isolation + Host Metrics"
                edge={['DaemonSet Agent', 'Sidecar Agent']}
                processing={['Gateway Pool']}
                buffering="Persistent"
                complexity="High"
              />
              <CompositionExample
                name="Enterprise with Tail Sampling"
                edge={['DaemonSet Agent']}
                processing={['Gateway Pool', 'Sampling Tier']}
                buffering="Kafka"
                complexity="Very High"
              />
            </div>
          </motion.section>

          {/* Key Insight */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[var(--otel-blue)]/10 border border-[var(--otel-blue)]/30 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Key Insight</h3>
            <p className="text-[var(--text-secondary)]">
              The <strong>Agent + Gateway two-tier pattern is the de facto production standard</strong>, 
              used by the vast majority of organizations running OTel at scale. Every other configuration 
              either simplifies it (for smaller environments) or extends it (for tail sampling, Kafka buffering, 
              or multi-region federation). Start there and add layers as your needs grow.
            </p>
          </motion.section>
        </div>
      </motion.div>
    </main>
  );
}

function DecisionStep({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-[var(--bg-tertiary)] rounded-lg">
      <ArrowRight className="text-[var(--otel-blue)] flex-shrink-0 mt-0.5" size={16} />
      <div>
        <span className="text-[var(--text-primary)]">{question}</span>
        <span className="text-[var(--text-secondary)]"> → </span>
        <span className="text-[var(--otel-blue)]">{answer}</span>
      </div>
    </div>
  );
}

function CompositionExample({ 
  name, 
  edge, 
  processing, 
  buffering, 
  complexity 
}: { 
  name: string; 
  edge: string[]; 
  processing: string[]; 
  buffering: string;
  complexity: string;
}) {
  const complexityColors = {
    'Low': 'bg-green-500/20 text-green-400',
    'Medium': 'bg-yellow-500/20 text-yellow-400',
    'High': 'bg-orange-500/20 text-orange-400',
    'Very High': 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="p-4 bg-[var(--bg-tertiary)] rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-[var(--text-primary)]">{name}</h4>
        <span className={`text-xs px-2 py-1 rounded ${complexityColors[complexity as keyof typeof complexityColors]}`}>
          {complexity}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-green-400">{edge.join(' + ')}</span>
        {processing.length > 0 && (
          <>
            <ArrowRight size={14} className="text-[var(--text-secondary)]" />
            <span className="text-orange-400">{processing.join(' → ')}</span>
          </>
        )}
        {buffering !== 'In-Memory' && (
          <>
            <ArrowRight size={14} className="text-[var(--text-secondary)]" />
            <span className="text-red-400">{buffering}</span>
          </>
        )}
        <ArrowRight size={14} className="text-[var(--text-secondary)]" />
        <span className="text-cyan-400">Backend</span>
      </div>
    </div>
  );
}
