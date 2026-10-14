export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ service: 'God-Eye Brasil', status: 'ok', region: 'br', date: new Date().toISOString() });
}
