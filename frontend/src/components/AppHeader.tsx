import { useNavigate } from "react-router-dom";
import { logoutUser } from "../services/api";

type AppHeaderProps = {
  username?: string;
};

function AppHeader({
  username,
}: AppHeaderProps) {
  const navigate = useNavigate();

  function handleLogout() {
    logoutUser();
    navigate("/login");
  }

  return (
    <header className="app-header">
      <div className="app-header-content">
        <h1
          className="app-header-title"
          onClick={() => navigate("/")}
        >
          MovieMacabre
        </h1>

        {username && (
          <div className="app-header-user">
            <span>
              {username}
            </span>

            <button
              type="button"
              className="button-secondary"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default AppHeader;