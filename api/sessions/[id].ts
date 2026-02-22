import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase } from '../lib/supabase.js';
import { requireAdmin } from '../lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Password');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!requireAdmin(req, res)) return;

  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid session ID' });
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(404).json({ error: 'Session not found' });
  }

  return res.status(200).json(data);
}
