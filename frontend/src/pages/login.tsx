import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCurrentUser, loginUser } from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  async function handleLogin(
    event: React.FormEvent
  ) {
    event.preventDefault();

    try {
      setError("");

      const data = await loginUser(
        username,
        password
      );

      sessionStorage.setItem(
        "access_token",
        data.access_token
      );

      const user =
        await getCurrentUser();

    if (user.is_admin) {
    navigate("/admin");
    } else {
    navigate("/");
}

    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Login failed");
      }
    }
  }

return (
  <main className="join-page">
    <div className="join-container">

      <div className="join-header">
        <h1 className="app-title">
          MovieMacabre
        </h1>

        <p>
          Sign in to join the movie night
          and cast your votes.
        </p>
      </div>

      <section className="panel join-panel">
        <h2>Login</h2>

        <form onSubmit={handleLogin}>

          <div className="join-field">
            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value
                )
              }
            />
          </div>

          <div className="join-field">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
            />
          </div>

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          <button
            className="button-primary join-button"
            type="submit"
            disabled={
              !username.trim() ||
              !password
            }
          >
            Login
          </button>

        </form>

        <div className="login-register">
          <p>
            Don't have an account?
          </p>

          <button
            type="button"
            className="button-secondary"
            onClick={() =>
              navigate("/register")
            }
          >
            Create Account
          </button>
        </div>

      </section>
    </div>
  </main>
);
}

export default Login;