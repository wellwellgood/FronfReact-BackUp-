// const fs = require("fs");
const pool = require("./DB"); // DB 연결 파일 불러오기

// ✅ JSON 파일 읽기
// const rawData = fs.readFileSync("db.json", "utf-8");
const jsonData = JSON.parse(rawData);

// ✅ users 배열 추출
const users = jsonData.users; 

if (!Array.isArray(users)) {
    console.error("❌ 오류: JSON 데이터에 'users' 배열이 없습니다.");
    process.exit(1); // 프로그램 종료
}

async function insertData() {
    let conn;
    try {
        conn = await pool.getConnection();

        for (const user of users) {
            const { id, username, name, password, phone } = user;

            await conn.query(
                "INSERT INTO users (id, username, name, password, phone) VALUES (?, ?, ?, ?, ?)",
                [id, username || null, name || null, password, phone || null] // null 처리
            );

            console.log(`✅ 데이터 삽입 성공: ${id}, ${username || name}`);
        }
    } catch (err) {
        console.error("❌ 데이터 삽입 오류:", err);
    } finally {
        if (conn) conn.release();
    }
}

// 실행
insertData();