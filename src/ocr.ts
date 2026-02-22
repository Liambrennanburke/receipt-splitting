import Tesseract from 'tesseract.js';
import type { ReceiptItem } from './types';

export interface OcrResult {
  items: ReceiptItem[];
  tax: number;
  tip: number;
  restaurantName: string;
  mealDate: string;
}

export async function parseReceipt(
  imageFile: File,
  onProgress: (progress: number) => void
): Promise<OcrResult> {
  const result = await Tesseract.recognize(imageFile, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  const text = result.data.text;
  return extractItemsFromText(text);
}

function extractItemsFromText(text: string): OcrResult {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const items: ReceiptItem[] = [];
  let tax = 0;
  let tip = 0;
  let restaurantName = '';
  let mealDate = '';

  const pricePattern = /\$?\d+\.\d{2}/;
  const taxKeywords = /\b(tax|hst|gst|pst|vat)\b/i;
  const tipKeywords = /\b(tip|gratuity|grat)\b/i;
  const skipKeywords = /\b(subtotal|sub total|total|balance|change|cash|visa|mastercard|amex|debit|credit|card|amount due|thank|receipt)\b/i;
  const datePattern = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})|(\w+ \d{1,2},?\s*\d{4})/;

  // First non-empty line without a price is likely the restaurant name
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 2) continue;
    if (pricePattern.test(trimmed)) continue;
    if (/^\d+$/.test(trimmed)) continue;
    if (/^[\d\s\-\(\)]+$/.test(trimmed)) continue; // phone numbers
    restaurantName = trimmed;
    break;
  }

  for (const line of lines) {
    const dateMatch = line.match(datePattern);
    if (dateMatch) {
      mealDate = dateMatch[0];
      break;
    }
  }

  for (const line of lines) {
    const priceMatch = line.match(pricePattern);
    if (!priceMatch) continue;

    const price = parseFloat(priceMatch[0].replace('$', ''));
    if (price <= 0) continue;

    if (taxKeywords.test(line)) {
      tax = price;
      continue;
    }

    if (tipKeywords.test(line)) {
      tip = price;
      continue;
    }

    if (skipKeywords.test(line)) continue;

    let name = line
      .replace(pricePattern, '')
      .replace(/[^\w\s]/g, '')
      .trim();

    if (name.length < 2) name = `Item ${items.length + 1}`;

    items.push({
      id: crypto.randomUUID(),
      name,
      price,
      assignedTo: [],
    });
  }

  if (items.length === 0) {
    throw new NotAReceiptError(text);
  }

  return { items, tax, tip, restaurantName, mealDate };
}

export class NotAReceiptError extends Error {
  rawText: string;
  constructor(rawText: string) {
    super('This doesn\'t look like a receipt');
    this.name = 'NotAReceiptError';
    this.rawText = rawText;
  }
}
