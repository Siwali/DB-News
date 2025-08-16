const fs = require('fs');
const path = require('path');

// อ่านข้อมูลจาก db.json
const dbPath = path.join(process.cwd(), 'db.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

module.exports = async (req, res) => {
  // ตั้งค่า CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, method } = req;
  const urlParts = url.split('?');
  const pathname = urlParts[0];
  const query = new URLSearchParams(urlParts[1] || '');

  console.log(`${method} ${pathname}`); // For debugging

  try {
    // Route: GET /api/news หรือ /news
    if ((pathname === '/api/news' || pathname === '/news') && method === 'GET') {
      let news = [...data.news];
      
      // Pagination
      const limit = parseInt(query.get('_limit')) || 0;
      const page = parseInt(query.get('_page')) || 1;
      
      if (limit > 0) {
        const start = (page - 1) * limit;
        const end = start + limit;
        news = news.slice(start, end);
      }
      
      // Sort by date (newest first)
      news.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      res.status(200).json(news);
      return;
    }
    
    // Route: GET /api/news/:id หรือ /news/:id
    const newsIdMatch = pathname.match(/^\/(?:api\/)?news\/(\d+)$/);
    if (newsIdMatch && method === 'GET') {
      const id = parseInt(newsIdMatch[1]);
      const newsItem = data.news.find(item => item.id === id);
      
      if (newsItem) {
        res.status(200).json(newsItem);
      } else {
        res.status(404).json({ error: 'News not found' });
      }
      return;
    }

    // Route: GET /api/status
    if (pathname === '/api/status' && method === 'GET') {
      res.status(200).json({
        status: 'OK',
        message: 'News API is running on Vercel',
        timestamp: new Date().toISOString(),
        totalNews: data.news.length,
        version: '1.0.0'
      });
      return;
    }

    // Route: GET / (root)
    if (pathname === '/' && method === 'GET') {
      res.status(200).json({
        message: 'Welcome to News API',
        endpoints: {
          'GET /api/news': 'Get all news',
          'GET /api/news?_limit=5&_page=1': 'Get news with pagination',
          'GET /api/news/:id': 'Get specific news by ID',
          'GET /api/status': 'Check API status'
        }
      });
      return;
    }

    // 404 สำหรับ route อื่นๆ
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