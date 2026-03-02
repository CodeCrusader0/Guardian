import React from "react";
import { Button } from "@heroui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LogoutButton: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("http://127.0.0.1:8000/api/logout/");
      onLogout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <Button color="danger" variant="flat" size="sm" onPress={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;
