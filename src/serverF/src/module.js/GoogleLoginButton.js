import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const GoogleLoginButton = () => {
  const [user, setUser] = useState(null);

  const handleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log('유저 정보:', decoded);
    setUser(decoded);
  };

  const handleError = () => {
    console.error('로그인 실패');
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg">
      {!user ? (
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">환영합니다, {user.name}님!</h2>
          <img
            src={user.picture}
            alt="프로필"
            className="w-24 h-24 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">{user.email}</p>
        </div>
      )}
    </div>
  );
};

export default GoogleLoginButton;