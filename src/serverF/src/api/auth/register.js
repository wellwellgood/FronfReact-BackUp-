import axiosInstance from '../axiosInstance';

// 📩 회원가입 요청 함수
export const registerUser = async (userData) => {
    try {
        const response = await axiosInstance.post('http://localhost:4000/users', userData);
        return response.data; // 📡 서버 응답 반환
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
};