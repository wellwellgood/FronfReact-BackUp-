// ✅ Render 배포용 전체 통합 서버 구조 (로그인 + DB 연동 포함)

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
require("dotenv").config();

const db = require("./db");
const authRouter = require("./routes/auth");
const messageRouter = require("./routes/messages");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 4000;

// ✅ 미들웨어
app.use(cors());
app.use(express.json());

// ✅ API 라우터
app.use("/api/auth", authRouter);
app.use("/api/messages", messageRouter);

// ✅ 기본 라우트
app.get("/", (req, res) => {
  res.send("✅ Render용 서버 작동 중 (로그인 및 채팅 포함)");
});

// ✅ socket.io 이벤트 처리
io.on("connection", (socket) => {
  console.log("📡 연결됨:", socket.id);

  socket.on("sendMessage", (msg) => {
    console.log("📨 받은 메시지:", msg);
    io.emit("receiveMessage", msg);
  });

  socket.on("disconnect", () => {
    console.log("❌ 연결 종료:", socket.id);
  });
});

// ✅ 서버 시작
server.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
