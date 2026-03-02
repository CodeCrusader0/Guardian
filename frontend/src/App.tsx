import { useState } from "react";
import FileHasher from "./components/FileHasher";
import FileList from "./components/FileList";

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Guardian Dashboard
        </h1>
        <p className="text-default-500 text-lg">
          Secure, hash-based deduplication server manager.
        </p>
      </div>

      {/* Pass the success function to the uploader */}
      <FileHasher onUploadSuccess={handleUploadSuccess} />

      {/* Pass the trigger value to the table */}
      <FileList refreshTrigger={refreshTrigger} />
    </div>
  );
}

export default App;
