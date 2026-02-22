import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical, X, Pencil, Check, Trash2, Users, Scissors } from 'lucide-react';
import { useStore, parseLeadingQty } from '../store';
import { formatCurrency } from '../utils';
import type { ReceiptItem } from '../types';

interface Props {
  item: ReceiptItem;
}

export function ReceiptItemCard({ item }: Props) {
  const { state, dispatch } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editPrice, setEditPrice] = useState(item.price.toString());
  const [showPeople, setShowPeople] = useState(false);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { type: 'receipt-item', item },
  });

  const assignedPeople = state.people.filter((p) =>
    item.assignedTo.includes(p.id)
  );
  const splitCount = item.assignedTo.length;
  const isAssigned = splitCount > 0;
  const qty = parseLeadingQty(item.name);
  const canSplitLine = qty > 1;

  const saveEdit = () => {
    const price = parseFloat(editPrice);
    if (!isNaN(price) && price > 0 && editName.trim()) {
      dispatch({
        type: 'UPDATE_ITEM',
        id: item.id,
        updates: { name: editName.trim(), price },
      });
    }
    setIsEditing(false);
  };

  const togglePerson = (personId: string) => {
    if (item.assignedTo.includes(personId)) {
      dispatch({ type: 'UNASSIGN_ITEM', itemId: item.id, personId });
    } else {
      dispatch({ type: 'ASSIGN_ITEM', itemId: item.id, personId });
    }
  };

  if (isEditing) {
    return (
      <div className="rounded-xl border-2 border-primary-500 bg-white p-3 shadow-lg ring-4 ring-primary-500/10">
        <div className="flex gap-2 mb-2">
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="flex-1 px-2 py-1.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-500"
            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
          />
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-surface-400">$</span>
            <input
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              className="w-24 pl-6 pr-2 py-1.5 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-500 text-right"
              type="number"
              step="0.01"
              onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
            />
          </div>
        </div>
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setIsEditing(false)}
            className="p-1.5 text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={saveEdit}
            className="p-1.5 text-primary-500 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`
        rounded-xl border bg-white transition-all duration-200 cursor-grab active:cursor-grabbing touch-none
        ${isDragging ? 'opacity-30 border-dashed border-surface-300' : 'shadow-sm hover:shadow-md border-surface-200'}
        ${isAssigned ? 'border-l-[3px]' : ''}
      `}
    >
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-3">
          <div className="text-surface-300 shrink-0">
            <GripVertical className="w-5 h-5" />
          </div>

          <span className="flex-1 min-w-0 text-[15px] font-medium text-surface-800 truncate">
            {item.name}
          </span>

          <span className="text-[15px] font-semibold text-surface-900 tabular-nums shrink-0">
            {formatCurrency(item.price)}
          </span>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            {canSplitLine && (
              <button
                onClick={() => dispatch({ type: 'SPLIT_LINE_ITEM', id: item.id })}
                className="p-2 text-surface-400 hover:text-primary-500 rounded-lg hover:bg-primary-50 transition-colors"
                title={`Split into ${qty} separate items`}
              >
                <Scissors className="w-[18px] h-[18px]" />
              </button>
            )}
            {state.people.length > 0 && (
              <button
                onClick={() => setShowPeople(!showPeople)}
                className={`p-2 rounded-lg transition-colors ${
                  showPeople
                    ? 'text-primary-500 bg-primary-50'
                    : 'text-surface-400 hover:text-primary-500 hover:bg-primary-50'
                }`}
                title="Assign to people"
              >
                <Users className="w-[18px] h-[18px]" />
              </button>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-50 transition-colors"
            >
              <Pencil className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={() => dispatch({ type: 'REMOVE_ITEM', id: item.id })}
              className="p-2 text-surface-400 hover:text-danger rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        {isAssigned && (
          <div className="flex items-center gap-1.5 pl-8 flex-wrap">
            {assignedPeople.map((person) => (
              <button
                key={person.id}
                onClick={() => togglePerson(person.id)}
                className="flex items-center gap-1 pl-2 pr-1.5 py-1 rounded-md text-xs font-medium transition-all hover:opacity-70 group/tag"
                style={{
                  backgroundColor: `${person.color}15`,
                  color: person.color,
                }}
              >
                <span className="truncate max-w-[80px]">{person.name}</span>
                {splitCount > 1 && (
                  <span className="opacity-60">
                    ({formatCurrency(item.price / splitCount)})
                  </span>
                )}
                <X className="w-3.5 h-3.5 opacity-0 group-hover/tag:opacity-100 transition-opacity" />
              </button>
            ))}
            {splitCount > 1 && (
              <span className="flex items-center gap-0.5 text-xs text-surface-400 ml-1">
                <Users className="w-3.5 h-3.5" />
                {splitCount}-way
              </span>
            )}
          </div>
        )}
      </div>

      {showPeople && state.people.length > 0 && (
        <div className="px-3 pb-3 pt-0">
          <div className="flex flex-wrap gap-1.5 p-2 bg-surface-50 rounded-lg border border-surface-100">
            <span className="text-[11px] text-surface-400 font-medium w-full mb-0.5">
              Click to assign / unassign:
            </span>
            {state.people.map((person) => {
              const isOn = item.assignedTo.includes(person.id);
              return (
                <button
                  key={person.id}
                  onClick={() => togglePerson(person.id)}
                  className={`
                    flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150
                    ${isOn
                      ? 'shadow-sm ring-1 ring-inset'
                      : 'opacity-50 hover:opacity-80'
                    }
                  `}
                  style={{
                    backgroundColor: isOn ? `${person.color}18` : `${person.color}08`,
                    color: person.color,
                    ...(isOn ? { ringColor: `${person.color}40` } : {}),
                  }}
                >
                  <div
                    className={`w-2 h-2 rounded-full transition-all ${isOn ? 'scale-100' : 'scale-75'}`}
                    style={{ backgroundColor: person.color }}
                  />
                  {person.name}
                  {isOn && <Check className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
          {splitCount > 1 && (
            <p className="text-[11px] text-surface-400 mt-1.5 text-center">
              Splitting {formatCurrency(item.price)} {splitCount} ways = {formatCurrency(item.price / splitCount)} each
            </p>
          )}
        </div>
      )}
    </div>
  );
}
