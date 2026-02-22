import { useDroppable } from '@dnd-kit/core';
import { ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency, getPersonTotal } from '../utils';
import type { Person } from '../types';

interface Props {
  person: Person;
}

export function PersonDropZone({ person }: Props) {
  const { state } = useStore();
  const { isOver, setNodeRef } = useDroppable({
    id: `person-${person.id}`,
    data: { type: 'person', personId: person.id },
  });

  const { itemsTotal, taxShare, tipShare, total } = getPersonTotal(
    person.id,
    state.items,
    state.tax,
    state.tip,
    state.splitMode,
    state.people
  );

  const assignedItems = state.items.filter((item) =>
    item.assignedTo.includes(person.id)
  );

  const hasItems = assignedItems.length > 0;

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden
        ${isOver ? 'border-solid scale-[1.02] shadow-lg' : ''}
        ${hasItems ? 'border-solid bg-white shadow-sm' : 'bg-surface-50/50'}
      `}
      style={{
        borderColor: isOver ? person.color : hasItems ? `${person.color}40` : undefined,
        backgroundColor: isOver ? `${person.color}08` : undefined,
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{
          borderBottom: hasItems ? `1px solid ${person.color}20` : undefined,
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
          style={{ backgroundColor: person.color }}
        >
          {person.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-surface-900 truncate">
            {person.name}
          </p>
          {!hasItems && (
            <p className="text-xs text-surface-400">
              {isOver ? 'Release to assign' : 'Drag items here'}
            </p>
          )}
        </div>
        {hasItems && (
          <span
            className="text-lg font-bold tabular-nums"
            style={{ color: person.color }}
          >
            {formatCurrency(total)}
          </span>
        )}
      </div>

      {hasItems && (
        <div className="px-4 py-2 space-y-0.5">
          {assignedItems.map((item) => {
            const splitCount = item.assignedTo.length;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between py-1 text-sm"
              >
                <span className="text-surface-600 truncate flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-surface-300" />
                  {item.name}
                  {splitCount > 1 && (
                    <span className="text-xs text-surface-400">
                      (1/{splitCount})
                    </span>
                  )}
                </span>
                <span className="text-surface-700 font-medium tabular-nums ml-2">
                  {formatCurrency(item.price / splitCount)}
                </span>
              </div>
            );
          })}

          <div className="border-t mt-2 pt-2 space-y-0.5" style={{ borderColor: `${person.color}15` }}>
            <div className="flex justify-between text-xs text-surface-400">
              <span>Items</span>
              <span className="tabular-nums">{formatCurrency(itemsTotal)}</span>
            </div>
            {taxShare > 0 && (
              <div className="flex justify-between text-xs text-surface-400">
                <span>Tax</span>
                <span className="tabular-nums">{formatCurrency(taxShare)}</span>
              </div>
            )}
            {tipShare > 0 && (
              <div className="flex justify-between text-xs text-surface-400">
                <span>Tip</span>
                <span className="tabular-nums">{formatCurrency(tipShare)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
