import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import axios from "axios";

// Setup Base URL and Credentials globally
axios.defaults.baseURL = "http://127.0.0.1:8000";
axios.defaults.withCredentials = true;

import FileHasher from "./components/FileHasher";
import FileList from "./components/FileList";
import Login from "./components/Login";
import LogoutButton from "./components/LogoutButton";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={<Login onLogin={() => setIsAuthenticated(true)} />}
        />

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-10">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight">
                      Guardian Dashboard
                    </h1>
                    <p className="text-default-500 text-lg">
                      Secure, hash-based deduplication manager.
                    </p>
                  </div>
                  <LogoutButton onLogout={() => setIsAuthenticated(false)} />
                </div>

                <FileHasher
                  onUploadSuccess={() => setRefreshTrigger((prev) => prev + 1)}
                />
                <FileList refreshTrigger={refreshTrigger} />
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
