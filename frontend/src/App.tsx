import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"

import JoinSession from "./pages/JoinSession"
import Admin from "./pages/Admin"
import Voting from "./pages/Voting"
import Results from "./pages/Results"
import "./App.css"
import Login from "./pages/login"
import Register from "./pages/register";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
  {/* Public routes */}
  <Route
    path="/login"
    element={<Login />}
  />

  <Route
    path="/register"
    element={<Register />}
  />

  {/* Logged-in users */}
  <Route
    element={<ProtectedRoute />}
  >
    <Route
      path="/"
      element={<JoinSession />}
    />

    <Route
      path="/voting/:code"
      element={<Voting />}
    />

    <Route
      path="/voting/:code/results"
      element={<Results />}
    />
  </Route>

  {/* Admin only */}
  <Route
    element={
      <ProtectedRoute
        requireAdmin
      />
    }
  >
    <Route
      path="/admin"
      element={<Admin />}
    />
  </Route>
</Routes>
    </BrowserRouter>
  )
}

export default App