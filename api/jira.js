export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Atlassian-Token');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const token = req.headers['x-atlassian-token'];
  if (!token) return res.status(400).json({ error: 'Missing X-Atlassian-Token header' });

  const email = 'david.gerrard@duettoresearch.com';
  const credentials = Buffer.from(`${email}:${token}`).toString('base64');

  const { jql = 'project = ONB ORDER BY updated DESC', maxResults = 50, nextPageToken, fields = 'summary,status,assignee', expand } = req.query;

  let url = `https://duettoresearch.atlassian.net/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}&fields=${fields}`;
  if (nextPageToken) url += `&nextPageToken=${encodeURIComponent(nextPageToken)}`;
  if (expand) url += `&expand=${expand}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
