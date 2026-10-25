const unavailable = 'Le service est momentanément indisponible. Réessayez plus tard.';

export async function forward(request, response, { method, endpoint }) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== method) {
    response.setHeader('Allow', method);
    return response.status(405).json({ message: 'Méthode non autorisée.' });
  }

  let target;
  const token = process.env.PYTHONANYWHERE_API_TOKEN;
  try {
    target = new URL(process.env.PYTHONANYWHERE_API_URL);
    if (target.protocol !== 'https:' || target.username || target.password || target.search || target.hash) throw new Error('Invalid URL');
    if (!/\/inscriptions\/?$/.test(target.pathname)) throw new Error('Invalid endpoint');
    target.pathname = target.pathname.replace(/\/inscriptions\/?$/, `/${endpoint}/`);
  } catch {
    return response.status(503).json({ message: unavailable });
  }
  if (method === 'POST' && !token) return response.status(503).json({ message: unavailable });

  let payload;
  if (method === 'POST') {
    if (request.headers?.['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
      return response.status(415).json({ message: 'Le formulaire doit être envoyé au format JSON.' });
    }
    try {
      payload = typeof request.body === 'string' ? JSON.parse(request.body) : request.body;
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Invalid payload');
      payload = JSON.stringify(payload);
      if (Buffer.byteLength(payload, 'utf8') > 32768) return response.status(413).json({ message: 'Les données envoyées sont trop volumineuses.' });
    } catch {
      return response.status(400).json({ message: 'Les données envoyées sont invalides.' });
    }
  }

  try {
    const upstream = await fetch(target, {
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(method === 'POST' ? { 'X-API-Token': token } : {}) },
      ...(method === 'POST' ? { body: payload } : {}),
      signal: AbortSignal.timeout(15000),
      redirect: 'error',
    });
    if (upstream.status >= 500 || !upstream.headers.get('content-type')?.includes('application/json')) throw new Error('Invalid upstream response');
    const body = await upstream.json();
    if (upstream.status === 403) return response.status(503).json({ message: unavailable });
    return response.status(upstream.status).json(body);
  } catch {
    return response.status(502).json({ message: unavailable });
  }
}
