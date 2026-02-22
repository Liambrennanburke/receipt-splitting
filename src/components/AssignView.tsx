import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { useStore } from '../store';
import { PeopleManager } from './PeopleManager';
import { ItemsList } from './ItemsList';
import { PersonDropZone } from './PersonDropZone';
import { TaxTipControls } from './TaxTipControls';
import { MealDetails } from './MealDetails';
import { ReceiptViewer } from './ReceiptViewer';
import { formatCurrency } from '../utils';
import type { ReceiptItem } from '../types';

export function AssignView() {
  const { state, dispatch } = useStore();
  const [activeItem, setActiveItem] = useState<ReceiptItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const item = event.active.data.current?.item as ReceiptItem | undefined;
    if (item) setActiveItem(item);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    const itemId = active.id as string;
    const droppableData = over.data.current;

    if (droppableData?.type === 'person') {
      dispatch({
        type: 'ASSIGN_ITEM',
        itemId,
        personId: droppableData.personId,
      });
    }
  };

  const unassignedCount = state.items.filter(
    (i) => i.assignedTo.length === 0
  ).length;

  const canProceed = state.people.length > 0 && unassignedCount === 0;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch({ type: 'SET_STEP', step: 'upload' })}
              className="flex items-center gap-2 text-surface-500 hover:text-surface-700 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Upload new receipt
            </button>
            <ReceiptViewer />
          </div>

          <button
            onClick={() => dispatch({ type: 'SET_STEP', step: 'summary' })}
            disabled={!canProceed}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
              ${
                canProceed
                  ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-md shadow-primary-500/25 active:scale-95'
                  : 'bg-surface-100 text-surface-400 cursor-not-allowed'
              }
            `}
          >
            View Summary
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <MealDetails />
        <PeopleManager />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ItemsList />
            <TaxTipControls />
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-surface-100">
                <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wider">
                  Drop zones
                </h3>
                <p className="text-xs text-surface-400 mt-0.5">
                  Drag items to assign them &middot; Items can be shared
                </p>
              </div>
              <div className="p-4 space-y-3">
                {state.people.length === 0 ? (
                  <div className="text-center py-8 text-surface-400">
                    <p className="text-sm">Add people above to create drop zones</p>
                  </div>
                ) : (
                  state.people.map((person) => (
                    <PersonDropZone key={person.id} person={person} />
                  ))
                )}
              </div>
            </div>

            {unassignedCount > 0 && state.people.length > 0 && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-warning/10 border border-warning/20">
                <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <p className="text-sm text-surface-600">
                  <span className="font-medium">{unassignedCount} item{unassignedCount > 1 ? 's' : ''}</span>{' '}
                  still unassigned. Drag them to a person or they won't be included in the split.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {activeItem && (
          <div className="bg-white rounded-xl border border-primary-300 shadow-2xl px-4 py-3 max-w-xs">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-surface-800 truncate">
                {activeItem.name}
              </span>
              <span className="text-sm font-semibold text-surface-900 tabular-nums shrink-0">
                {formatCurrency(activeItem.price)}
              </span>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
