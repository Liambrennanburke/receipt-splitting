import { useStore, StoreProvider } from './store';
import { ReceiptUpload } from './components/ReceiptUpload';
import { AssignView } from './components/AssignView';
import { SplitSummary } from './components/SplitSummary';
function ReceiptLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 2C4 0.895 4.895 0 6 0H30C31.105 0 32 0.895 32 2V36.5L27 33.5L22 36.5L18 33.5L14 36.5L9 33.5L4 36.5V2Z"
        fill="currentColor"
      />
      <line x1="10" y1="10" x2="26" y2="10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="10" y1="16" x2="26" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="10" y1="22" x2="20" y2="22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="18" y1="0" x2="18" y2="36.5" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
    </svg>
  );
}

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
          <div className="flex items-center gap-3">
            <ReceiptLogo className="w-8 h-9 text-surface-900" />
            <div className="flex flex-col">
              <span className="text-[22px] font-extrabold text-surface-900 tracking-[-0.03em] leading-none">
                Receipt Split
              </span>
              <span className="text-[11px] text-surface-400 tracking-[0.05em] mt-0.5">
                a <span className="font-bold text-surface-500">LBB</span> project
              </span>
            </div>
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
