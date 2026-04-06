import React from "react";
import "./Signup.css";
import { RiMovie2AiFill } from "react-icons/ri";
import { Link } from "react-router-dom";

const Signup = () => {
  return (
    <div className="signup-container">
      <div className="signup-box">
        <h1 className="logo-of-signup">
          <RiMovie2AiFill /> Movie-Hub
        </h1>

        <h2>Create Account</h2>

        <form className="signup-form">
          <input type="text" placeholder="Enter Name" />
          <input type="email" placeholder="Enter Email" />
          <input type="password" placeholder="Enter Password" />
          <input type="password" placeholder="Confirm Password" />

          <button type="submit">Sign Up</button>
        </form>

        <p className="login-text">
          Already have an account? <Link to={"/login"} className="link">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
