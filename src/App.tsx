import { useStore, StoreProvider } from './store';
import { ReceiptUpload } from './components/ReceiptUpload';
import { AssignView } from './components/AssignView';
import { SplitSummary } from './components/SplitSummary';
import { Receipt } from 'lucide-react';

function StepIndicator() {
  const { state } = useStore();
  const steps = [
    { key: 'upload', label: 'Upload' },
    { key: 'assign', label: 'Assign' },
    { key: 'summary', label: 'Summary' },
  ] as const;

  const currentIndex = steps.findIndex((s) => s.key === state.step);

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center gap-2">
          <div
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300
              ${
                i === currentIndex
                  ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/25'
                  : i < currentIndex
                    ? 'bg-primary-50 text-primary-600'
                    : 'bg-surface-100 text-surface-400'
              }
            `}
          >
            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold leading-none border border-current/20">
              {i + 1}
            </span>
            {step.label}
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-6 h-px transition-colors duration-300 ${
                i < currentIndex ? 'bg-primary-300' : 'bg-surface-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function AppContent() {
  const { state } = useStore();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-surface-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <Receipt className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-surface-900 tracking-tight">
              SplitReceipt
            </span>
          </div>
          <StepIndicator />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {state.step === 'upload' && <ReceiptUpload />}
        {state.step === 'assign' && <AssignView />}
        {state.step === 'summary' && <SplitSummary />}
      </main>

      <footer className="border-t border-surface-100 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-surface-400">
          Built for easy receipt splitting &middot; All processing happens in your browser
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
