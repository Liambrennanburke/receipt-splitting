import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase } from '../lib/supabase.js';
import { requireAdmin } from '../lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Password');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabase = getSupabase();

  if (req.method === 'POST') {
    try {
      const {
        restaurantName,
        mealDate,
        rawOcrText,
        receiptImage,
        items,
        people,
        tax,
        tip,
        splitMode,
        personTotals,
        grandTotal,
      } = req.body;

      let receiptImageUrl: string | null = null;

      if (receiptImage && typeof receiptImage === 'string') {
        const matches = receiptImage.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          const contentType = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');
          const ext = contentType.includes('png') ? 'png' : 'jpg';
          const fileName = `${crypto.randomUUID()}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from('receipts')
            .upload(fileName, buffer, { contentType, upsert: false });

          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from('receipts')
              .getPublicUrl(fileName);
            receiptImageUrl = urlData.publicUrl;
          }
        }
      }

      const { data, error } = await supabase
        .from('sessions')
        .insert({
          restaurant_name: restaurantName || null,
          meal_date: mealDate || null,
          raw_ocr_text: rawOcrText || null,
          receipt_image_url: receiptImageUrl,
          items: items || [],
          people: people || [],
          tax: tax || 0,
          tip: tip || 0,
          split_mode: splitMode || 'proportional',
          person_totals: personTotals || [],
          grand_total: grandTotal || 0,
        })
        .select('id')
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json({ id: data.id });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to save session' });
    }
  }

  if (req.method === 'GET') {
    if (!requireAdmin(req, res)) return;

    const { data, error } = await supabase
      .from('sessions')
      .select('id, created_at, restaurant_name, meal_date, grand_total, people, split_mode')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
