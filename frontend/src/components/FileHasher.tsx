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

interface FileState {
  file: File;
  hash: string;
  status:
    | "pending"
    | "hashing"
    | "ready"
    | "uploading"
    | "success"
    | "duplicate"
    | "error";
  message: string;
}

const FileHasher: React.FC<{ onUploadSuccess: () => void }> = ({
  onUploadSuccess,
}) => {
  const [fileStates, setFileStates] = useState<FileState[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const initialStates: FileState[] = selectedFiles.map((file) => ({
      file,
      hash: "",
      status: "hashing",
      message: "Generating fingerprint...",
    }));

    setFileStates((prev) => [...prev, ...initialStates]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    for (const fileState of initialStates) {
      const generatedHash = await calculateSHA256(fileState.file);
      try {
        const response = await axios.post("/api/check-hash/", {
          hash: generatedHash,
        });
        setFileStates((prev) =>
          prev.map((fs) =>
            fs.file.name === fileState.file.name
              ? {
                  ...fs,
                  hash: generatedHash,
                  status: response.data.exists ? "duplicate" : "ready",
                  message: response.data.exists
                    ? `Duplicate: ${response.data.file_name}`
                    : "Ready to upload",
                }
              : fs,
          ),
        );
      } catch (err) {
        setFileStates((prev) =>
          prev.map((fs) =>
            fs.file.name === fileState.file.name
              ? { ...fs, status: "error", message: "Network error" }
              : fs,
          ),
        );
      }
    }
  };

  const handleBatchUpload = async () => {
    setIsProcessingBatch(true);
    let uploadedCount = 0;

    const filesToUpload = fileStates.filter((fs) => fs.status === "ready");

    for (const fs of filesToUpload) {
      setFileStates((prev) =>
        prev.map((item) =>
          item.file.name === fs.file.name
            ? { ...item, status: "uploading", message: "Uploading..." }
            : item,
        ),
      );

      const formData = new FormData();
      formData.append("file", fs.file);
      formData.append("hash", fs.hash);

      try {
        await axios.post("/api/upload/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setFileStates((prev) =>
          prev.map((item) =>
            item.file.name === fs.file.name
              ? { ...item, status: "success", message: "Uploaded successfully" }
              : item,
          ),
        );
        uploadedCount++;
      } catch (error: any) {
        setFileStates((prev) =>
          prev.map((item) =>
            item.file.name === fs.file.name
              ? {
                  ...item,
                  status: "error",
                  message: error.response?.data?.error || "Upload failed",
                }
              : item,
          ),
        );
      }
    }

    if (uploadedCount > 0) onUploadSuccess();
    setIsProcessingBatch(false);
  };

  const clearCompleted = () => {
    setFileStates((prev) =>
      prev.filter((fs) => fs.status !== "success" && fs.status !== "duplicate"),
    );
  };

  const readyCount = fileStates.filter((fs) => fs.status === "ready").length;

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="flex gap-3 px-6 py-4">
        <div className="flex flex-col">
          <p className="text-xl font-semibold">Pre-Flight Scanner</p>
          <p className="text-small text-default-500">
            Select multiple files to analyze and secure.
          </p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="px-6 py-6 gap-6">
        <div>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={isProcessingBatch}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
          />
        </div>

        {fileStates.length > 0 && (
          <div className="flex flex-col gap-3">
            {fileStates.map((fs, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-default-50 p-3 rounded-lg border border-default-200"
              >
                <div className="flex flex-col truncate w-1/2">
                  <span className="text-sm font-semibold truncate">
                    {fs.file.name}
                  </span>
                  <span className="text-xs text-default-400 font-mono truncate">
                    {fs.hash || "Calculating..."}
                  </span>
                </div>
                <div className="w-1/3 text-right">
                  {fs.status === "hashing" || fs.status === "uploading" ? (
                    <Spinner size="sm" />
                  ) : (
                    <Chip
                      size="sm"
                      color={
                        fs.status === "success"
                          ? "success"
                          : fs.status === "duplicate"
                            ? "warning"
                            : fs.status === "error"
                              ? "danger"
                              : "default"
                      }
                      variant="flat"
                    >
                      {fs.message}
                    </Chip>
                  )}
                </div>
              </div>
            ))}

            <div className="flex gap-3 mt-4">
              <Button
                color="primary"
                onPress={handleBatchUpload}
                isLoading={isProcessingBatch}
                isDisabled={readyCount === 0}
              >
                Upload {readyCount} Ready Files
              </Button>
              <Button
                color="default"
                variant="flat"
                onPress={clearCompleted}
                isDisabled={isProcessingBatch}
              >
                Clear Completed/Duplicates
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default FileHasher;
