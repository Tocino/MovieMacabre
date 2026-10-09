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
} from "../services/api";

type ProtectedRouteProps = {
  requireAdmin?: boolean;
};

function ProtectedRoute({
  requireAdmin = false,
}: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean | null>(null);

  const [isAdmin, setIsAdmin] =
    useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const user =
          await getCurrentUser();

        setIsAuthenticated(true);
        setIsAdmin(user.is_admin);
      } catch {
        sessionStorage.removeItem(
          "access_token"
        );

        setIsAuthenticated(false);
      }
    }

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <p>Checking login...</p>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    requireAdmin &&
    !isAdmin
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;