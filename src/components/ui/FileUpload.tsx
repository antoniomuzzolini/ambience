import React from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  currentFile?: { name: string } | null;
  label: string;
  className?: string;
  accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  currentFile,
  label,
  className = '',
  accept = 'audio/*,video/mp4'
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files?.[0] || null);
  };

  if (currentFile) {
    return (
      <div className="text-center">
        <div className="mb-4 p-3 bg-gray-600 rounded">
          <p className="text-sm text-green-400 mb-2">✓ Uploaded</p>
          <p className="text-xs text-gray-300 truncate">
            {currentFile.name}
          </p>
        </div>
        <label className={`cursor-pointer bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm ${className}`}>
          Change File
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>
    );
  }

  return (
    <label className={`flex flex-col items-center gap-3 cursor-pointer bg-gray-600 hover:bg-gray-500 p-6 rounded border-2 border-dashed border-gray-500 hover:border-gray-400 ${className}`}>
      <Upload size={24} />
      <span className="text-sm text-center">
        {label}
      </span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
    </label>
  );
};