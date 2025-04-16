import React, { useState, useEffect } from "react";
import axios from "axios";

const FileList = () => {
  const [files, setFiles] = useState([]);

  // 서버에서 파일 목록 가져오기
  const fetchFiles = async () => {
    try {
      const response = await axios.get("http://localhost:5000/files");
      if (response.data.success) {
        setFiles(response.data.files);
      }
    } catch (error) {
      console.error("파일 목록 불러오기 실패:", error);
    }
  };

  // 페이지가 처음 로드될 때 실행
  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div>
      <h2>업로드된 파일 목록</h2>
      {files.length === 0 ? (
        <p>파일이 없습니다.</p>
      ) : (
        <ul>
          {files.map((file, index) => (
            <li key={index}>{file}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileList;
