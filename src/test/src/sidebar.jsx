import React from "react";
import { Link } from "react-router-dom";
import "../src/css/slidebar.css";

function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-5">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <nav className="flex flex-col gap-4">
        <Link to="/dashboard" className="hover:text-gray-400">홈</Link>
        <Link to="/analytics" className="hover:text-gray-400">분석</Link>
        <Link to="/settings" className="hover:text-gray-400">설정</Link>
      </nav>
    </div>
  );
}

export default Sidebar;