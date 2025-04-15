const pool = require('./db');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('📡 클라이언트 연결됨:', socket.id);

    socket.on('sendMessage', async (msg) => { // ✅ 이벤트명 수정
      console.log('💬 메시지 수신:', msg);

      io.emit('receiveMessage', msg); // ✅ 프론트와 이름 통일

      try {
        await pool.query(
          "INSERT INTO messages (sender_id, receiver_id, content, time) VALUES (?, ?, ?, ?)",
          [msg.sender_id, msg.receiver_id, msg.content, new Date(msg.time)]
        );
      } catch (err) {
        console.error('❌ 메시지 저장 실패:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('❎ 연결 종료:', socket.id);
    });
  });
};
