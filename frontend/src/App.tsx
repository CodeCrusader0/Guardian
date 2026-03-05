import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true;

import FileHasher from "./components/FileHasher";
import FileList from "./components/FileList";
import Login from "./components/Login";
import LogoutButton from "./components/LogoutButton";
import UserManagement from "./components/UserManagement";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string>("user");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentTab, setCurrentTab] = useState("vault");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await axios.get("/api/auth-status/");
        setIsAuthenticated(true);
        setUserRole(response.data.role);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    verifySession();
  }, []);

  const handleLoginSuccess = (role: string) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };
  
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Verifying session...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" />
            ) : (
              <Login onLogin={handleLoginSuccess} />
            )
          }
        />

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-10">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight">
                      Guardian Dashboard
                    </h1>
                    <p className="text-default-500 text-lg mt-1">
                      Role:{" "}
                      <span className="font-semibold capitalize text-primary">
                        {userRole}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-4 items-center">
                    {(userRole === "admin" || userRole === "manager") && (
                      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                          className={`px-4 py-2 rounded-md text-sm font-medium ${currentTab === "vault" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                          onClick={() => setCurrentTab("vault")}
                        >
                          File Vault
                        </button>
                        <button
                          className={`px-4 py-2 rounded-md text-sm font-medium ${currentTab === "users" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                          onClick={() => setCurrentTab("users")}
                        >
                          Manage Users
                        </button>
                      </div>
                    )}
                    <LogoutButton onLogout={() => setIsAuthenticated(false)} />
                  </div>
                </div>

                {currentTab === "vault" ? (
                  <>
                    <FileHasher
                      onUploadSuccess={() =>
                        setRefreshTrigger((prev) => prev + 1)
                      }
                    />
                    <FileList
                      refreshTrigger={refreshTrigger}
                      userRole={userRole}
                    />
                  </>
                ) : (
                  <UserManagement />
                )}
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
