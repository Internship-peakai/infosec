import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, FileText, Loader, Plus, Search } from 'lucide-react';
import { UploadModal } from '../components/UploadModal';
import { useDocuments } from '../services/documents';
import { useAuthenticationStatus, useAccessToken } from '@nhost/react';

interface FetchedDocument {
  id: string;
  uploader_name: string;
  doc_url: string;
  doc_name: string;
  created_at: string;
  updated_at: string;
  status: string;
}

interface DocumentsProps {
  onBack: () => void;
}

export function Documents({ onBack }: DocumentsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [documents, setDocuments] = useState<FetchedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { fetchDocuments, uploadDocument } = useDocuments();

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const docs = await fetchDocuments();
        setDocuments(docs);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch documents');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = doc.doc_name.toLowerCase().includes(searchTermLower) || 
                         doc.uploader_name.toLowerCase().includes(searchTermLower);
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const statuses = ['all', ...new Set(documents.map(doc => doc.status))];

  return (
    <div className="min-h-screen bg-gradient relative overflow-hidden">
      {/* Geometric Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Square */}
        <div className="animate-float-slow absolute top-[10%] left-[5%] w-20 h-20 border-2 border-purple-400/20 rotate-45"></div>
        {/* Triangle */}
        <div className="animate-float-medium absolute top-[25%] right-[8%]">
          <div className="w-0 h-0 border-l-[30px] border-l-transparent border-b-[45px] border-b-pink-400/20 border-r-[30px] border-r-transparent"></div>
        </div>
        {/* Circle */}
        <div className="animate-float-fast absolute bottom-[30%] left-[15%] w-24 h-24 border-2 border-purple-500/20 rounded-full"></div>
        {/* Rectangle */}
        <div className="animate-float-medium absolute top-[45%] right-[15%] w-32 h-16 border-2 border-pink-400/20 rotate-12"></div>
        {/* Diamond */}
        <div className="animate-float-slow absolute bottom-[15%] right-[10%] w-20 h-20 border-2 border-purple-400/20 rotate-45"></div>
        {/* Small Circles */}
        <div className="animate-float-fast absolute top-[20%] left-[25%] w-10 h-10 border-2 border-pink-500/20 rounded-full"></div>
        <div className="animate-float-medium absolute bottom-[25%] right-[25%] w-12 h-12 border-2 border-purple-400/20 rounded-full"></div>
      </div>

      <div className="w-full px-16 py-12">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-purple-600 flex items-center gap-1 text-sm py-1 px-3 rounded-lg border border-gray-200 hover:border-purple-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center gap-1 text-sm py-2 px-4 rounded-lg transition-all duration-300"
          >
            <Plus size={16} />
            Add Doc
          </button>

          <UploadModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onUpload={async (file, username) => {
              try {
                await uploadDocument(file, username);
                const docs = await fetchDocuments();
                setDocuments(docs);
              } catch (err) {
                throw err;
              }
            }}
          />
        </div>
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            Document Library
          </h1>
          <p className="mt-2 text-gray-600">Access and manage your InfoSec documents</p>
        </div>

        <div className="bg-transparent backdrop-blur-md ">
          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex-1 min-w-[300px]">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-purple-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-200 bg-white"
                />
              </div>
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 border-2 border-purple-100 rounded-2xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 min-w-[200px]"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Documents Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin">
                <Loader size={48} className="text-purple-600" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-8xl mx-auto">
              {filteredDocuments.map(doc => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100 hover:border-purple-300 transform hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">{doc.doc_name}</h3>
                      <a
                        href={doc.doc_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-all duration-300 flex items-center gap-1.5 flex-shrink-0 ml-2"
                      >
                        <FileText size={14} />
                        View
                      </a>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {new Date(doc.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium
                        ${doc.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}