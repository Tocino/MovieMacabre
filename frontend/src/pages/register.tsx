
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  loginUser,
  registerUser,
} from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] =
    useState("");

  async function handleRegister(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setError("");

    if (!username.trim()) {
      setError(
        "Please enter a username"
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter a password"
      );
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        "Passwords do not match"
      );
      return;
    }

    try {
      await registerUser(
        username.trim(),
        password
      );

      // Automatically log in
      // after registration.
      const loginData =
        await loginUser(
          username.trim(),
          password
        );

      sessionStorage.setItem(
        "access_token",
        loginData.access_token
      );

      navigate("/");

    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Registration failed"
        );
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
            Create an account to
            join movie night.
          </p>
        </div>

        <section className="panel join-panel">
          <h2>
            Create Account
          </h2>

          <form
            onSubmit={
              handleRegister
            }
          >
            <div className="join-field">
              <label htmlFor="username">
                Username
              </label>

              <input
                id="username"
                type="text"
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
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="join-field">
              <label htmlFor="confirm-password">
                Confirm Password
              </label>

              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
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
            >
              Create Account
            </button>
          </form>

          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
          >
            Already have an account?
            Log in
          </button>
        </section>
      </div>
    </main>
  );
}

export default Register;
