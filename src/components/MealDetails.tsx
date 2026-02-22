import { MapPin, CalendarDays } from 'lucide-react';
import { useStore } from '../store';

export function MealDetails() {
  const { state, dispatch } = useStore();

  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-surface-100">
        <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wider">
          Meal Details
        </h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-surface-500 mb-1.5 block">
              Restaurant
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                value={state.restaurantName}
                onChange={(e) =>
                  dispatch({ type: 'SET_RESTAURANT_NAME', name: e.target.value })
                }
                placeholder="Restaurant name"
                className="w-full pl-9 pr-3 py-2 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-surface-500 mb-1.5 block">
              Date
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                value={state.mealDate}
                onChange={(e) =>
                  dispatch({ type: 'SET_MEAL_DATE', date: e.target.value })
                }
                placeholder="e.g. Feb 21, 2026"
                className="w-full pl-9 pr-3 py-2 text-sm border border-surface-200 rounded-lg outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
