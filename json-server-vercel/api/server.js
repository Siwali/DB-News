const fs = require('fs');
const path = require('path');

// อ่านข้อมูลจาก db.json
const dbPath = path.join(__dirname, '..', 'db.json');

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
    if (pathname === '/' && method === 'GET') {
  res.status(200).json(data); // <<< แสดงข้อมูลทั้งหมดใน db.json
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