const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const pool = require('../section2Server/db');
const router = express.Router();
const pool = require('../DB'); 

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await pool.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashed]);
  res.json({ message: '가입 완료' });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('🔐 로그인 요청 도착:', username, password);

  if (!username || !password) {
    return res.status(400).json({ message: '아이디 또는 비밀번호가 비어 있습니다.' });
  }

  try {
    const [users] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);

    if (users.length === 0) {
      console.log('❌ 사용자 없음');
      return res.status(404).json({ message: '사용자가 존재하지 않습니다.' });
    }

    const user = users[0];
    console.log('🧩 사용자 찾음:', user.username);

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      console.log('❌ 비밀번호 불일치');
      return res.status(401).json({ message: '비밀번호가 틀렸습니다.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, 'secret', { expiresIn: '1h' });
    res.json({ message: '로그인 성공', token, id: user.id });

  } catch (err) {
    console.error('❗ DB 쿼리 오류:', err.message);
    res.status(500).json({ message: '서버 오류 발생', error: err.message });
  }
});


module.exports = router;