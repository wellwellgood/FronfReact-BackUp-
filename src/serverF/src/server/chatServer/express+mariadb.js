require('dotenv').config();

const mysql = require('mysql2/promise');

// Add connection retry logic
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  connectTimeout: 20000, // Increased timeout
  waitForConnections: true,
  queueLimit: 0
});

// Add better error handling and logging
(async () => {
  let conn;
  let retries = 5;
  
  while (retries > 0) {
    try {
      conn = await pool.getConnection();
      console.log("✅ DB 연결 성공");
      const [rows] = await conn.query("SELECT DATABASE() AS db");
      console.log("📌 현재 DB:", rows[0].db);
      break; // Connection successful, exit the loop
    } catch (err) {
      retries--;
      console.error(`❌ DB 연결 실패 (남은 시도: ${retries}):`, err);
      
      if (retries > 0) {
        console.log("🔄 5초 후 재시도...");
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } finally {
      if (conn) conn.release();
    }
  }
})();

module.exports = pool;
