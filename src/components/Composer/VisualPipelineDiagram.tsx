import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { Server, Database, Zap, Box, Monitor, Layers, Network, GitBranch, HardDrive } from 'lucide-react';
import { ComposedArchitecture } from '../../data/composer';
import { Layer } from '../../data/layers';
import { CollectorIcon, KubernetesIcon } from '../UI/OTelLogo';

interface VisualPipelineDiagramProps {
  architecture: ComposedArchitecture;
}

// ---------------------------------------------------------------------------
// Connector registry — components register their DOM refs by id so the
// overlay SVG can draw paths between them.
// ---------------------------------------------------------------------------

type ConnectorSide = 'left' | 'right' | 'top' | 'bottom';

interface ConnectorDef {
  fromId: string;
  fromSide: ConnectorSide;
  toId: string;
  toSide: ConnectorSide;
  label?: string;
  dashed?: boolean;
}

interface ConnectorRegistryCtx {
  register: (id: string, el: HTMLElement) => void;
  unregister: (id: string) => void;
}

const ConnectorRegistryContext = createContext<ConnectorRegistryCtx>({
  register: () => {},
  unregister: () => {},
});

function useRegisterConnector(id: string) {
  const { register, unregister } = useContext(ConnectorRegistryContext);
  const refCb = useCallback(
    (el: HTMLDivElement | null) => {
      if (el) register(id, el);
      else unregister(id);
    },
    [id, register, unregister],
  );
  return refCb;
}

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------

interface TooltipData {
  title: string;
  description: string;
  meta?: { label: string; value: string }[];
}

function getLayerTooltip(layer: Layer): TooltipData {
  const meta: { label: string; value: string }[] = [];
  if (layer.resources) {
    meta.push({ label: 'CPU', value: layer.resources.cpu });
    meta.push({ label: 'Memory', value: layer.resources.memory });
    if (layer.resources.replicas) meta.push({ label: 'Replicas', value: String(layer.resources.replicas) });
  }
  if (layer.provides.length > 0) {
    meta.push({ label: 'Provides', value: layer.provides.map(p => p.replace(/-/g, ' ')).join(', ') });
  }
  return { title: layer.name, description: layer.description, meta };
}

function ComponentTooltip({
  data,
  visible,
  anchorRef,
}: {
  data: TooltipData;
  visible: boolean;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (visible && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.top + window.scrollY - 8,
        left: rect.left + rect.width / 2 + window.scrollX,
      });
    }
  }, [visible, anchorRef]);

  return createPortal(
    <AnimatePresence>
      {visible && pos && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-[9999] -translate-x-1/2 -translate-y-full pointer-events-none w-64"
        >
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-xl p-3 text-left">
            <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">{data.title}</div>
            <div className="text-xs text-[var(--text-secondary)] mb-2 leading-relaxed">{data.description}</div>
            {data.meta && data.meta.length > 0 && (
              <div className="border-t border-[var(--border-color)] pt-2 space-y-1">
                {data.meta.map((m, i) => (
                  <div key={i} className="flex justify-between text-[10px] gap-3">
                    <span className="text-[var(--text-secondary)] flex-shrink-0">{m.label}</span>
                    <span className="text-[var(--text-primary)] font-medium text-right">{m.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ---------------------------------------------------------------------------
// ComponentBox
// ---------------------------------------------------------------------------

function ComponentBox({
  connectorId,
  icon,
  label,
  sublabel,
  colorClass,
  tooltip,
  badge,
  delay = 0,
}: {
  connectorId?: string;
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  colorClass: string;
  tooltip?: TooltipData;
  badge?: { label: string; icon: React.ReactNode; colorClass: string };
  delay?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const registerRef = useRegisterConnector(connectorId ?? '');

  const combinedRef = useCallback(
    (el: HTMLDivElement | null) => {
      (tooltipRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      if (connectorId) registerRef(el);
    },
    [connectorId, registerRef],
  );

  return (
    <motion.div
      ref={combinedRef}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="relative w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {tooltip && <ComponentTooltip data={tooltip} visible={hovered} anchorRef={tooltipRef} />}
      <div
        className={`flex items-center gap-2 rounded-lg border ${colorClass} px-3 py-2 transition-all duration-150 cursor-default w-full ${
          hovered ? 'shadow-lg scale-[1.02]' : ''
        }`}
      >
        <div className="flex-shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-[var(--text-primary)] truncate">{label}</div>
          {sublabel && (
            <div className="text-[10px] text-[var(--text-secondary)] truncate">{sublabel}</div>
          )}
        </div>
        {badge && (
          <div className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium flex-shrink-0 ${badge.colorClass}`}>
            {badge.icon}
            {badge.label}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// NodeBox
// ---------------------------------------------------------------------------

function NodeBox({
  label,
  children,
  icon,
  colorClass,
  delay = 0,
  scaleHint,
}: {
  label: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  colorClass: string;
  delay?: number;
  scaleHint?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={`rounded-xl border-2 border-dashed ${colorClass} p-3 space-y-2 min-w-[160px]`}
    >
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
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// EnvironmentContainer
// ---------------------------------------------------------------------------

function EnvironmentContainer({
  label,
  icon,
  colorClass,
  bgClass,
  children,
  delay = 0,
}: {
  label: string;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`rounded-2xl border-2 ${colorClass} ${bgClass} p-4 flex flex-col gap-3`}
    >
      <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]/40">
        {icon}
        <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="flex flex-wrap gap-3 items-start">{children}</div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Vertical FlowConnector (still used inside processing column)
// ---------------------------------------------------------------------------

function VerticalFlowConnector({ dashed = false, delay = 0, label }: { dashed?: boolean; delay?: number; label?: string }) {
  const w = label ? 60 : 24;
  const h = 32;
  const cx = w / 2;
  const pathD = `M${cx},0 L${cx},${h}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="flex justify-center"
    >
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
          <circle key={i} r={2.5} fill="var(--otel-blue)">
            <animateMotion dur="2s" repeatCount="indefinite" begin={`${i * 0.6}s`} path={pathD} />
            <animate attributeName="opacity" values="0;1;1;0" dur="2s" repeatCount="indefinite" begin={`${i * 0.6}s`} />
          </circle>
        ))}
        {label && (
          <text
            x={cx + 10}
            y={h / 2 + 3}
            fill="var(--text-secondary)"
            fontSize={8}
            fontWeight={500}
          >
            {label}
          </text>
        )}
      </svg>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// SVG Overlay — draws curved connectors between registered component refs
// ---------------------------------------------------------------------------

function ConnectorOverlay({
  containerRef,
  connectors,
  registry,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  connectors: ConnectorDef[];
  registry: Map<string, HTMLElement>;
}) {
  const [paths, setPaths] = useState<
    { d: string; label?: string; labelX: number; labelY: number; dashed: boolean }[]
  >([]);

  const compute = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    const result: typeof paths = [];

    for (const c of connectors) {
      const fromEl = registry.get(c.fromId);
      const toEl = registry.get(c.toId);
      if (!fromEl || !toEl) continue;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      const getPoint = (rect: DOMRect, side: ConnectorSide) => {
        switch (side) {
          case 'right':
            return { x: rect.right - containerRect.left, y: rect.top + rect.height / 2 - containerRect.top };
          case 'left':
            return { x: rect.left - containerRect.left, y: rect.top + rect.height / 2 - containerRect.top };
          case 'bottom':
            return { x: rect.left + rect.width / 2 - containerRect.left, y: rect.bottom - containerRect.top };
          case 'top':
            return { x: rect.left + rect.width / 2 - containerRect.left, y: rect.top - containerRect.top };
        }
      };

      const p1 = getPoint(fromRect, c.fromSide);
      const p2 = getPoint(toRect, c.toSide);

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;

      let d: string;
      if (c.fromSide === 'right' && c.toSide === 'left') {
        // Horizontal with gentle S-curve
        const cx = Math.abs(dx) * 0.4;
        d = `M${p1.x},${p1.y} C${p1.x + cx},${p1.y} ${p2.x - cx},${p2.y} ${p2.x},${p2.y}`;
      } else if (c.fromSide === 'bottom' && c.toSide === 'top') {
        const cy = Math.abs(dy) * 0.4;
        d = `M${p1.x},${p1.y} C${p1.x},${p1.y + cy} ${p2.x},${p2.y - cy} ${p2.x},${p2.y}`;
      } else {
        d = `M${p1.x},${p1.y} L${p2.x},${p2.y}`;
      }

      result.push({
        d,
        label: c.label,
        labelX: (p1.x + p2.x) / 2,
        labelY: (p1.y + p2.y) / 2,
        dashed: !!c.dashed,
      });
    }

    setPaths(result);
  }, [containerRef, connectors, registry]);

  useEffect(() => {
    // Delay initial compute to let entrance animations settle
    const timer = setTimeout(compute, 500);
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [compute]);

  // Re-compute when registry size changes
  useEffect(() => {
    const timer = setTimeout(compute, 600);
    return () => clearTimeout(timer);
  }, [registry.size, compute]);

  if (paths.length === 0) return null;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      {paths.map((p, idx) => (
        <g key={idx}>
          <path
            d={p.d}
            fill="none"
            stroke="var(--border-color)"
            strokeWidth={1.5}
            strokeDasharray={p.dashed ? '5 4' : 'none'}
            strokeLinecap="round"
            opacity={0.7}
          />
          {[0, 1, 2].map((i) => (
            <circle key={i} r={2.5} fill="var(--otel-blue)">
              <animateMotion dur="2.4s" repeatCount="indefinite" begin={`${i * 0.7}s`} path={p.d} />
              <animate attributeName="opacity" values="0;1;1;0" dur="2.4s" repeatCount="indefinite" begin={`${i * 0.7}s`} />
            </circle>
          ))}
          {p.label && (
            <text
              x={p.labelX}
              y={p.labelY - 8}
              textAnchor="middle"
              fill="var(--text-secondary)"
              fontSize={9}
              fontWeight={500}
            >
              {p.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// DiagramLegend
// ---------------------------------------------------------------------------

function DiagramLegend({ hasKafka, hasLoadBalancer, hasSampling }: { hasKafka: boolean; hasLoadBalancer: boolean; hasSampling: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] text-[var(--text-secondary)] pt-4 border-t border-[var(--border-color)]/30 mt-4">
      <div className="flex items-center gap-1.5">
        <Zap size={12} className="text-blue-400" />
        <span>Application</span>
      </div>
      <div className="flex items-center gap-1.5">
        <CollectorIcon size={12} className="text-[var(--otel-blue)]" />
        <span>OTel Collector</span>
      </div>
      {hasLoadBalancer && (
        <div className="flex items-center gap-1.5">
          <Network size={12} className="text-amber-400" />
          <span>Load Balancer</span>
        </div>
      )}
      {hasKafka && (
        <div className="flex items-center gap-1.5">
          <Database size={12} className="text-red-400" />
          <span>Kafka</span>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <Database size={12} className="text-cyan-400" />
        <span>Backend</span>
      </div>
      <div className="flex items-center gap-1.5">
        <svg width={20} height={8}><line x1={0} y1={4} x2={20} y2={4} stroke="var(--border-color)" strokeWidth={1.5} /></svg>
        <span>Sync (OTLP)</span>
      </div>
      {hasKafka && (
        <div className="flex items-center gap-1.5">
          <svg width={20} height={8}><line x1={0} y1={4} x2={20} y2={4} stroke="var(--border-color)" strokeWidth={1.5} strokeDasharray="4 3" /></svg>
          <span>Async (Kafka)</span>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <svg width={16} height={8}>
          <circle cx={3} cy={4} r={2.5} fill="var(--otel-blue)" />
          <circle cx={11} cy={4} r={2.5} fill="var(--otel-blue)" opacity={0.4} />
        </svg>
        <span>Telemetry flow</span>
      </div>
      {hasSampling && (
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 rounded border border-dashed border-purple-500/50" />
          <span>Tail sampling group</span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Edge Environment Section
// ---------------------------------------------------------------------------

function EdgeEnvironment({ architecture, bare }: { architecture: ComposedArchitecture; bare?: boolean }) {
  const isHost = architecture.edge.some(e => e.id === 'host-agent');
  const hasDaemonSet = architecture.edge.some(e => e.id === 'daemonset-agent');
  const hasSidecar = architecture.edge.some(e => e.id === 'sidecar-agent');
  const hasDirectSDK = architecture.edge.some(e => e.id === 'direct-sdk');

  const daemonSetLayer = architecture.edge.find(e => e.id === 'daemonset-agent');
  const sidecarLayer = architecture.edge.find(e => e.id === 'sidecar-agent');
  const hostAgentLayer = architecture.edge.find(e => e.id === 'host-agent');
  const directSDKLayer = architecture.edge.find(e => e.id === 'direct-sdk');

  if (isHost) {
    return (
      <EnvironmentContainer
        label="Host / VM"
        icon={<Server size={14} className="text-green-400" />}
        colorClass="border-green-500/40"
        bgClass="bg-green-500/5"
        delay={0}
      >
        <NodeBox
          label="Host"
          icon={<Monitor size={10} className="text-green-400/70" />}
          colorClass="border-green-500/30"
          delay={0.1}
        >
          <ComponentBox
            icon={<Zap size={14} className="text-blue-400" />}
            label="Application"
            sublabel="OTel SDK"
            colorClass="border-blue-500/30 bg-blue-500/5"
            tooltip={directSDKLayer ? getLayerTooltip(directSDKLayer) : {
              title: 'Application',
              description: 'Your services instrumented with the OpenTelemetry SDK, exporting telemetry to the local collector via OTLP on localhost:4317.',
            }}
            delay={0.15}
          />
          <VerticalFlowConnector label="OTLP" delay={0.17} />
          <ComponentBox
            connectorId="edge-out"
            icon={<CollectorIcon size={14} className="text-[var(--otel-blue)]" />}
            label="Host Agent"
            sublabel="systemd service"
            colorClass="border-[var(--otel-blue)]/30 bg-[var(--otel-blue)]/5"
            tooltip={hostAgentLayer ? getLayerTooltip(hostAgentLayer) : undefined}
            delay={0.2}
          />
        </NodeBox>
      </EnvironmentContainer>
    );
  }

  const edgeContent = (
    <>
      {hasDaemonSet && (
        <NodeBox
          label="Node"
          icon={<Server size={10} className="text-blue-400/70" />}
          colorClass="border-blue-500/30"
          delay={0.1}
          scaleHint="× N nodes"
        >
          <ComponentBox
            icon={<Zap size={14} className="text-blue-400" />}
            label="Application"
            sublabel="OTel SDK"
            colorClass="border-blue-500/30 bg-blue-500/5"
            tooltip={{
              title: 'Application',
              description: 'Your services instrumented with the OpenTelemetry SDK, exporting to the DaemonSet agent via OTLP on localhost:4317.',
            }}
            delay={0.15}
          />
          <VerticalFlowConnector label="OTLP" delay={0.17} />
          <ComponentBox
            connectorId={hasSidecar ? 'edge-out-ds' : 'edge-out'}
            icon={<CollectorIcon size={14} className="text-[var(--otel-blue)]" />}
            label="DaemonSet Agent"
            sublabel="Per-node collector"
            colorClass="border-[var(--otel-blue)]/30 bg-[var(--otel-blue)]/5"
            tooltip={daemonSetLayer ? getLayerTooltip(daemonSetLayer) : undefined}
            delay={0.2}
          />
        </NodeBox>
      )}

      {hasSidecar && (
        <NodeBox
          label="Pod"
          icon={<Box size={10} className="text-purple-400/70" />}
          colorClass="border-purple-500/30"
          delay={0.15}
          scaleHint="× N pods"
        >
          <ComponentBox
            icon={<Zap size={14} className="text-blue-400" />}
            label="Application"
            sublabel="OTel SDK"
            colorClass="border-blue-500/30 bg-blue-500/5"
            tooltip={{
              title: 'Application',
              description: 'Your service with a co-located sidecar collector for per-service isolation. Exports via OTLP on localhost:4317.',
            }}
            delay={0.2}
          />
          <VerticalFlowConnector label="OTLP" delay={0.22} />
          <ComponentBox
            connectorId={hasDaemonSet ? 'edge-out-sc' : 'edge-out'}
            icon={<CollectorIcon size={14} className="text-purple-400" />}
            label="Sidecar Agent"
            sublabel="Per-pod collector"
            colorClass="border-purple-500/30 bg-purple-500/5"
            tooltip={sidecarLayer ? getLayerTooltip(sidecarLayer) : undefined}
            delay={0.25}
          />
        </NodeBox>
      )}

      {hasDirectSDK && !hasDaemonSet && !hasSidecar && (
        <NodeBox
          label="Pod"
          icon={<Box size={10} className="text-blue-400/70" />}
          colorClass="border-blue-500/30"
          delay={0.1}
          scaleHint="× N pods"
        >
          <ComponentBox
            connectorId="edge-out"
            icon={<Zap size={14} className="text-blue-400" />}
            label="Application"
            sublabel="OTel SDK → direct export"
            colorClass="border-blue-500/30 bg-blue-500/5"
            tooltip={directSDKLayer ? getLayerTooltip(directSDKLayer) : undefined}
            delay={0.15}
          />
        </NodeBox>
      )}
    </>
  );

  if (bare) return edgeContent;

  return (
    <EnvironmentContainer
      label="Kubernetes Cluster"
      icon={<KubernetesIcon size={14} className="text-blue-400" />}
      colorClass="border-blue-500/40"
      bgClass="bg-blue-500/5"
      delay={0}
    >
      {edgeContent}
    </EnvironmentContainer>
  );
}

// ---------------------------------------------------------------------------
// Processing Section
// ---------------------------------------------------------------------------

function ProcessingSection({
  architecture,
  inContainer,
}: {
  architecture: ComposedArchitecture;
  inContainer: boolean;
}) {
  const hasGateway = architecture.processing.some(p => p.id === 'gateway-pool');
  const hasSampling = architecture.processing.some(p => p.id === 'sampling-tier');
  const hasKafka = architecture.buffering.id === 'kafka-buffer';
  const hasPersistentQueue = architecture.buffering.id === 'persistent-queue';
  const hasLoadBalancer = architecture.needsLoadBalancer;

  const gatewayLayer = architecture.processing.find(p => p.id === 'gateway-pool');
  const samplingLayer = architecture.processing.find(p => p.id === 'sampling-tier');

  let d = 0.28;
  const nextDelay = () => { const v = d; d += 0.04; return v; };

  const components = (
    <div className="flex flex-col gap-2 items-stretch min-w-[220px]">
      {hasKafka && (
        <>
          <ComponentBox
            connectorId="proc-kafka-producer"
            icon={<CollectorIcon size={14} className="text-[var(--otel-blue)]" />}
            label="Collector Pool"
            sublabel="OTLP receiver → Kafka exporter"
            colorClass="border-[var(--otel-blue)]/30 bg-[var(--otel-blue)]/5"
            tooltip={{
              title: 'Kafka Producer Collectors',
              description: 'Pool of collectors that receive telemetry via OTLP and write to Kafka topics. Provides buffering and decoupling from downstream processing.',
              meta: [
                { label: 'Receiver', value: 'OTLP (gRPC/HTTP)' },
                { label: 'Exporter', value: 'Kafka (per-signal topics)' },
              ],
            }}
            delay={nextDelay()}
          />
          <VerticalFlowConnector dashed delay={nextDelay()} />
          <ComponentBox
            connectorId="proc-kafka"
            icon={<Database size={14} className="text-red-400" />}
            label="Kafka"
            sublabel="Buffer & durability"
            colorClass="border-red-500/30 bg-red-500/5"
            tooltip={{
              title: 'Kafka Buffer',
              description: architecture.buffering.description,
              meta: [
                { label: 'Provides', value: architecture.buffering.provides.map(p => p.replace(/-/g, ' ')).join(', ') },
              ],
            }}
            delay={nextDelay()}
          />
          <VerticalFlowConnector dashed delay={nextDelay()} />
          <ComponentBox
            connectorId="proc-kafka-consumer"
            icon={<CollectorIcon size={14} className="text-[var(--otel-blue)]" />}
            label="Collector Pool"
            sublabel="Kafka receiver → OTLP exporter"
            colorClass="border-[var(--otel-blue)]/30 bg-[var(--otel-blue)]/5"
            tooltip={{
              title: 'Kafka Consumer Collectors',
              description: 'Pool of collectors that consume from Kafka topics and forward telemetry via OTLP to downstream processing or directly to the backend.',
              meta: [
                { label: 'Receiver', value: 'Kafka (per-signal topics)' },
                { label: 'Exporter', value: 'OTLP (gRPC)' },
              ],
            }}
            delay={nextDelay()}
          />
        </>
      )}
      {hasKafka && (hasLoadBalancer || hasSampling || hasGateway) && <VerticalFlowConnector delay={nextDelay()} />}
      {hasLoadBalancer && !hasSampling && (
        <>
          <ComponentBox
            connectorId="proc-lb"
            icon={<Network size={14} className="text-amber-400" />}
            label="Load Balancer"
            sublabel={architecture.volumeProfile.loadBalancerType}
            colorClass="border-amber-500/30 bg-amber-500/5"
            tooltip={{
              title: 'Load Balancer',
              description: architecture.volumeProfile.tier === 'high'
                ? 'L7 load balancer (NGINX, Envoy) for advanced traffic management, backpressure handling, and health-check-based routing across Gateway Pool replicas.'
                : 'Standard Kubernetes Service distributing telemetry across Gateway Pool replicas via round-robin.',
              meta: [
                { label: 'Type', value: architecture.volumeProfile.loadBalancerType },
                { label: 'Protocol', value: 'OTLP gRPC / HTTP' },
              ],
            }}
            delay={nextDelay()}
          />
          <VerticalFlowConnector delay={nextDelay()} />
        </>
      )}
      {hasSampling && (
        <>
          <NodeBox
            label="Tail Sampling"
            icon={<GitBranch size={10} className="text-purple-400/70" />}
            colorClass="border-purple-500/30"
            delay={nextDelay()}
          >
            <ComponentBox
              connectorId="proc-lb-exporter"
              icon={<CollectorIcon size={14} className="text-purple-400" />}
              label="LB Exporter"
              sublabel="loadbalancingexporter (traceID)"
              colorClass="border-purple-500/30 bg-purple-500/5"
              tooltip={{
                title: 'Load-Balancing Exporter',
                description: 'First tier of the tail sampling setup. Uses the loadbalancingexporter with routing_key: traceID to ensure all spans of a trace reach the same sampling collector.',
                meta: [
                  { label: 'Routing', value: 'traceID hash' },
                  { label: 'Resolver', value: 'DNS (headless Service)' },
                ],
              }}
              delay={nextDelay()}
            />
            <VerticalFlowConnector delay={nextDelay()} />
            <ComponentBox
              connectorId="proc-sampling"
              icon={<CollectorIcon size={14} className="text-purple-400" />}
              label="Sampling Collectors"
              sublabel="tail_sampling processor"
              colorClass="border-purple-500/30 bg-purple-500/5"
              tooltip={samplingLayer ? {
                ...getLayerTooltip(samplingLayer),
                description: 'Second tier: StatefulSet of collectors running the tail_sampling processor. Receives trace-routed spans and makes keep/drop decisions based on configured policies (errors, latency, probabilistic).',
              } : undefined}
              delay={nextDelay()}
            />
          </NodeBox>
          {hasGateway && <VerticalFlowConnector delay={nextDelay()} />}
        </>
      )}
      {hasGateway && (() => {
        const vp = architecture.volumeProfile;
        const baseMeta = gatewayLayer ? getLayerTooltip(gatewayLayer).meta : [];
        const volumeMeta = [
          ...baseMeta,
          { label: 'Replicas', value: vp.replicas },
          { label: 'Placement', value: vp.placement },
          { label: 'Load Balancer', value: vp.loadBalancerType },
        ];
        if (hasPersistentQueue) {
          volumeMeta.push(
            { label: 'Buffering', value: 'Persistent queue (WAL via file_storage)' },
            { label: 'Requires', value: 'StatefulSet with PVC' },
          );
        }
        return (
          <ComponentBox
            connectorId="proc-gateway"
            icon={<CollectorIcon size={14} className="text-orange-400" />}
            label="Gateway Pool"
            sublabel={`${vp.replicas} replicas`}
            colorClass="border-orange-500/30 bg-orange-500/5"
            tooltip={gatewayLayer ? {
              ...getLayerTooltip(gatewayLayer),
              meta: volumeMeta,
            } : undefined}
            badge={hasPersistentQueue ? {
              label: 'WAL',
              icon: <HardDrive size={10} className="text-sky-400" />,
              colorClass: 'bg-sky-500/20 text-sky-400',
            } : undefined}
            delay={nextDelay()}
          />
        );
      })()}
    </div>
  );

  if (inContainer) {
    return (
      <EnvironmentContainer
        label="Processing Environment"
        icon={<Layers size={14} className="text-orange-400" />}
        colorClass="border-orange-500/40"
        bgClass="bg-orange-500/5"
        delay={0.25}
      >
        {components}
      </EnvironmentContainer>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.35 }}
      className="rounded-xl border border-[var(--border-color)]/30 bg-[var(--bg-secondary)]/50 p-3"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Layers size={10} className="text-orange-400/70" />
        <span className="text-[9px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Processing
        </span>
      </div>
      {components}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Backend Section
// ---------------------------------------------------------------------------

function BackendSection() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="rounded-2xl border-2 border-cyan-500/40 bg-cyan-500/5 p-4 flex flex-col gap-3"
    >
      <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]/40">
        <Database size={14} className="text-cyan-400" />
        <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wide">
          Backend
        </span>
      </div>
      <ComponentBox
        connectorId="backend"
        icon={<Database size={14} className="text-cyan-400" />}
        label="Observability Backend"
        sublabel="Traces, Metrics, Logs"
        colorClass="border-cyan-500/30 bg-cyan-500/5"
        tooltip={{
          title: 'Observability Backend',
          description: 'Your telemetry destination — receives all signals via OTLP. Could be Elastic, Grafana Cloud, Dash0, Honeycomb, Jaeger, Prometheus, or any OTLP-compatible backend.',
        }}
        delay={0.55}
      />
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Diagram Component
// ---------------------------------------------------------------------------

export function VisualPipelineDiagram({ architecture }: VisualPipelineDiagramProps) {
  const hasGateway = architecture.processing.some(p => p.id === 'gateway-pool');
  const hasSampling = architecture.processing.some(p => p.id === 'sampling-tier');
  const hasKafka = architecture.buffering.id === 'kafka-buffer';
  const hasLoadBalancer = architecture.needsLoadBalancer;
  const hasProcessing = hasGateway || hasSampling || hasKafka;
  const hasDaemonSet = architecture.edge.some(e => e.id === 'daemonset-agent');
  const hasSidecar = architecture.edge.some(e => e.id === 'sidecar-agent');

  const isHost = architecture.edge.some(e => e.id === 'host-agent');
  const processingInCluster = hasProcessing && !isHost &&
    architecture.volumeProfile.tier !== 'high' && !hasKafka;
  const needsSeparateProcessingEnv =
    hasProcessing && !processingInCluster &&
    (architecture.volumeProfile.tier === 'high' || hasKafka);

  const containerRef = useRef<HTMLDivElement>(null);
  const [registry] = useState(() => new Map<string, HTMLElement>());
  const [, forceUpdate] = useState(0);

  const ctxValue: ConnectorRegistryCtx = {
    register: (id, el) => {
      registry.set(id, el);
      forceUpdate(n => n + 1);
    },
    unregister: (id) => {
      registry.delete(id);
      forceUpdate(n => n + 1);
    },
  };

  const connectors: ConnectorDef[] = [];

  // First component that receives from the edge (always via OTLP).
  // Order: Kafka → Tail Sampling → LB → Gateway → Backend
  const firstProcId = hasKafka
    ? 'proc-kafka-producer'
    : hasSampling ? 'proc-lb-exporter'
    : hasLoadBalancer ? 'proc-lb'
    : hasGateway ? 'proc-gateway'
    : null;

  // Last component that sends to the backend (always via OTLP).
  // Gateway (central processing) runs after sampling so it only processes kept traces.
  const lastProcId = hasGateway ? 'proc-gateway'
    : hasSampling ? 'proc-sampling'
    : hasKafka ? 'proc-kafka-consumer'
    : null;

  if (hasProcessing && firstProcId && lastProcId) {
    const edgeIds = (hasDaemonSet && hasSidecar)
      ? ['edge-out-ds', 'edge-out-sc']
      : ['edge-out'];

    for (const eid of edgeIds) {
      connectors.push({
        fromId: eid, fromSide: 'right',
        toId: firstProcId, toSide: 'left',
        label: 'OTLP',
      });
    }

    connectors.push({
      fromId: lastProcId, fromSide: 'right',
      toId: 'backend', toSide: 'left',
      label: 'OTLP',
    });
  } else {
    const edgeIds = (hasDaemonSet && hasSidecar)
      ? ['edge-out-ds', 'edge-out-sc']
      : ['edge-out'];

    for (const eid of edgeIds) {
      connectors.push({
        fromId: eid, fromSide: 'right',
        toId: 'backend', toSide: 'left',
        label: 'OTLP',
      });
    }
  }

  return (
    <ConnectorRegistryContext.Provider value={ctxValue}>
      <div>
        <div ref={containerRef} className="bg-[var(--bg-tertiary)] rounded-xl p-4 md:p-6 overflow-x-auto relative">
          <div className="flex items-center justify-center gap-8 md:gap-12 min-w-max relative" style={{ zIndex: 2 }}>
            {processingInCluster ? (
              <EnvironmentContainer
                label="Kubernetes Cluster"
                icon={<KubernetesIcon size={14} className="text-blue-400" />}
                colorClass="border-blue-500/40"
                bgClass="bg-blue-500/5"
                delay={0}
              >
                <div className="flex items-center gap-6">
                  <div><EdgeEnvironment architecture={architecture} bare /></div>
                  <div><ProcessingSection architecture={architecture} inContainer={false} /></div>
                </div>
              </EnvironmentContainer>
            ) : (
              <>
                <EdgeEnvironment architecture={architecture} />
                {hasProcessing && (
                  <ProcessingSection
                    architecture={architecture}
                    inContainer={needsSeparateProcessingEnv}
                  />
                )}
              </>
            )}

            <BackendSection />
          </div>

          <ConnectorOverlay
            containerRef={containerRef}
            connectors={connectors}
            registry={registry}
          />

          <DiagramLegend hasKafka={hasKafka} hasLoadBalancer={hasLoadBalancer} hasSampling={hasSampling} />
        </div>
      </div>
    </ConnectorRegistryContext.Provider>
  );
}
