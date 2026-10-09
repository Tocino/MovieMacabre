
import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getCurrentUser,
  getVotingSession,
  logoutUser
} from "../services/api";

import AppHeader from "../components/AppHeader";

function JoinSession() {
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

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser =
          await getCurrentUser();

        setUsername(
          currentUser.username
        );
      } catch {
        sessionStorage.removeItem(
          "access_token"
        );

        navigate("/login");
      } finally {
        setCheckingAuth(false);
      }
    }

    checkAuth();
  }, [navigate]);

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
        `/vote/${session.code}`
      );

    } catch (error) {
      console.error(error);

      setError(
        "Could not join session"
      );
    }
  }

  // -------------------------
  // Loading
  // -------------------------

  if (checkingAuth) {
    return (
      <p>Checking login...</p>
    );
  }

  function handleLogout() {
    logoutUser();
    navigate("/login");
  }

  // -------------------------
  // Page
  // -------------------------

  return (
    <>
    <AppHeader
      username={username}
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
              {username}
            </strong>
          </p>

          <button
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>

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
