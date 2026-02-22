import { useCallback, useRef, useState } from 'react';
import { Upload, FileText, Loader2, AlertTriangle, RotateCcw } from 'lucide-react';
import { useStore } from '../store';
import { parseReceipt, NotAReceiptError } from '../ocr';

export function ReceiptUpload() {
  const { state, dispatch } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (JPEG, PNG, etc.).');
        return;
      }

      setError(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        dispatch({ type: 'SET_RECEIPT_IMAGE', image: e.target?.result as string });
      };
      reader.readAsDataURL(file);

      dispatch({ type: 'SET_PROCESSING', isProcessing: true });
      dispatch({ type: 'SET_OCR_PROGRESS', progress: 0 });

      try {
        const { items, tax, tip, restaurantName, mealDate } = await parseReceipt(file, (progress) => {
          dispatch({ type: 'SET_OCR_PROGRESS', progress });
        });

        dispatch({ type: 'SET_ITEMS', items });
        dispatch({ type: 'SET_TAX', tax });
        dispatch({ type: 'SET_TIP', tip });
        if (restaurantName) dispatch({ type: 'SET_RESTAURANT_NAME', name: restaurantName });
        if (mealDate) dispatch({ type: 'SET_MEAL_DATE', date: mealDate });
        dispatch({ type: 'SET_PROCESSING', isProcessing: false });
        dispatch({ type: 'SET_STEP', step: 'assign' });
      } catch (err) {
        dispatch({ type: 'SET_PROCESSING', isProcessing: false });
        if (err instanceof NotAReceiptError) {
          setError(
            'We couldn\'t find any items or prices in this image. Make sure you\'re uploading a clear photo of a receipt.'
          );
        } else {
          setError('Something went wrong reading your image. Please try again.');
        }
      }
    },
    [dispatch]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (state.isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-primary-500/10 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-surface-900 mb-2">
            Reading your receipt...
          </h2>
          <p className="text-surface-500 mb-4">
            Using OCR to extract items and prices
          </p>
          <div className="w-64 h-2 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${state.ocrProgress}%` }}
            />
          </div>
          <p className="text-sm text-surface-400 mt-2">{state.ocrProgress}%</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-surface-900 mb-2">
          Split your receipt
        </h1>
        <p className="text-surface-500 text-lg">
          Upload a photo of your receipt to get started
        </p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative w-full max-w-lg cursor-pointer rounded-2xl border-2 border-dashed
          p-12 text-center transition-all duration-200
          ${
            isDragging
              ? 'border-primary-500 bg-primary-500/5 scale-[1.02]'
              : 'border-surface-300 hover:border-primary-400 hover:bg-surface-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <div className="flex flex-col items-center gap-4">
          <div
            className={`
              w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-200
              ${isDragging ? 'bg-primary-500/10' : 'bg-surface-100'}
            `}
          >
            <Upload
              className={`w-8 h-8 transition-colors duration-200 ${
                isDragging ? 'text-primary-500' : 'text-surface-400'
              }`}
            />
          </div>
          <div>
            <p className="text-surface-700 font-medium text-lg">
              Drop your receipt here
            </p>
            <p className="text-surface-400 mt-1">or click to browse files</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="w-full max-w-lg rounded-xl border border-danger/20 bg-danger/5 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-surface-900">
              That doesn't look like a receipt
            </p>
            <p className="text-sm text-surface-600 mt-1">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fileInputRef.current?.click();
              }}
              className="flex items-center gap-1.5 mt-3 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Try another image
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          const demoItems = [
            { id: crypto.randomUUID(), name: 'Margherita Pizza', price: 16.50, assignedTo: [] },
            { id: crypto.randomUUID(), name: 'Caesar Salad', price: 12.00, assignedTo: [] },
            { id: crypto.randomUUID(), name: 'Pasta Carbonara', price: 18.75, assignedTo: [] },
            { id: crypto.randomUUID(), name: 'Garlic Bread', price: 7.50, assignedTo: [] },
            { id: crypto.randomUUID(), name: 'Tiramisu', price: 9.00, assignedTo: [] },
            { id: crypto.randomUUID(), name: 'Iced Tea', price: 3.50, assignedTo: [] },
            { id: crypto.randomUUID(), name: 'Lemonade', price: 3.50, assignedTo: [] },
            { id: crypto.randomUUID(), name: 'Espresso', price: 4.00, assignedTo: [] },
          ];
          dispatch({ type: 'SET_ITEMS', items: demoItems });
          dispatch({ type: 'SET_TAX', tax: 7.12 });
          dispatch({ type: 'SET_TIP', tip: 14.25 });
          dispatch({ type: 'SET_RESTAURANT_NAME', name: 'Trattoria da Luigi' });
          dispatch({ type: 'SET_MEAL_DATE', date: 'Feb 21, 2026' });
          dispatch({ type: 'SET_STEP', step: 'assign' });
        }}
        className="flex items-center gap-2 text-surface-400 hover:text-primary-500 transition-colors text-sm"
      >
        <FileText className="w-4 h-4" />
        Try with demo receipt
      </button>
    </div>
  );
}
