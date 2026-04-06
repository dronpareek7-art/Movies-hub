import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="notfound">
      <div className="overlay"></div>

      <div className="content-notfound">
        <h1 className="glitch" data-text="404">
          404
        </h1>
        <h2>Page Not Found</h2>

        <p className="countdown">
          Redirecting to home in <span>{count}</span> sec...
        </p>

        <button onClick={() => navigate("/")}>Go Home Now</button>
      </div>
    </div>
  );
};

export default NotFound;
