import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from "@heroui/react";

interface UserRecord {
  id: number;
  username: string;
  role: string;
  date_joined: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users/");
      setUsers(response.data.users);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/users/", {
        username: newUsername,
        password: newPassword,
        role: newRole,
      });
      setNewUsername("");
      setNewPassword("");
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to create user");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`/api/users/${id}/`);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to delete user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="flex gap-8 items-start">
      <Card className="w-1/3 shadow-md">
        <CardHeader className="px-6 py-4">
          <h2 className="text-xl font-bold">Add New User</h2>
        </CardHeader>
        <CardBody className="px-6 pb-6">
          <form onSubmit={handleAddUser} className="flex flex-col gap-4">
            <Input
              label="Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm text-default-600">Role</label>
              <select
                className="p-2 border rounded-md text-sm bg-default-50 outline-none"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="user">User (Read/Upload Only)</option>
                <option value="manager">
                  Manager (Manage Users & Archive)
                </option>
                <option value="admin">Admin (Full System Access)</option>
              </select>
            </div>
            <Button color="primary" type="submit" className="mt-2">
              Create Account
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card className="w-2/3 shadow-md">
        <CardHeader className="px-6 py-4">
          <h2 className="text-xl font-bold">System Users</h2>
        </CardHeader>
        <CardBody className="px-0 py-0">
          <Table aria-label="Users Table" removeWrapper>
            <TableHeader>
              <TableColumn>USERNAME</TableColumn>
              <TableColumn>ROLE</TableColumn>
              <TableColumn>JOINED</TableColumn>
              <TableColumn>ACTION</TableColumn>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-semibold">
                    {user.username}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={
                        user.role === "admin"
                          ? "danger"
                          : user.role === "manager"
                            ? "warning"
                            : "default"
                      }
                      variant="flat"
                    >
                      {user.role}
                    </Chip>
                  </TableCell>
                  <TableCell className="text-sm text-default-500">
                    {user.date_joined}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      color="danger"
                      variant="light"
                      onPress={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};

export default UserManagement;
