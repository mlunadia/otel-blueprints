import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { getLayer } from '../../data/layers';
import { LayerCard } from '../Composer/LayerCard';

export function Sidebar() {
  const { expandedPanel, setExpandedPanel, sidebarOpen, setSidebarOpen } = useAppContext();

  // In the new model, expandedPanel could be a layer ID
  const layer = expandedPanel ? getLayer(expandedPanel) : null;

  const handleClose = () => {
    setExpandedPanel(null);
    setSidebarOpen(false);
  };

  return (
    <AnimatePresence>
      {sidebarOpen && layer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[var(--bg-primary)] z-50 overflow-y-auto"
        >
          {/* Header with back button and close button */}
          <div className="sticky top-0 bg-[var(--bg-primary)]/95 backdrop-blur-md border-b border-[var(--border-color)] z-10">
            <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
              <button
                onClick={handleClose}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>
              <h2 className="font-semibold text-xl text-[var(--text-primary)]">
                {layer.name}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <X size={24} className="text-[var(--text-secondary)]" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-5xl mx-auto px-4 py-8">
            <LayerCard layer={layer} layerType={layer.type} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
