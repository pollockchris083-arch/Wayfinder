// Edge runtime: 30-second timeout (vs 10s for serverless on Hobby plan)
export const config = { runtime: 'edge' };

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

export default async function handler(req) {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return json({ error: 'ANTHROPIC_API_KEY is not configured on this server' }, 500);

  let body;
  try { body = await req.json(); } catch { return json({ error: 'Invalid JSON body' }, 400); }

  const { prompt } = body || {};
  if (!prompt) return json({ error: 'prompt is required' }, 400);

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8192,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.json().catch(() => ({}));
      return json({
        error: err.error?.message || `Upstream error ${upstream.status}`,
        upstreamStatus: upstream.status,
      }, upstream.status);
    }

    const data = await upstream.json();
    return json({ text: data.content[0].text });
  } catch (e) {
    return json({ error: e.message || 'Internal server error' }, 500);
  }
}
