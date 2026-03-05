import React, { useState } from "react";
import { Card, CardHeader, CardBody, Input, Button, Chip } from "@heroui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login: React.FC<{ onLogin: (role: string) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/login/", {
        username,
        password,
      });
      onLogin(response.data.role);
      navigate("/");
    } catch (err) {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-96 shadow-lg">
        <CardHeader className="flex flex-col gap-1 px-6 pt-6">
          <h1 className="text-2xl font-bold">Guardian Login</h1>
          <p className="text-default-500">Sign in to your secure vault</p>
        </CardHeader>
        <CardBody className="px-6 pb-6 gap-4">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <Chip color="danger" variant="flat" className="w-full">
                {error}
              </Chip>
            )}
            <Button color="primary" type="submit" isLoading={loading}>
              Login
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default Login;
