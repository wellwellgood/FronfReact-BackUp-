import axios from 'axios';
import React, { useState } from 'react';

const PostData = () => {
  const [title, setTitle] = useState('');
  const [responseData, setResponseData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://jsonplaceholder.typicode.com/posts', {
        title,
        body: '게시글 내용',
        userId: 1
      });
      setResponseData(response.data);
    } catch (error) {
      console.error('에러 발생:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="제목 입력" 
        />
        <button type="submit">게시글 등록</button>
      </form>
      {responseData && (
        <div>
          <h3>응답 데이터:</h3>
          <pre>{JSON.stringify(responseData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default PostData;