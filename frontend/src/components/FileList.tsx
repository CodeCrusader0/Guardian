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
}

interface FileListProps {
  refreshTrigger?: number;
}

const FileList: React.FC<FileListProps> = ({ refreshTrigger = 0 }) => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/files/");
      setFiles(response.data.files);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
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
        <Button size="sm" color="default" variant="flat" onPress={fetchFiles}>
          Refresh Table
        </Button>
      </div>

      <Table aria-label="File registry table" className="shadow-md">
        <TableHeader>
          <TableColumn>FILENAME</TableColumn>
          <TableColumn>SIZE</TableColumn>
          <TableColumn>FINGERPRINT (SHA-256)</TableColumn>
          <TableColumn>UPLOADED</TableColumn>
          <TableColumn>STATUS</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent={"No files found in the registry."}
          isLoading={loading}
          loadingContent={<Spinner label="Loading..." />}
        >
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell className="font-medium">
                {file.original_name}
              </TableCell>
              <TableCell>{formatBytes(file.file_size)}</TableCell>
              <TableCell>
                <code className="text-xs bg-default-100 px-2 py-1 rounded text-default-600">
                  {file.sha256_hash.substring(0, 20)}...
                </code>
              </TableCell>
              <TableCell className="text-default-500">
                {file.uploaded_at}
              </TableCell>
              <TableCell>
                {file.is_archived ? (
                  <Chip size="sm" color="default" variant="flat">
                    📦 Archived
                  </Chip>
                ) : (
                  <Chip size="sm" color="success" variant="flat">
                    🟢 On Server
                  </Chip>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FileList;
