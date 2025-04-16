const express = require("express");
const http = require("http");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../chatServer/express+mariadb.js"); // DB 연결
const socket = require("./socket.js"); // socket.js에서 함수 export 필요
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// ✅ CORS 설정
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 파일 업로드 설정
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// ✅ 파일 업로드 API
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "파일이 업로드되지 않았습니다." });
  res.status(200).json({ success: true, fileName: req.file.filename });
});

app.get("/files", (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    res.status(200).json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, message: "파일 목록 오류" });
  }
});

app.get("/download/:filename", (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: "파일 없음" });
  res.download(filePath);
});

// ✅ 로그인 API
app.post('/api/login', async (req, res) => {
  let conn;
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "아이디와 비밀번호를 입력해주세요." });
    }

    conn = await pool.getConnection();
    const [rows] = await conn.query("SELECT * FROM users WHERE username = ?", [username]);

    if (!rows || rows.length === 0) {
      return res.status(401).json({ message: "아이디가 존재하지 않습니다." });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, "your_secret_key", { expiresIn: "1h" });

    res.status(200).json({ message: "로그인 성공", token });
  } catch (err) {
    console.error("❌ 로그인 오류:", err);
    res.status(500).json({ message: "서버 오류 발생", error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// ✅ 회원가입 API
app.post("/api/register", async (req, res) => {
  const { username, name, password, confirmPassword, phone1, phone2, phone3 } = req.body;

  if (!username || !name || !password || !confirmPassword || !phone1 || !phone2 || !phone3) {
    return res.status(400).json({ message: "모든 필드를 입력해주세요." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const [existing] = await conn.query("SELECT * FROM users WHERE username = ?", [username]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "이미 존재하는 아이디입니다." });
    }

    const hashed = await bcrypt.hash(password, 10);
    await conn.query(
      "INSERT INTO users (username, name, password, phone1, phone2, phone3) VALUES (?, ?, ?, ?, ?, ?)",
      [username, name, hashed, phone1, phone2, phone3]
    );
    res.status(201).json({ message: "회원가입 성공" });
  } catch (err) {
    console.error("❌ 회원가입 오류:", err);
    res.status(500).json({ message: "서버 오류 발생" });
  } finally {
    if (conn) conn.release();
  }
});

// ✅ 메시지 저장
app.post("/api/messages", async (req, res) => {
  const { sender_id, receiver_id, content } = req.body;
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      "INSERT INTO messages (sender_id, receiver_id, content, time) VALUES (?, ?, ?, NOW())",
      [sender_id, receiver_id, content]
    );
    res.status(201).json({ message: "메시지 저장 완료" });
  } catch (err) {
    console.error("❌ 메시지 저장 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  } finally {
    if (conn) conn.release();
  }
});

// ✅ 메시지 불러오기
app.get("/api/messages", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [messages] = await conn.query(`
      SELECT m.*, s.username AS sender_name, r.username AS receiver_name
      FROM messages m
      LEFT JOIN users s ON m.sender_id = s.id
      LEFT JOIN users r ON m.receiver_id = r.id
      ORDER BY m.time ASC
    `);
    res.status(200).json(messages);
  } catch (err) {
    console.error("❌ 메시지 불러오기 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  } finally {
    if (conn) conn.release();
  }
});

// ✅ 상태 확인
app.get("/", (req, res) => {
  res.send("서버 정상 작동 중입니다.");
});

// ✅ 소켓 서버 실행
socket(server);

// ✅ 서버 시작
server.listen(PORT, () => {
  console.log(`🚀 통합 서버 실행 중: http://localhost:${PORT}`);
});
