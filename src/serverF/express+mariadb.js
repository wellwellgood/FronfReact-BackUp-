require("dotenv").config();
const { Pool } = require("pg");  // ✅ 올바른 방식: Pool만 구조분해할당

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432, // ✅ PostgreSQL 기본 포트
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
(async () => {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log("✅ DB 연결 성공");
    const [rows] = await conn.query("SELECT DATABASE() AS db");
    console.log("📌 현재 DB:", rows[0].db);
  } catch (err) {
    console.error("❌ DB 연결 실패:", err);
  } finally {
    if (conn) conn.release();
  }
})();