import React from "react";
import homeImg from "../assets/home.jpg";

function Home() {
  return (
    <div className="p-6">
      <img src={homeImg} alt="Home Banner" className="w-full rounded-lg mb-6" />

      <div className="grid grid-cols-3 gap-6">
        <div className="h-48 bg-yellow-600 rounded-lg"></div>
        <div className="h-48 bg-yellow-600 rounded-lg"></div>
        <div className="h-48 bg-yellow-600 rounded-lg"></div>
      </div>
    </div>
  );
}

export default Home;
