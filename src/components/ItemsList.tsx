import { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { useStore } from '../store';
import { ReceiptItemCard } from './ReceiptItemCard';
import { formatCurrency } from '../utils';

export function ItemsList() {
  const { state, dispatch } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const subtotal = state.items.reduce((sum, item) => sum + item.price, 0);
  const unassignedCount = state.items.filter(
    (i) => i.assignedTo.length === 0
  ).length;

  const addItem = () => {
    const price = parseFloat(newPrice);
    if (!newName.trim() || isNaN(price) || price <= 0) return;
    dispatch({
      type: 'ADD_ITEM',
      item: {
        id: crypto.randomUUID(),
        name: newName.trim(),
        price,
        assignedTo: [],
      },
    });
    setNewName('');
    setNewPrice('');
    setShowAdd(false);
  };

  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wider">
            Receipt Items
          </h3>
          <p className="text-xs text-surface-400 mt-0.5">
            {state.items.length} items &middot; Subtotal{' '}
            {formatCurrency(subtotal)}
            {unassignedCount > 0 && (
              <span className="text-warning"> &middot; {unassignedCount} unassigned</span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="p-2 text-surface-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {showAdd && (
        <div className="px-4 py-3 bg-surface-50 border-b border-surface-100">
          <div className="flex gap-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Item name"
              className="flex-1 px-3 py-2 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-500 bg-white"
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
            />
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-surface-400">$</span>
              <input
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="0.00"
                className="w-24 pl-6 pr-2 py-2 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-500 text-right bg-white"
                type="number"
                step="0.01"
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
              />
            </div>
            <button
              onClick={addItem}
              className="px-3 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
        {state.items.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-surface-400">
            <Package className="w-8 h-8 mb-2" />
            <p className="text-sm">No items yet</p>
          </div>
        ) : (
          state.items.map((item) => (
            <ReceiptItemCard key={item.id} item={item} />
          ))
        )}
      </div>
    </div>
  );
}
