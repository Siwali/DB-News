const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'db.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, method } = req;
  const urlParts = url.split('?');
  const pathname = urlParts[0];
  const query = new URLSearchParams(urlParts[1] || '');

  // GET /api/news?_limit=&_page=
  if (pathname === '' && method === 'GET') {
    let news = data.news || [];

    const limit = parseInt(query.get('_limit')) || news.length;
    const page = parseInt(query.get('_page')) || 1;

    const start = (page - 1) * limit;
    const end = start + limit;

    const paginated = news.slice(start, end);

    res.status(200).json(paginated);
    return;
  }

  res.status(404).json({ error: 'Not found', path: pathname, method });
};
