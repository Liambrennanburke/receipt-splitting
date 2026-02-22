import type { VercelRequest, VercelResponse } from '@vercel/node';

export function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    res.status(500).json({ error: 'ADMIN_PASSWORD not configured' });
    return false;
  }
  const provided = req.headers['x-admin-password'] as string | undefined;
  if (provided !== password) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}
