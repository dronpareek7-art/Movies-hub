import React from "react";
import "./Login.css";
import { RiMovie2AiFill } from "react-icons/ri";


const Login = () => {
  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="logo-of-login">
          <RiMovie2AiFill /> Movie-Hub

        </h1>
        <h2>Welcome Back</h2>

        <form className="form">
          <input type="email" placeholder="Enter Email" />
          <input type="password" placeholder="Enter Password" />
          <button type="submit">Login</button>
        </form>

        <p className="signup-text">
          Don’t have an account? <span>Sign Up</span>
        </p>
      </div>
    </div>
  );
};

export default Login;