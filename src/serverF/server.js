const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config(); // env 먼저 설정

const pool = require('./DB');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ 정확한 origin만 허용
const allowList = ['https://myappboard.netlify.app/'];
const corsOptions = {
  origin: function (origin, callback) {
    console.log('CORS 요청 origin 👉', origin);
    if (!origin || allowList.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ 차단된 origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

// ✅ CORS는 라우트보다 위에!
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

// ✅ 루트 확인용
app.get('/', (req, res) => res.send('✅ 서버 작동 중'));

// ✅ DB 연결 확인용 (원하면 주석 처리해도 됨)
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT current_database();');
    res.json({ db: result.rows[0].current_database });
  } catch (err) {
    console.error('❌ DB 연결 실패:', err);
    res.status(500).json({ error: 'DB 연결 실패' });
  }
});

// ✅ 로그인 라우터 예시 (원하는대로 수정 가능)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const conn = await pool.connect();
    const result = await conn.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    conn.release();

    if (result.rows.length > 0) {
      res.json({ token: '로그인성공토큰' }); // 실제 토큰으로 대체해도 됨
    } else {
      res.status(401).json({ message: '아이디 또는 비밀번호가 틀렸습니다.' });
    }
  } catch (err) {
    console.error('❌ 로그인 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// ✅ Render가 포트를 감지할 수 있도록 정확히 listen
app.listen(PORT, () => {
  console.log(`✅ 서버가 ${PORT}번 포트에서 실행 중입니다.`);
});
