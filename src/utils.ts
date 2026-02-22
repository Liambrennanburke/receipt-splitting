import type { ReceiptItem, Person, SplitMode } from './types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function getPersonTotal(
  personId: string,
  items: ReceiptItem[],
  tax: number,
  tip: number,
  splitMode: SplitMode,
  people: Person[]
): { itemsTotal: number; taxShare: number; tipShare: number; total: number } {
  let itemsTotal = 0;

  for (const item of items) {
    if (item.assignedTo.includes(personId)) {
      itemsTotal += item.price / item.assignedTo.length;
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const activePeople = people.filter((p) =>
    items.some((item) => item.assignedTo.includes(p.id))
  );
  const activeCount = Math.max(activePeople.length, 1);

  let taxShare: number;
  let tipShare: number;

  if (splitMode === 'proportional') {
    const proportion = subtotal > 0 ? itemsTotal / subtotal : 0;
    taxShare = tax * proportion;
    tipShare = tip * proportion;
  } else {
    const isActive = items.some((item) => item.assignedTo.includes(personId));
    taxShare = isActive ? tax / activeCount : 0;
    tipShare = isActive ? tip / activeCount : 0;
  }

  return {
    itemsTotal,
    taxShare,
    tipShare,
    total: itemsTotal + taxShare + tipShare,
  };
}

export function getUnassignedTotal(items: ReceiptItem[]): number {
  return items
    .filter((item) => item.assignedTo.length === 0)
    .reduce((sum, item) => sum + item.price, 0);
}
