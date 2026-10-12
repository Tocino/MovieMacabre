
import {
  useState,
} from "react";

import {
  useNavigate,
  useOutletContext,
} from "react-router-dom";

import {
  getVotingSession,
} from "../services/api";

import AppHeader from "../components/AppHeader";

import type {
  User,
} from "../types/user";

function JoinSession() {

  const { user } =
  useOutletContext<{
    user: User;
  }>();

  const [sessionCode, setSessionCode] =
    useState("");

  const [username, setUsername] =
    useState("");

  const [error, setError] =
    useState("");

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  const navigate = useNavigate();

  // -------------------------
  // Check login
  // -------------------------

  // -------------------------
  // Join session
  // -------------------------

  async function handleJoin() {
    if (!sessionCode.trim()) {
      setError(
        "Please enter a session code"
      );

      return;
    }

    try {
      setError("");

      const session =
        await getVotingSession(
          sessionCode
            .trim()
            .toUpperCase()
        );

      if (!session) {
        setError(
          "Invalid session code"
        );

        return;
      }

      navigate(
        `/voting/${session.code}`
      );

    } catch (error) {
      console.error(error);

      setError(
        "Could not join session"
      );
    }
  }

  // -------------------------
  // Page
  // -------------------------

  return (
    <>
    <AppHeader
      username={user.username}
    />

    <main className="join-page">
      <div className="join-container">
        <div className="join-header">

          <p>
            Join the movie night and
            vote for what you want
            to watch.
          </p>
        </div>

        <section className="panel join-panel">
          <h2>
            Join Session
          </h2>

          <p>
            Logged in as{" "}
            <strong>
              {user.username}
            </strong>
          </p>

          <div className="join-field">
            <label htmlFor="session-code">
              Session Code
            </label>

            <input
              id="session-code"
              type="text"
              placeholder="Enter session code"
              value={sessionCode}
              onChange={(event) =>
                setSessionCode(
                  event.target.value
                    .toUpperCase()
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
            onClick={handleJoin}
            disabled={
              !sessionCode.trim()
            }
          >
            Join Voting
          </button>
        </section>
      </div>
    </main>
    </>
  );
}

export default JoinSession;
