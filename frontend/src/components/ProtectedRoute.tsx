import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  getCurrentUser,
  logoutUser,
} from "../services/api";

import type {
  User,
} from "../types/user";

type ProtectedRouteProps = {
  requireAdmin?: boolean;
};

function ProtectedRoute({
  requireAdmin = false,
}: ProtectedRouteProps) {
  const [user, setUser] =
    useState<User | null>(null);

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser =
          await getCurrentUser();

        setUser(currentUser);
      } catch {
        logoutUser();
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    }

    checkAuth();
  }, []);

  if (checkingAuth) {
    return (
      <p>Checking login...</p>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    requireAdmin &&
    !user.is_admin
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return (
    <Outlet
      context={{ user }}
    />
  );
}

export default ProtectedRoute;