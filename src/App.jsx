import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LoginPage from './LoginApp';
import Main from './main';
// import Example from './components/section1/section1';
import ChatApp from './components/Chat/section2.js';
import File from './components/File/section3';
import SendEmail from './components/email/section4';
import CustomCalendar from './calender/calender';

import Id from './ID.js';
import Password from './password.js';
import LinkPage from './membership.js';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/main" element={<Main />} />
        {/* <Route path="/example" element={<Example />} /> */}
        <Route path="/ChatApp" element={<ChatApp />} />
        <Route path="/file" element={<File />} />
        <Route path="/sendEmail" element={<SendEmail />} />
        <Route path="/customCalendar" element={<CustomCalendar />} />
        <Route path="/membership" element={<LinkPage />} />
        <Route path="/Id" element={<Id />} />
        <Route path="/password" element={<Password />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
