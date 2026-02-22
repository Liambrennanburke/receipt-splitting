import { useState } from 'react';
import { Image, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useStore } from '../store';

export function ReceiptViewer() {
  const { state } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  if (!state.receiptImage) return null;

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setZoom(1);
        }}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-surface-500
          hover:text-primary-500 bg-white border border-surface-200 rounded-lg
          hover:border-primary-300 hover:bg-primary-50/50 transition-all shadow-sm"
      >
        <Image className="w-4 h-4" />
        View receipt
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-sm" />

          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-surface-100">
              <h3 className="text-sm font-semibold text-surface-900">
                Original Receipt
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                  className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-50 transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs text-surface-400 w-10 text-center tabular-nums">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                  className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-50 transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-surface-200 mx-1" />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-surface-50 flex items-start justify-center">
              <img
                src={state.receiptImage}
                alt="Uploaded receipt"
                className="rounded-lg shadow-md transition-transform duration-200 origin-top"
                style={{ transform: `scale(${zoom})` }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
