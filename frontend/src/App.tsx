import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"

import JoinSession from "./pages/JoinSession"
import Admin from "./pages/Admin"
import Voting from "./pages/Voting"
import Results from "./pages/Results"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<JoinSession />}
        />

        <Route
          path="/admin"
          element={<Admin />}
        />

        <Route
          path="/voting"
          element={<Voting />}
        />

        <Route
          path="/vote/:code"
          element={<Voting />}
        />

        <Route
          path="/voting/:code/results"
          element={<Results />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App