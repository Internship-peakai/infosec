import React, { useState } from 'react';
import { X, Upload, Loader } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, username: string) => Promise<void>;
}

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [username, setUsername] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !username.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await onUpload(file, username);
      onClose();
      setUsername('');
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6">Upload Document</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-200"
              placeholder="Enter your name"
              disabled={isUploading}
            />
          </div>

          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
              Document (PDF)
            </label>
            <div className="relative">
              <input
                type="file"
                id="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                disabled={isUploading}
              />
              <label
                htmlFor="file"
                className={`w-full px-4 py-2 border-2 border-purple-100 rounded-xl flex items-center justify-center gap-2 cursor-pointer
                  ${file ? 'bg-purple-50 text-purple-700' : 'bg-white text-gray-500'}
                  ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-50'}`}
              >
                <Upload size={20} />
                {file ? file.name : 'Choose PDF file'}
              </label>
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isUploading}
            className={`w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl
              ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-600 hover:to-pink-600'}
              transition-all duration-300 flex items-center justify-center gap-2`}
          >
            {isUploading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Document'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}