import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Lightbulb, HelpCircle } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useAppContext, Requirements } from '../../context/AppContext';
import { scaleLevers, resilienceLever, capabilityLevers, constraintLevers, getCapabilitiesByCategory, ThreePositionLever, getPositionIndex, getValueFromIndex } from '../../data/decisionLevers';
import { ComposedArchitectureView } from '../Composer/ComposedArchitectureView';
import { CollectorIcon } from '../UI/OTelLogo';

export function MainView() {
  const {
    requirements,
    setRequirement,
    showResults,
    setShowResults,
    setCurrentPage,
    composedArchitecture,
  } = useAppContext();

  return (
    <main className="pt-20 pb-8 px-4 max-w-5xl mx-auto">
      <AnimatePresence mode="wait">
        {!showResults ? (
          <motion.div
            key="requirements"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
          >
            {/* Introduction */}
            <div className="text-center mb-8">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-3"
              >
                What does your telemetry pipeline need?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-[var(--text-secondary)] max-w-2xl mx-auto"
              >
                Select your requirements below. We'll compose an architecture from compatible layers
                that work together to meet your needs.
              </motion.p>
            </div>

            {/* Insight box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[var(--otel-blue)]/10 border border-[var(--otel-blue)]/30 rounded-lg p-4 mb-8 flex items-start gap-3"
            >
              <Lightbulb className="text-[var(--otel-blue)] flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm text-[var(--text-primary)]">
                  <strong>Composable architecture:</strong> Unlike picking a single pattern, 
                  you can combine layers. Need both host metrics AND per-service isolation? 
                  Use DaemonSet + Sidecar together. Each selection adds to your pipeline.
                </p>
              </div>
            </motion.div>

            {/* Collection Capabilities */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Collection Capabilities
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                What telemetry signals do you need to collect?
              </p>
              
              <div className="grid gap-4 md:grid-cols-2">
                {/* Application Collection Box */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <CollectionBox
                    title="Applications"
                    description="Telemetry emitted by your applications via SDK"
                    icon="Zap"
                    color="blue"
                    signals={getCapabilitiesByCategory('app-collection')}
                    requirements={requirements}
                    setRequirement={setRequirement}
                  />
                </motion.div>

                {/* Infrastructure Collection Box */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <CollectionBox
                    title="Infrastructure"
                    description="Telemetry collected from nodes via DaemonSet agent"
                    icon="Server"
                    color="green"
                    signals={getCapabilitiesByCategory('infra-collection')}
                    requirements={requirements}
                    setRequirement={setRequirement}
                    disabled={requirements.serverlessKubernetes}
                    disabledReason="Not available on serverless Kubernetes"
                  />
                </motion.div>
              </div>
            </div>

            {/* Scale & Resilience Requirements */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Scale & Resilience
              </h3>
              <div className="grid gap-4">
                {scaleLevers.map((lever, idx) => (
                  <motion.div
                    key={lever.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + 0.05 * idx }}
                  >
                    <ThreePositionSlider
                      lever={lever}
                      value={requirements[lever.id as keyof Requirements] as number}
                      onChange={(value) => setRequirement(lever.id as keyof Requirements, value as never)}
                    />
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <ThreePositionSlider
                    lever={resilienceLever}
                    value={requirements.dataLossPolicy}
                    onChange={(value) => setRequirement('dataLossPolicy', value as never)}
                  />
                </motion.div>
              </div>
            </div>

            {/* Capability Needs - Processing */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Processing Capabilities
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                What processing do you need in the pipeline?
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {getCapabilitiesByCategory('processing').map((lever, idx) => (
                  <motion.div
                    key={lever.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + 0.05 * idx }}
                  >
                    <CapabilityToggle
                      lever={lever}
                      value={requirements[lever.id as keyof Requirements] as boolean}
                      onChange={(value) => setRequirement(lever.id as keyof Requirements, value as never)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Capability Needs - Routing */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Routing Capabilities
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Where does telemetry need to go?
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {getCapabilitiesByCategory('routing').map((lever, idx) => (
                  <motion.div
                    key={lever.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + 0.05 * idx }}
                  >
                    <CapabilityToggle
                      lever={lever}
                      value={requirements[lever.id as keyof Requirements] as boolean}
                      onChange={(value) => setRequirement(lever.id as keyof Requirements, value as never)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Environment Constraints */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Environment Constraints
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                Any infrastructure limitations?
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {constraintLevers.map((lever, idx) => (
                  <motion.div
                    key={lever.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + 0.05 * idx }}
                  >
                    <ConstraintToggle
                      lever={lever}
                      value={requirements[lever.id as keyof Requirements] as boolean}
                      onChange={(value) => {
                        setRequirement(lever.id as keyof Requirements, value as never);
                        // If enabling serverless, disable infrastructure collection
                        if (lever.id === 'serverlessKubernetes' && value) {
                          setRequirement('needsInfraLogs', false as never);
                          setRequirement('needsInfraMetrics', false as never);
                        }
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Build button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col items-center gap-4"
            >
              <button
                onClick={() => setShowResults(true)}
                className="flex items-center gap-2 px-8 py-4 bg-[var(--otel-blue)] hover:bg-[var(--otel-dark-blue)] text-white font-semibold rounded-lg transition-colors text-lg"
              >
                Build My Architecture
                <ArrowRight size={20} />
              </button>
              <button
                onClick={() => setCurrentPage('how-it-works')}
                className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--otel-blue)] transition-colors"
              >
                <HelpCircle size={18} />
                <span>How does composition work?</span>
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Back button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowResults(false)}
              className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6"
            >
              <ArrowLeft size={18} />
              <span>Modify requirements</span>
            </motion.button>

            {/* Composed Architecture View */}
            <ComposedArchitectureView architecture={composedArchitecture} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

// Three Position Slider Component
interface ThreePositionSliderProps {
  lever: ThreePositionLever;
  value: number | string;
  onChange: (value: number | string) => void;
}

function ThreePositionSlider({ lever, value, onChange }: ThreePositionSliderProps) {
  const IconComponent = Icons[lever.icon as keyof typeof Icons] as React.ComponentType<{ size?: number; className?: string }>;
  const currentIndex = getPositionIndex(lever, value);
  const currentPosition = lever.positions[currentIndex];

  const handleClick = (index: number) => {
    onChange(getValueFromIndex(lever, index));
  };

  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-[var(--otel-blue)]">
          {IconComponent && <IconComponent size={20} />}
        </div>
        <div>
          <h4 className="font-medium text-[var(--text-primary)]">{lever.name}</h4>
          <p className="text-xs text-[var(--text-secondary)]">{lever.description}</p>
        </div>
      </div>

      {/* Slider Track */}
      <div className="relative px-2">
        {/* Background track */}
        <div className="h-2 bg-[var(--bg-tertiary)] rounded-full" />
        
        {/* Active track */}
        <motion.div
          className="absolute top-0 left-2 h-2 bg-[var(--otel-blue)] rounded-full"
          initial={false}
          animate={{ width: `calc(${(currentIndex / 2) * 100}% - ${currentIndex === 0 ? 0 : 8}px)` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />

        {/* Position dots */}
        <div className="absolute top-0 left-0 right-0 flex justify-between px-2">
          {lever.positions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleClick(idx)}
              className="relative -top-1 group"
            >
              {/* Dot */}
              <motion.div
                className={`w-4 h-4 rounded-full border-2 transition-colors ${
                  idx <= currentIndex
                    ? 'bg-[var(--otel-blue)] border-[var(--otel-blue)]'
                    : 'bg-[var(--bg-secondary)] border-[var(--bg-tertiary)] group-hover:border-[var(--otel-blue)]/50'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-4">
        {lever.positions.map((position, idx) => (
          <button
            key={idx}
            onClick={() => handleClick(idx)}
            className={`text-center flex-1 transition-colors ${
              idx === currentIndex
                ? 'text-[var(--otel-blue)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <div className={`text-sm font-medium ${idx === currentIndex ? 'text-[var(--otel-blue)]' : ''}`}>
              {position.label}
            </div>
            <div className="text-xs opacity-75">{position.description}</div>
          </button>
        ))}
      </div>

      {/* Current selection impact */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 pt-3 border-t border-[var(--border-color)]"
      >
        <div className="text-xs text-[var(--otel-light-blue)]">
          Selected: <span className="font-medium">{currentPosition.label}</span> — {currentPosition.description}
        </div>
      </motion.div>
    </div>
  );
}

// Capability Toggle Component
interface CapabilityToggleProps {
  lever: typeof capabilityLevers[0];
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  disabledReason?: string;
}

function CapabilityToggle({ lever, value, onChange, disabled, disabledReason }: CapabilityToggleProps) {
  const IconComponent = Icons[lever.icon as keyof typeof Icons] as React.ComponentType<{ size?: number; className?: string }>;
  const iconColor = value && !disabled ? 'text-[var(--otel-blue)]' : 'text-[var(--text-secondary)]';

  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className={`w-full h-full text-left p-4 rounded-lg border transition-all ${
        disabled
          ? 'bg-[var(--bg-tertiary)] border-[var(--border-color)] opacity-50 cursor-not-allowed'
          : value
          ? 'bg-[var(--otel-blue)]/10 border-[var(--otel-blue)]'
          : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-[var(--otel-blue)]/50'
      }`}
    >
      <div className="flex items-start gap-3 h-full">
        <div className={`mt-0.5 ${iconColor}`}>
          {lever.isCollector ? (
            <CollectorIcon size={20} className={iconColor} />
          ) : (
            IconComponent && <IconComponent size={20} />
          )}
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${value && !disabled ? 'text-[var(--otel-blue)]' : 'text-[var(--text-primary)]'}`}>
              {lever.name}
            </h4>
            <div
              className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${
                value && !disabled ? 'bg-[var(--otel-blue)]' : 'bg-[var(--bg-tertiary)]'
              }`}
            >
              <motion.div
                animate={{ x: value && !disabled ? 20 : 2 }}
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
              />
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{lever.description}</p>
          {/* Fixed height impact area - always reserve space */}
          <div className="mt-2 min-h-[2.5rem]">
            {value && !disabled && (
              <p className="text-xs text-[var(--otel-light-blue)]">
                {lever.impact}
              </p>
            )}
            {disabled && disabledReason && (
              <p className="text-xs text-yellow-400">{disabledReason}</p>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// Collection Box Component - groups multiple signal toggles in one card
interface CollectionBoxProps {
  title: string;
  description: string;
  icon: string;
  color: 'blue' | 'green';
  signals: typeof capabilityLevers;
  requirements: Requirements;
  setRequirement: <K extends keyof Requirements>(key: K, value: Requirements[K]) => void;
  disabled?: boolean;
  disabledReason?: string;
}

function CollectionBox({ 
  title, 
  description, 
  icon, 
  color, 
  signals, 
  requirements, 
  setRequirement,
  disabled,
  disabledReason 
}: CollectionBoxProps) {
  const IconComponent = Icons[icon as keyof typeof Icons] as React.ComponentType<{ size?: number; className?: string }>;
  
  const colorClasses = {
    blue: {
      border: 'border-blue-500/30',
      activeBorder: 'border-blue-500',
      bg: 'bg-blue-500/5',
      text: 'text-blue-400',
      toggle: 'bg-blue-500',
      dot: 'bg-blue-500',
    },
    green: {
      border: 'border-green-500/30',
      activeBorder: 'border-green-500',
      bg: 'bg-green-500/5',
      text: 'text-green-400',
      toggle: 'bg-green-500',
      dot: 'bg-green-500',
    },
  };
  
  const colors = colorClasses[color];
  const hasAnyEnabled = signals.some(s => requirements[s.id as keyof Requirements] as boolean);
  
  return (
    <div
      className={`p-4 rounded-lg border transition-all h-full flex flex-col ${
        disabled
          ? 'bg-[var(--bg-tertiary)] border-[var(--border-color)] opacity-50'
          : hasAnyEnabled
          ? `${colors.bg} ${colors.activeBorder}`
          : `bg-[var(--bg-secondary)] ${colors.border}`
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`mt-0.5 ${disabled ? 'text-[var(--text-secondary)]' : colors.text}`}>
          {IconComponent && <IconComponent size={22} />}
        </div>
        <div className="flex-1">
          <h4 className={`font-medium ${disabled ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
            {title}
          </h4>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{description}</p>
          {disabled && disabledReason && (
            <p className="text-xs text-yellow-400 mt-1">{disabledReason}</p>
          )}
        </div>
      </div>

      {/* Spacer to push toggles to bottom */}
      <div className="flex-1" />

      {/* Signal Toggles - single row at bottom */}
      <div className="flex items-center justify-center gap-4 pt-3 border-t border-[var(--border-color)]">
        {signals.map((signal) => {
          const SignalIcon = Icons[signal.icon as keyof typeof Icons] as React.ComponentType<{ size?: number; className?: string }>;
          const isEnabled = requirements[signal.id as keyof Requirements] as boolean;
          const label = signal.name.replace('Application ', '').replace('Infrastructure ', '');
          
          return (
            <button
              key={signal.id}
              onClick={() => !disabled && setRequirement(signal.id as keyof Requirements, !isEnabled as never)}
              disabled={disabled}
              className={`flex flex-col items-center gap-1 p-2 rounded-md transition-all ${
                disabled
                  ? 'cursor-not-allowed'
                  : 'hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              <div className={`${isEnabled && !disabled ? colors.text : 'text-[var(--text-secondary)]'}`}>
                {SignalIcon && <SignalIcon size={18} />}
              </div>
              <span className={`text-xs ${isEnabled && !disabled ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                {label}
              </span>
              <div
                className={`w-8 h-4 rounded-full transition-colors relative ${
                  isEnabled && !disabled ? colors.toggle : 'bg-[var(--bg-tertiary)]'
                }`}
              >
                <motion.div
                  animate={{ x: isEnabled && !disabled ? 16 : 2 }}
                  className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow"
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Constraint Toggle Component
interface ConstraintToggleProps {
  lever: typeof constraintLevers[0];
  value: boolean;
  onChange: (value: boolean) => void;
}

function ConstraintToggle({ lever, value, onChange }: ConstraintToggleProps) {
  const IconComponent = Icons[lever.icon as keyof typeof Icons] as React.ComponentType<{ size?: number; className?: string }>;

  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-full text-left p-4 rounded-lg border transition-all ${
        value
          ? 'bg-yellow-500/10 border-yellow-500'
          : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-yellow-500/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${value ? 'text-yellow-400' : 'text-[var(--text-secondary)]'}`}>
          {IconComponent && <IconComponent size={20} />}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${value ? 'text-yellow-400' : 'text-[var(--text-primary)]'}`}>
              {lever.name}
            </h4>
            <div
              className={`w-10 h-5 rounded-full transition-colors relative ${
                value ? 'bg-yellow-500' : 'bg-[var(--bg-tertiary)]'
              }`}
            >
              <motion.div
                animate={{ x: value ? 20 : 2 }}
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
              />
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{lever.description}</p>
          {value && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-xs text-yellow-300 mt-2"
            >
              {lever.impact}
            </motion.p>
          )}
        </div>
      </div>
    </button>
  );
}
