const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// 📁 업로드 디렉토리 생성
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// 📸 multer 저장 설정
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = uuidv4() + ext;
    cb(null, safeName);
  },
});
const upload = multer({ storage });

// 📤 파일 업로드 라우터
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "파일이 업로드되지 않았습니다." });
  }
  res.status(200).json({ success: true, fileName: req.file.filename });
});

// 📄 업로드된 파일 목록 보기
router.get("/files", (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    res.status(200).json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, message: "파일 목록 오류" });
  }
});

// 📥 파일 다운로드
router.get("/download/:filename", (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: "파일 없음" });
  }
  res.download(filePath);
});

module.exports = router;