import { ArrowLeft, RotateCcw, Check, Copy, MapPin, CalendarDays } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency, getPersonTotal } from '../utils';
import { useState } from 'react';

export function SplitSummary() {
  const { state, dispatch } = useStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const subtotal = state.items.reduce((sum, i) => sum + i.price, 0);
  const grandTotal = subtotal + state.tax + state.tip;

  const personTotals = state.people.map((person) => ({
    person,
    ...getPersonTotal(
      person.id,
      state.items,
      state.tax,
      state.tip,
      state.splitMode,
      state.people
    ),
  }));

  const accounted = personTotals.reduce((sum, pt) => sum + pt.total, 0);

  const copyToClipboard = (person: typeof personTotals[0]) => {
    const header = [
      state.restaurantName,
      state.mealDate,
    ].filter(Boolean);
    const lines = [
      ...(header.length ? [`${header.join(' — ')}`, ''] : []),
      `${person.person.name}: ${formatCurrency(person.total)}`,
      `  Items: ${formatCurrency(person.itemsTotal)}`,
      `  Tax: ${formatCurrency(person.taxShare)}`,
      `  Tip: ${formatCurrency(person.tipShare)}`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedId(person.person.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => dispatch({ type: 'SET_STEP', step: 'assign' })}
          className="flex items-center gap-2 text-surface-500 hover:text-surface-700 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to editing
        </button>
        <button
          onClick={() => dispatch({ type: 'RESET' })}
          className="flex items-center gap-2 text-surface-400 hover:text-danger text-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Start over
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-surface-100 bg-gradient-to-r from-primary-500 to-primary-600">
          {(state.restaurantName || state.mealDate) && (
            <div className="flex items-center gap-4 mb-2">
              {state.restaurantName && (
                <span className="flex items-center gap-1.5 text-sm text-white/80">
                  <MapPin className="w-3.5 h-3.5" />
                  {state.restaurantName}
                </span>
              )}
              {state.mealDate && (
                <span className="flex items-center gap-1.5 text-sm text-white/80">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {state.mealDate}
                </span>
              )}
            </div>
          )}
          <h2 className="text-xl font-bold text-white">Bill Summary</h2>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-3xl font-bold text-white tabular-nums">
              {formatCurrency(grandTotal)}
            </span>
            <span className="text-primary-200 text-sm">
              split {state.people.length} ways &middot;{' '}
              {state.splitMode === 'proportional' ? 'proportional' : 'even'} tax & tip
            </span>
          </div>
        </div>

        <div className="divide-y divide-surface-100">
          {personTotals
            .sort((a, b) => b.total - a.total)
            .map((pt) => (
              <div
                key={pt.person.id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-surface-50/50 transition-colors group"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                  style={{ backgroundColor: pt.person.color }}
                >
                  {pt.person.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-surface-900">
                    {pt.person.name}
                  </p>
                  <p className="text-xs text-surface-400 mt-0.5">
                    {formatCurrency(pt.itemsTotal)} items
                    {pt.taxShare > 0 && ` + ${formatCurrency(pt.taxShare)} tax`}
                    {pt.tipShare > 0 && ` + ${formatCurrency(pt.tipShare)} tip`}
                  </p>
                </div>
                <span
                  className="text-xl font-bold tabular-nums text-surface-900"
                >
                  {formatCurrency(pt.total)}
                </span>
                <button
                  onClick={() => copyToClipboard(pt)}
                  className="p-2 rounded-lg text-surface-300 hover:text-surface-600 hover:bg-surface-100 opacity-0 group-hover:opacity-100 transition-all"
                  title="Copy breakdown"
                >
                  {copiedId === pt.person.id ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
        </div>

        <div className="px-6 py-4 bg-surface-50 border-t border-surface-200">
          <div className="flex justify-between text-sm text-surface-500">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-surface-500 mt-1">
            <span>Tax</span>
            <span className="tabular-nums">{formatCurrency(state.tax)}</span>
          </div>
          <div className="flex justify-between text-sm text-surface-500 mt-1">
            <span>Tip</span>
            <span className="tabular-nums">{formatCurrency(state.tip)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold text-surface-900 mt-2 pt-2 border-t border-surface-200">
            <span>Total accounted</span>
            <span className="tabular-nums">{formatCurrency(accounted)}</span>
          </div>
          {Math.abs(grandTotal - accounted) > 0.01 && (
            <div className="flex justify-between text-sm text-warning font-medium mt-1">
              <span>Unaccounted</span>
              <span className="tabular-nums">
                {formatCurrency(grandTotal - accounted)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
