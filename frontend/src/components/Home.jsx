import React from "react";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
        Welcome to Sakha 🚀
      </h1>
      <p className="text-lg text-gray-200 max-w-xl mb-8">
        Discover, analyze, and submit innovative project ideas. Use our
        AI-powered analyzer to get insights, recommendations, and success
        predictions for your next big idea!
      </p>
      <a
        href="/Submit"
        className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold shadow hover:bg-purple-700 transition"
      >
        Get Started
      </a>
    </div>
  );
};

export default Home;
