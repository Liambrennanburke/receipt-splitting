import { DollarSign, Percent } from 'lucide-react';
import { useStore } from '../store';
import type { SplitMode } from '../types';

export function TaxTipControls() {
  const { state, dispatch } = useStore();

  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-surface-100">
        <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wider">
          Tax & Tip
        </h3>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-surface-500 mb-1.5 block">
              Tax
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={state.tax || ''}
                onChange={(e) =>
                  dispatch({ type: 'SET_TAX', tax: parseFloat(e.target.value) || 0 })
                }
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all tabular-nums"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-surface-500 mb-1.5 block">
              Tip
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={state.tip || ''}
                onChange={(e) =>
                  dispatch({ type: 'SET_TIP', tip: parseFloat(e.target.value) || 0 })
                }
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all tabular-nums"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-surface-500 mb-2 block">
            Split method
          </label>
          <div className="flex rounded-lg border border-surface-200 overflow-hidden">
            {(['proportional', 'even'] as SplitMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => dispatch({ type: 'SET_SPLIT_MODE', mode })}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-150
                  ${
                    state.splitMode === mode
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-surface-600 hover:bg-surface-50'
                  }
                `}
              >
                {mode === 'proportional' ? (
                  <Percent className="w-3.5 h-3.5" />
                ) : (
                  <DollarSign className="w-3.5 h-3.5" />
                )}
                {mode === 'proportional' ? 'Proportional' : 'Even'}
              </button>
            ))}
          </div>
          <p className="text-xs text-surface-400 mt-1.5">
            {state.splitMode === 'proportional'
              ? 'Tax & tip are split based on each person\'s share of the subtotal'
              : 'Tax & tip are divided equally among everyone with items'}
          </p>
        </div>
      </div>
    </div>
  );
}
