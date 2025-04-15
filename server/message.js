const express = require('express');
const router = express.Router();
const pool = require('../section2Server/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM messages ORDER BY time ASC");
    res.json(rows);
  } catch (err) {
    console.error('❌ 메시지 불러오기 실패:', err);
    res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;