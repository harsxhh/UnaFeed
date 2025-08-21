import { useState } from "react";
import { Link } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex gap-4 mb-6">
        <img src={reactLogo} className="logo react" alt="React logo" />
        <img src={viteLogo} className="logo" alt="Vite logo" />
      </div>
      <h1 className="text-2xl font-bold">Hello Vite + React!</h1>
      <p className="mt-4">Count: {count}</p>
      <button
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => setCount(count + 1)}
      >
        Increment
      </button>

      <div className="mt-6">
        <Link
          to="/post-generator"
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Go to Post Generator
        </Link>
      </div>
    </div>
  );
}

export default App;
