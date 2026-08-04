export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Atlassian-Token');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const token = req.headers['x-atlassian-token'];
  if (!token) return res.status(400).json({ error: 'Missing X-Atlassian-Token header' });

  const email = 'david.gerrard@duettoresearch.com';
  const credentials = Buffer.from(`${email}:${token}`).toString('base64');

  const { jql = 'project = ONB ORDER BY updated DESC', maxResults = 5, startAt = 0, fields = 'summary,status,assignee' } = req.query;

  try {
    const response = await fetch('https://duettoresearch.atlassian.net/rest/api/3/search', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jql,
        maxResults: Number(maxResults),
        startAt: Number(startAt),
        fields: fields.split(','),
      }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
