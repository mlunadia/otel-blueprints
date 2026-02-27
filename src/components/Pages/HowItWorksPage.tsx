import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { ArrowLeft, Layers, GitBranch, Server, Database, Network, Puzzle, Zap, Box, Monitor, HardDrive } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { CollectorIcon } from '../UI/OTelLogo';
import { composeArchitecture, defaultRequirements } from '../../data/composer';
import { VisualPipelineDiagram } from '../Composer/VisualPipelineDiagram';

export function HowItWorksPage() {
  const { setCurrentPage } = useAppContext();

  const twoTierArchitecture = useMemo(() => composeArchitecture({
    ...defaultRequirements,
    dataVolume: 50,
    dataLossPolicy: 'minimize',
  }), []);

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
          <span>Back to requirements</span>
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-3"
          >
            OpenTelemetry Blueprints
          </motion.h2>
        </div>

        {/* Content sections */}
        <div className="space-y-8">
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
                  <span className="text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)]">Load Balancer</span>
                  <span className="text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)]">Gateway Pool</span>
                  <span className="text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)]">Tail Sampling Tier</span>
                </div>
              </div>

              {/* Resilience */}
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="text-red-400" size={18} />
                  <h4 className="font-medium text-[var(--text-primary)]">Resilience</h4>
                  <span className="text-xs text-red-400">(based on data loss tolerance)</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">
                  How collectors buffer data. In-memory queues and persistent queues (WAL) are exporter-level features on the collector. Kafka is a separate infrastructure component.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)]">In-Memory Queues</span>
                  <span className="text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)]">Persistent Queues (WAL)</span>
                  <span className="text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)]">Kafka Buffer</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Composable Modules */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--otel-blue)]/20 flex items-center justify-center">
                <Puzzle className="text-[var(--otel-blue)]" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Composable Modules</h3>
            </div>
            <p className="text-[var(--text-secondary)] mb-5">
              Some capabilities require multiple components working together as a unit. 
              These modules are composed automatically when the corresponding requirement is enabled.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* DaemonSet Agent Module */}
              <ModuleCard
                title="DaemonSet Agent"
                icon={<Server className="text-green-400" size={16} />}
                badge="Kubernetes + infra metrics"
                badgeClass="bg-green-500/20 text-green-400"
                borderClass="border-green-500/40"
                bgClass="bg-green-500/5"
                description="One collector per Kubernetes node. Collects host metrics, container logs, and enriches with k8s metadata."
                detail={
                  <>Deployed as a <code className="text-green-300">DaemonSet</code>. Runs <code className="text-green-300">hostmetrics</code>, <code className="text-green-300">filelog</code>, and <code className="text-green-300">k8sattributes</code> receivers.
                  Applications on the same node export to <code className="text-green-300">localhost:4317</code>.</>
                }
              >
                <MiniNodeBox label="Node" icon={<Server size={10} className="text-green-400/70" />} colorClass="border-green-500/30" scaleHint="× N nodes">
                  <MiniComponentBox
                    icon={<Zap size={14} className="text-green-400" />}
                    label="Application"
                    sublabel="OTel SDK"
                    colorClass="border-green-500/30 bg-green-500/5"
                  />
                  <MiniFlowConnector label="OTLP" />
                  <MiniComponentBox
                    icon={<CollectorIcon size={14} className="text-green-400" />}
                    label="DaemonSet Agent"
                    sublabel="Per-node collector"
                    colorClass="border-green-500/30 bg-green-500/5"
                  />
                </MiniNodeBox>
              </ModuleCard>

              {/* Sidecar Agent Module */}
              <ModuleCard
                title="Sidecar Agent"
                icon={<Box className="text-green-400" size={16} />}
                badge="per-service isolation"
                badgeClass="bg-green-500/20 text-green-400"
                borderClass="border-green-500/40"
                bgClass="bg-green-500/5"
                description="One collector per pod. Provides per-service isolation and custom config. Works on managed container platforms (ECS/Fargate, Azure Container Apps)."
                detail={
                  <>Injected via the <code className="text-green-300">OpenTelemetry Operator</code> sidecar mode.
                  Each pod gets its own lightweight collector with custom pipelines. Can coexist with DaemonSet agents.</>
                }
              >
                <MiniNodeBox label="Pod" icon={<Box size={10} className="text-green-400/70" />} colorClass="border-green-500/30" scaleHint="× N pods">
                  <MiniComponentBox
                    icon={<Zap size={14} className="text-green-400" />}
                    label="Application"
                    sublabel="OTel SDK"
                    colorClass="border-green-500/30 bg-green-500/5"
                  />
                  <MiniFlowConnector label="OTLP" />
                  <MiniComponentBox
                    icon={<CollectorIcon size={14} className="text-green-400" />}
                    label="Sidecar Agent"
                    sublabel="Per-pod collector"
                    colorClass="border-green-500/30 bg-green-500/5"
                  />
                </MiniNodeBox>
              </ModuleCard>

              {/* Host Agent Module */}
              <ModuleCard
                title="Host / VM Agent"
                icon={<Monitor className="text-green-400" size={16} />}
                badge="bare metal or VM"
                badgeClass="bg-green-500/20 text-green-400"
                borderClass="border-green-500/40"
                bgClass="bg-green-500/5"
                description="Standalone collector running as a systemd service. Collects host metrics, disk logs, and receives application telemetry."
                detail={
                  <>Runs <code className="text-green-300">hostmetrics</code> and <code className="text-green-300">filelog</code> receivers.
                  Applications export to <code className="text-green-300">localhost:4317</code>. Provides buffering, retry, and resource detection even without infrastructure collection.</>
                }
              >
                <MiniNodeBox label="Host" icon={<Monitor size={10} className="text-green-400/70" />} colorClass="border-green-500/30">
                  <MiniComponentBox
                    icon={<Zap size={14} className="text-blue-400" />}
                    label="Application"
                    sublabel="OTel SDK"
                    colorClass="border-blue-500/30 bg-blue-500/5"
                  />
                  <MiniFlowConnector label="OTLP" />
                  <MiniComponentBox
                    icon={<CollectorIcon size={14} className="text-[var(--otel-blue)]" />}
                    label="Host Agent"
                    sublabel="systemd service"
                    colorClass="border-[var(--otel-blue)]/30 bg-[var(--otel-blue)]/5"
                  />
                </MiniNodeBox>
              </ModuleCard>

              {/* Gateway Pool Module */}
              <ModuleCard
                title="Gateway Pool"
                icon={<Layers className="text-orange-400" size={16} />}
                badge="central policy / multi-backend"
                badgeClass="bg-orange-500/20 text-orange-400"
                borderClass="border-orange-500/40"
                bgClass="bg-orange-500/5"
                description="Centralized collector deployment (3+ replicas) for policy enforcement, PII redaction, multi-backend routing, and credential isolation."
                detail={
                  <>Deployed as a <code className="text-orange-300">Deployment</code> with HPA. Runs <code className="text-orange-300">filter</code>, <code className="text-orange-300">transform</code>, and <code className="text-orange-300">batch</code> processors.
                  Isolates backend credentials from edge collectors.</>
                }
              >
                <MiniComponentBox
                  icon={<CollectorIcon size={14} className="text-orange-400" />}
                  label="Gateway Pool"
                  sublabel="Central processing (3+ replicas)"
                  colorClass="border-orange-500/30 bg-orange-500/5"
                />
              </ModuleCard>

              {/* High Volume Module */}
              <ModuleCard
                title="High Volume"
                icon={<Network className="text-orange-400" size={16} />}
                badge="when data volume is high"
                badgeClass="bg-orange-500/20 text-orange-400"
                borderClass="border-orange-500/40"
                bgClass="bg-orange-500/5"
                description="High telemetry volume requires a load balancer in front of the Gateway Pool to distribute traffic across replicas."
                detail={
                  <>The load balancer can be NGINX, a Kubernetes Service, or the OTel <code className="text-orange-300">loadbalancing</code> exporter.
                  The Gateway Pool auto-scales via HPA targeting 50-60% CPU utilization.</>
                }
              >
                <MiniComponentBox
                  icon={<Network size={14} className="text-orange-400" />}
                  label="Load Balancer"
                  sublabel="Traffic distribution"
                  colorClass="border-orange-500/30 bg-orange-500/5"
                />
                <MiniFlowConnector />
                <MiniComponentBox
                  icon={<CollectorIcon size={14} className="text-orange-400" />}
                  label="Gateway Pool"
                  sublabel="Central processing"
                  colorClass="border-orange-500/30 bg-orange-500/5"
                />
              </ModuleCard>

              {/* Tail Sampling Module */}
              <ModuleCard
                title="Tail Sampling"
                icon={<GitBranch className="text-orange-400" size={16} />}
                badge="when tail sampling enabled"
                badgeClass="bg-orange-500/20 text-orange-400"
                borderClass="border-orange-500/40"
                bgClass="bg-orange-500/5"
                description="Two-tier collector setup so all spans of a trace reach the same sampling collector for intelligent keep/drop decisions."
                detail={
                  <>The LB Exporter uses <code className="text-orange-300">loadbalancingexporter</code> with <code className="text-orange-300">routing_key: traceID</code> to
                  hash-route spans. The Sampling Collectors (<code className="text-orange-300">StatefulSet</code>) run the <code className="text-orange-300">tail_sampling</code> processor.</>
                }
              >
                <MiniNodeBox label="Tail Sampling" icon={<GitBranch size={10} className="text-orange-400/70" />} colorClass="border-orange-500/30">
                  <MiniComponentBox
                    icon={<CollectorIcon size={14} className="text-orange-400" />}
                    label="LB Exporter"
                    sublabel="loadbalancingexporter (traceID)"
                    colorClass="border-orange-500/30 bg-orange-500/5"
                  />
                  <MiniFlowConnector />
                  <MiniComponentBox
                    icon={<CollectorIcon size={14} className="text-orange-400" />}
                    label="Sampling Collectors"
                    sublabel="tail_sampling processor"
                    colorClass="border-orange-500/30 bg-orange-500/5"
                  />
                </MiniNodeBox>
              </ModuleCard>

              {/* Persistent Queues Module */}
              <ModuleCard
                title="Persistent Queues (WAL)"
                icon={<HardDrive className="text-red-400" size={16} />}
                badge="when minimizing data loss"
                badgeClass="bg-red-500/20 text-red-400"
                borderClass="border-red-500/40"
                bgClass="bg-red-500/5"
                description="The file_storage extension enables a write-ahead log (WAL) on the collector's exporter sending queue. Data is persisted to disk so it survives collector crashes and restarts."
                detail={
                  <>Configured on the exporter's <code className="text-red-300">sending_queue</code> with <code className="text-red-300">storage: file_storage</code>. 
                  Not a separate pipeline component — it's a resilience feature of the collector itself. Requires <code className="text-red-300">StatefulSet</code> with PVC in Kubernetes.</>
                }
              >
                <MiniComponentBox
                  icon={<CollectorIcon size={14} className="text-red-400" />}
                  label="Collector (Gateway)"
                  sublabel="sending_queue → file_storage (WAL on PVC)"
                  colorClass="border-red-500/30 bg-red-500/5"
                />
              </ModuleCard>

              {/* Kafka Buffering Module */}
              <ModuleCard
                title="Kafka Buffering"
                icon={<Database className="text-red-400" size={16} />}
                badge="when zero data loss required"
                badgeClass="bg-red-500/20 text-red-400"
                borderClass="border-red-500/40"
                bgClass="bg-red-500/5"
                description="Dedicated collector pools on each side of Kafka for maximum durability. Survives hours of backend outages."
                detail={
                  <>Producer collectors receive via OTLP and write to Kafka topics. Consumer collectors read from Kafka
                  and forward via OTLP. This decouples ingestion from processing and enables replay and multi-consumer patterns.</>
                }
              >
                <MiniComponentBox
                  icon={<CollectorIcon size={14} className="text-[var(--otel-blue)]" />}
                  label="Collector Pool"
                  sublabel="OTLP receiver → Kafka exporter"
                  colorClass="border-[var(--otel-blue)]/30 bg-[var(--otel-blue)]/5"
                />
                <MiniFlowConnector dashed />
                <MiniComponentBox
                  icon={<Database size={14} className="text-red-400" />}
                  label="Kafka"
                  sublabel="Buffer & durability"
                  colorClass="border-red-500/30 bg-red-500/5"
                />
                <MiniFlowConnector dashed />
                <MiniComponentBox
                  icon={<CollectorIcon size={14} className="text-[var(--otel-blue)]" />}
                  label="Collector Pool"
                  sublabel="Kafka receiver → OTLP exporter"
                  colorClass="border-[var(--otel-blue)]/30 bg-[var(--otel-blue)]/5"
                />
              </ModuleCard>
            </div>
          </motion.section>

          {/* Key Insight */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-[var(--otel-blue)]/10 border border-[var(--otel-blue)]/30 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Key Insight</h3>
            <p className="text-[var(--text-secondary)] mb-5">
              The <strong>Agent + Gateway two-tier pattern is the de facto production standard</strong>, 
              used by the vast majority of organizations running OTel at scale. Every other configuration 
              either simplifies it (for smaller environments) or extends it (with tail sampling, Kafka buffering, 
              or load balancing). Start there and add modules as your needs grow.
            </p>
            <VisualPipelineDiagram architecture={twoTierArchitecture} />
          </motion.section>
        </div>
      </motion.div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Mini-diagram components — lightweight versions of the results page visuals
// ---------------------------------------------------------------------------

function MiniComponentBox({
  icon,
  label,
  sublabel,
  colorClass,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  colorClass: string;
}) {
  return (
    <div className={`flex items-center gap-2 rounded-lg border ${colorClass} px-3 py-2 w-full`}>
      <div className="flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs font-medium text-[var(--text-primary)] truncate">{label}</div>
        {sublabel && (
          <div className="text-[10px] text-[var(--text-secondary)] truncate">{sublabel}</div>
        )}
      </div>
    </div>
  );
}

function MiniFlowConnector({ dashed = false, label }: { dashed?: boolean; label?: string }) {
  const w = label ? 60 : 24;
  const h = 28;
  const cx = w / 2;
  const pathD = `M${cx},0 L${cx},${h}`;

  return (
    <div className="flex justify-center">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
        <path
          d={pathD}
          fill="none"
          stroke="var(--border-color)"
          strokeWidth={1.5}
          strokeDasharray={dashed ? '4 3' : 'none'}
          strokeLinecap="round"
        />
        {[0, 1, 2].map((i) => (
          <circle key={i} r={2} fill="var(--otel-blue)">
            <animateMotion dur="2s" repeatCount="indefinite" begin={`${i * 0.6}s`} path={pathD} />
            <animate attributeName="opacity" values="0;1;1;0" dur="2s" repeatCount="indefinite" begin={`${i * 0.6}s`} />
          </circle>
        ))}
        {label && (
          <text x={cx + 10} y={h / 2 + 3} fill="var(--text-secondary)" fontSize={8} fontWeight={500}>
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}

function MiniNodeBox({
  label,
  icon,
  colorClass,
  scaleHint,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  colorClass: string;
  scaleHint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border-2 border-dashed ${colorClass} p-3 space-y-2 w-full`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            {label}
          </span>
        </div>
        {scaleHint && (
          <span className="text-[9px] text-[var(--text-secondary)] opacity-60">{scaleHint}</span>
        )}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function ModuleCard({
  title,
  icon,
  badge,
  badgeClass,
  borderClass,
  bgClass,
  description,
  detail,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  badge: string;
  badgeClass: string;
  borderClass: string;
  bgClass: string;
  description: string;
  detail: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-lg border border-dashed ${borderClass} ${bgClass} overflow-hidden`}>
      <div className="p-4 pb-3">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <h4 className="font-medium text-[var(--text-primary)]">{title}</h4>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${badgeClass}`}>{badge}</span>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">{description}</p>
      </div>

      <div className="bg-[var(--bg-tertiary)] rounded-lg mx-3 mb-3 p-4">
        <div className="flex flex-col items-stretch gap-0 max-w-[240px] mx-auto">
          {children}
        </div>
      </div>

      <div className="px-4 pb-4">
        <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}
