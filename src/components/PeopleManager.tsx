import { useState, useRef, useEffect } from 'react';
import { UserPlus, X } from 'lucide-react';
import { useStore } from '../store';

export function PeopleManager() {
  const { state, dispatch } = useStore();
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.people.length === 0) {
      inputRef.current?.focus();
    }
  }, [state.people.length]);

  const addPerson = () => {
    const name = inputValue.trim();
    if (!name) return;
    dispatch({ type: 'ADD_PERSON', name });
    setInputValue('');
  };

  return (
    <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-surface-100">
        <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wider">
          People
        </h3>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div
            className={`
              flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-150
              ${isFocused ? 'border-primary-500 ring-4 ring-primary-500/10' : 'border-surface-200'}
            `}
          >
            <UserPlus className="w-4 h-4 text-surface-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addPerson();
              }}
              placeholder="Add a person..."
              className="flex-1 bg-transparent text-sm text-surface-900 placeholder:text-surface-400 outline-none"
            />
          </div>
          <button
            onClick={addPerson}
            disabled={!inputValue.trim()}
            className="px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg
              hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-150 active:scale-95"
          >
            Add
          </button>
        </div>

        {state.people.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {state.people.map((person) => (
              <div
                key={person.id}
                className="group flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-lg text-sm font-medium transition-all duration-150 hover:shadow-sm"
                style={{
                  backgroundColor: `${person.color}12`,
                  color: person.color,
                  border: `1px solid ${person.color}30`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: person.color }}
                />
                {person.name}
                <button
                  onClick={() => dispatch({ type: 'REMOVE_PERSON', id: person.id })}
                  className="ml-0.5 p-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-black/10"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {state.people.length === 0 && (
          <p className="text-sm text-surface-400 text-center py-2">
            Add people to start splitting the bill
          </p>
        )}
      </div>
    </div>
  );
}
