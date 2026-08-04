export default async function handler(req, res) {
  const token = req.headers['x-atlassian-token'];

  if (!token) {
    return res.status(400).json({ error: 'Missing X-Atlassian-Token header' });
  }

  const email = 'david.gerrard@duettoresearch.com';
  const credentials = Buffer.from(`${email}:${token}`).toString('base64');

  const { jql = 'project = ONB ORDER BY updated DESC', maxResults = 5, fields = 'summary,status,assignee' } = req.query;

  const url = `https://duettoresearch.atlassian.net/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}&fields=${fields}`;

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
