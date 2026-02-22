import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from 'react';
import type { ReceiptItem, Person, SplitMode } from './types';

export function parseLeadingQty(name: string): number {
  const match = name.match(/^(\d+)\s*[xX]?\s+/);
  return match ? parseInt(match[1], 10) : 1;
}

const PERSON_COLORS = [
  '#635bff', '#00d4aa', '#ff5567', '#ffbb00', '#0073e6',
  '#e56399', '#7c3aed', '#f97316', '#06b6d4', '#84cc16',
];

interface State {
  step: 'upload' | 'assign' | 'summary';
  items: ReceiptItem[];
  people: Person[];
  tax: number;
  tip: number;
  splitMode: SplitMode;
  receiptImage: string | null;
  ocrProgress: number;
  isProcessing: boolean;
  restaurantName: string;
  mealDate: string;
}

type Action =
  | { type: 'SET_STEP'; step: State['step'] }
  | { type: 'SET_ITEMS'; items: ReceiptItem[] }
  | { type: 'ADD_ITEM'; item: ReceiptItem }
  | { type: 'UPDATE_ITEM'; id: string; updates: Partial<ReceiptItem> }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'ADD_PERSON'; name: string }
  | { type: 'REMOVE_PERSON'; id: string }
  | { type: 'ASSIGN_ITEM'; itemId: string; personId: string }
  | { type: 'UNASSIGN_ITEM'; itemId: string; personId: string }
  | { type: 'SPLIT_LINE_ITEM'; id: string }
  | { type: 'SET_TAX'; tax: number }
  | { type: 'SET_TIP'; tip: number }
  | { type: 'SET_SPLIT_MODE'; mode: SplitMode }
  | { type: 'SET_RECEIPT_IMAGE'; image: string | null }
  | { type: 'SET_OCR_PROGRESS'; progress: number }
  | { type: 'SET_PROCESSING'; isProcessing: boolean }
  | { type: 'SET_RESTAURANT_NAME'; name: string }
  | { type: 'SET_MEAL_DATE'; date: string }
  | { type: 'RESET' };

const initialState: State = {
  step: 'upload',
  items: [],
  people: [],
  tax: 0,
  tip: 0,
  splitMode: 'proportional',
  receiptImage: null,
  ocrProgress: 0,
  isProcessing: false,
  restaurantName: '',
  mealDate: '',
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'SET_ITEMS':
      return { ...state, items: action.items };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.item] };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, ...action.updates } : i
        ),
      };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case 'ADD_PERSON': {
      const colorIndex = state.people.length % PERSON_COLORS.length;
      return {
        ...state,
        people: [
          ...state.people,
          {
            id: crypto.randomUUID(),
            name: action.name,
            color: PERSON_COLORS[colorIndex],
          },
        ],
      };
    }
    case 'REMOVE_PERSON': {
      return {
        ...state,
        people: state.people.filter((p) => p.id !== action.id),
        items: state.items.map((i) => ({
          ...i,
          assignedTo: i.assignedTo.filter((pid) => pid !== action.id),
        })),
      };
    }
    case 'ASSIGN_ITEM': {
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.itemId && !i.assignedTo.includes(action.personId)
            ? { ...i, assignedTo: [...i.assignedTo, action.personId] }
            : i
        ),
      };
    }
    case 'UNASSIGN_ITEM': {
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.itemId
            ? { ...i, assignedTo: i.assignedTo.filter((pid) => pid !== action.personId) }
            : i
        ),
      };
    }
    case 'SPLIT_LINE_ITEM': {
      const item = state.items.find((i) => i.id === action.id);
      if (!item) return state;
      const qty = parseLeadingQty(item.name);
      if (qty <= 1) return state;
      const unitPrice = Math.round((item.price / qty) * 100) / 100;
      const baseName = item.name.replace(/^\d+\s*[xX]?\s*/, '').trim();
      const newItems: ReceiptItem[] = [];
      for (const existing of state.items) {
        if (existing.id === action.id) {
          for (let i = 0; i < qty; i++) {
            newItems.push({
              id: crypto.randomUUID(),
              name: baseName,
              price: i === qty - 1
                ? Math.round((item.price - unitPrice * (qty - 1)) * 100) / 100
                : unitPrice,
              assignedTo: [],
            });
          }
        } else {
          newItems.push(existing);
        }
      }
      return { ...state, items: newItems };
    }
    case 'SET_TAX':
      return { ...state, tax: action.tax };
    case 'SET_TIP':
      return { ...state, tip: action.tip };
    case 'SET_SPLIT_MODE':
      return { ...state, splitMode: action.mode };
    case 'SET_RECEIPT_IMAGE':
      return { ...state, receiptImage: action.image };
    case 'SET_OCR_PROGRESS':
      return { ...state, ocrProgress: action.progress };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.isProcessing };
    case 'SET_RESTAURANT_NAME':
      return { ...state, restaurantName: action.name };
    case 'SET_MEAL_DATE':
      return { ...state, mealDate: action.date };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const StoreContext = createContext<{
  state: State;
  dispatch: Dispatch<Action>;
} | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
