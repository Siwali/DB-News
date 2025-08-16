const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

module.exports = async (req, res) => {
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

  console.log(`${method} ${pathname}`);

  try {
    // GET /api/news?_limit=&_page=
    if (pathname === '/api/news' && method === 'GET') {
      let news = data.news || [];

      const limit = parseInt(query.get('_limit')) || news.length;
      const page = parseInt(query.get('_page')) || 1;

      const start = (page - 1) * limit;
      const end = start + limit;

      const paginated = news.slice(start, end);

      res.status(200).json(paginated);
      return;
    }

    // GET /api/news/:id
    const newsIdMatch = pathname.match(/^\/api\/news\/(\d+)$/);
    if (newsIdMatch && method === 'GET') {
      const id = parseInt(newsIdMatch[1]);
      const item = (data.news || []).find(n => n.id === id);

      if (item) {
        res.status(200).json(item);
      } else {
        res.status(404).json({ error: 'News not found' });
      }
      return;
    }

    // fallback
    res.status(404).json({ 
      error: 'Not found',
      path: pathname,
      method: method
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
};
