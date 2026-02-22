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

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isTaxLine(line: string): boolean {
  const n = normalize(line);
  return /\b(tax|hst|gst|pst|vat|salestax)\b/.test(n) ||
    /^tax/.test(n) ||
    /tax\d/.test(n);
}

function isTipLine(line: string): boolean {
  const n = normalize(line);
  return /\b(tip|gratuity|grat)\b/.test(n) ||
    /^tip/.test(n) ||
    /^grat/.test(n);
}

function isNonItemLine(line: string): boolean {
  const n = normalize(line);
  const patterns = [
    /subtotal/, /sub\s*total/, /subtot/,
    /\btotal\b/, /^total/, /totaldue/, /amountdue/, /amountowed/,
    /\bbalance\b/, /balancedue/,
    /\bchange\b/, /changdue/,
    /\bvisa\b/, /\bmastercard\b/, /\bamex\b/, /\bdebit\b/, /\bcredit\b/,
    /\bcash\b/, /\btender\b/, /\bpayment\b/, /\bpaid\b/,
    /\bcharge\b/, /\bauthori/, /\bapproval/, /\bapproved/,
    /\bmerchant\b/, /\bcardhold/, /\bsignature/,
    /\bthank/, /\bthanks/, /\bvisit/, /\bwelcome/, /\bcome\s*again/,
    /\breceipt\b/, /\bcopy\b/, /\bduplicate/,
    /\bserver\b/, /\bcashier\b/, /\bhost\b/, /\bguest/,
    /\btable\b/, /\bcheck\b/, /\border\b/, /\bticket/,
    /\bphone\b/, /\bfax\b/, /\bwww\./, /\bhttp/, /\.com\b/,
    /\bdiscount\b/, /\bcoupon\b/, /\bpromo\b/, /\bsaving/,
    /\brefund\b/, /\bvoid\b/,
  ];
  return patterns.some((p) => p.test(n));
}

function extractItemsFromText(text: string): OcrResult {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  const items: ReceiptItem[] = [];
  let tax = 0;
  let tip = 0;
  let restaurantName = '';
  let mealDate = '';

  const pricePattern = /\$?\d+\.\d{2}/;
  const datePattern = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})|(\w+ \d{1,2},?\s*\d{4})/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 2) continue;
    if (pricePattern.test(trimmed)) continue;
    if (/^\d+$/.test(trimmed)) continue;
    if (/^[\d\s\-\(\)\+]+$/.test(trimmed)) continue;
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

    if (isTaxLine(line)) {
      tax = price;
      continue;
    }

    if (isTipLine(line)) {
      tip = price;
      continue;
    }

    if (isNonItemLine(line)) continue;

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
