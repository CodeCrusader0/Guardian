import React, { useState, useRef } from "react";
import axios from "axios";
import { calculateSHA256 } from "../utils/hash";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Divider,
  Chip,
  Spinner,
} from "@heroui/react";

interface ServerStatus {
  exists?: boolean;
  message?: string;
  file_name?: string;
  uploaded_at?: string;
  error?: string;
}

interface FileHasherProps {
  onUploadSuccess: () => void;
}

const FileHasher: React.FC<FileHasherProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFile(null);
    setHash("");
    setServerStatus(null);
    setUploadMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setHash("");
      setServerStatus(null);
      setUploadMessage("");
      setLoading(true);

      const generatedHash = await calculateSHA256(selectedFile);
      setHash(generatedHash);

      try {
        const response = await axios.post("/api/check-hash/", {
          hash: generatedHash,
        });
        setServerStatus(response.data);
      } catch (error) {
        setServerStatus({ error: "Failed to connect to the server." });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !hash) return;
    setIsUploading(true);
    setUploadMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("hash", hash);

    try {
      const response = await axios.post("/api/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadMessage(response.data.message);
      setServerStatus({
        exists: true,
        message: "File is now secured on the server.",
      });
      onUploadSuccess();
    } catch (error: any) {
      setUploadMessage(
        "Upload failed: " + (error.response?.data?.error || "Unknown error"),
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="flex gap-3 px-6 py-4">
        <div className="flex flex-col">
          <p className="text-xl font-semibold">Pre-Flight Scanner</p>
          <p className="text-small text-default-500">
            Select a file to generate a fingerprint
          </p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="px-6 py-6 gap-6">
        {/* File Input */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={loading || isUploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
          />
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-default-500">
            <Spinner size="sm" color="primary" />
            <p>Analyzing fingerprint...</p>
          </div>
        )}

        {/* Results Area */}
        {hash && !loading && (
          <div className="bg-default-50 p-4 rounded-xl flex flex-col gap-4 border border-default-200">
            <div>
              <p className="text-sm font-semibold">File Details</p>
              <p className="text-sm text-default-600">Name: {file?.name}</p>
              <p className="text-xs text-default-400 font-mono mt-1 break-all">
                SHA-256: {hash}
              </p>
            </div>

            <Divider />

            {serverStatus?.exists && !uploadMessage ? (
              <div className="flex flex-col gap-3 items-start">
                <Chip color="danger" variant="flat" size="lg">
                  🚨 {serverStatus.message}
                </Chip>
                {serverStatus.file_name && (
                  <p className="text-sm">
                    Matched File:{" "}
                    <span className="font-semibold">
                      {serverStatus.file_name}
                    </span>
                  </p>
                )}
                <p className="text-xs text-danger-500 font-medium">
                  Upload blocked to conserve server bandwidth.
                </p>

                {/* 4. Reset Button for Duplicates */}
                <Button
                  size="sm"
                  color="default"
                  variant="flat"
                  onPress={resetForm}
                  className="mt-2"
                >
                  Check Another File
                </Button>
              </div>
            ) : !serverStatus?.exists ? (
              <div className="flex flex-col gap-4 items-start">
                <Chip color="success" variant="flat" size="lg">
                  ✅ {serverStatus?.message}
                </Chip>
                <Button
                  color="primary"
                  isLoading={isUploading}
                  onPress={handleUpload}
                  className="font-semibold shadow-sm"
                >
                  Confirm & Upload
                </Button>
              </div>
            ) : null}

            {/* 5. Success State and Reset Button */}
            {uploadMessage && (
              <div className="flex flex-col gap-3 items-start mt-2">
                <Chip
                  color={
                    uploadMessage.includes("failed") ? "danger" : "success"
                  }
                  variant="dot"
                >
                  {uploadMessage}
                </Chip>
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  onPress={resetForm}
                >
                  Upload Another File
                </Button>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default FileHasher;
