const express = require('express');
const router = express.Router();
const Coolsms = require('coolsms-node-sdk').default;

const messageService = new Coolsms('NCSXNORXIJP78SAD', '0FTJII2DY5DHHARFNEBUZM5R2MRKKWS1');

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6자리 인증번호
}

router.post('/send-code', async (req, res) => {
  console.log("✅ /send-code 요청 받음");  // 가장 중요!

  try {
    console.log("🧪 req.body:", req.body); 
    const { phone1, phone2, phone3 } = req.body;
    console.log("📲 받은 번호:", phone1, phone2, phone3);

    const phone = `${phone1}${phone2}${phone3}`;
    const code = generateCode();

    console.log("📤 전송할 전체 번호:", phone);
    console.log("🧾 인증번호:", code);

    const response = await messageService.sendOne({
      to: phone,
      from: '01049131389', // - 빼고
      text: `[인증번호] ${code}`,
    });

    console.log("✅ 문자 전송 성공:", response);

    res.status(200).json({ success: true, code });

  } catch (error) {
    console.error("❌ 문자 전송 실패!", error.message);
    if (error.response) {
      console.error("📦 API 응답:", error.response.data);
    } else if (error.request) {
      console.error("📡 요청은 갔지만 응답 없음:", error.request);
    } else {
      console.error("⚠️ 기타 오류:", error);
    }
  
    res.status(500).json({ message: "문자 전송 실패", error: error.message });
  }
});

module.exports = router;