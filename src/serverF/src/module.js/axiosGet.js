import axios from 'axios';
import React, { useEffect, useState } from 'react';

const FetchData = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('https://jsonplaceholder.typicode.com/posts')
      .then((response) => setData(response.data))
      .catch((error) => console.error('에러 발생:', error));
  }, []);

  return (
    <div>
      <h2>게시글 목록</h2>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default FetchData;