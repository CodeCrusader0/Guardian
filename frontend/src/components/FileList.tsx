import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Spinner,
  Chip,
} from "@heroui/react";

interface FileRecord {
  id: number;
  original_name: string;
  sha256_hash: string;
  file_size: number;
  uploaded_at: string;
  is_archived: boolean;
  file_url: string | null;
}

interface FileListProps {
  refreshTrigger: number;
  userRole: string;
}

const FileList: React.FC<FileListProps> = ({ refreshTrigger, userRole }) => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isArchiving, setIsArchiving] = useState<boolean>(false);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/files/");
      setFiles(response.data.files);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      await axios.post("/api/archive/");
      fetchFiles();
    } catch (error) {
      alert("Archival process failed! Ensure you have the right permissions.");
    } finally {
      setIsArchiving(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold">Server Vault</h2>
          <p className="text-default-500 text-sm">
            Real-time view of verified files
          </p>
        </div>

        <div className="flex gap-2">
          {/* Hide archive button from standard users */}
          {(userRole === "admin" || userRole === "manager") && (
            <Button
              size="sm"
              color="warning"
              variant="flat"
              onPress={handleArchive}
              isLoading={isArchiving}
            >
              {isArchiving ? "Archiving..." : "Archive Old Files"}
            </Button>
          )}
          <Button size="sm" color="default" variant="flat" onPress={fetchFiles}>
            Refresh Table
          </Button>
        </div>
      </div>

      <Table aria-label="File registry table" className="shadow-md">
        <TableHeader>
          <TableColumn>FILENAME</TableColumn>
          <TableColumn>SIZE</TableColumn>
          <TableColumn>FINGERPRINT</TableColumn>
          <TableColumn>STATUS & LINK</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={"No files found."}
          isLoading={loading}
          loadingContent={<Spinner />}
        >
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell className="font-medium">
                {file.original_name}
              </TableCell>
              <TableCell>{formatBytes(file.file_size)}</TableCell>
              <TableCell>
                <code className="text-xs bg-default-100 px-2 py-1 rounded text-default-600">
                  {file.sha256_hash.substring(0, 16)}...
                </code>
              </TableCell>
              <TableCell>
                <div className="flex gap-3 items-center">
                  {file.is_archived ? (
                    <Chip size="sm" color="default" variant="flat">
                      📦 Archived
                    </Chip>
                  ) : (
                    <Chip size="sm" color="success" variant="flat">
                      🟢 On Server
                    </Chip>
                  )}
                  {/* View file logic */}
                  {file.file_url && (
                    <a
                      href={`http://127.0.0.1:8000${file.file_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm hover:underline"
                    >
                      View
                    </a>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FileList;
