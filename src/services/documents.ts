import { GraphQLClient } from 'graphql-request';
import { useAuthToken } from './auth';

interface Document {
  id: string;
  uploader_name: string;
  doc_url: string;
  doc_name: string;
  pine_response: string | null;
  created_at: string;
  updated_at: string;
  status: string;
}

const endpoint = 'https://btfjbftqfejkwrldrgoo.hasura.ap-south-1.nhost.run/v1/graphql';

interface DocumentsResponse {
  infosec_ai_docs_data: Document[];
}

const GET_DOCUMENTS = `
  query GetAllDocs {
    infosec_ai_docs_data {
      id
      uploader_name
      doc_url
      pine_response
      created_at
      updated_at
      status
    }
  }
`;

const UPLOAD_DOCUMENT = `
  mutation UploadDocument($file: Upload!) {
    uploadDocument(file: $file) {
      id
      doc_url
      status
    }
  }
`;

export const useDocuments = () => {
  const { getStoredToken } = useAuthToken();

  const fetchDocuments = async (): Promise<Document[]> => {
    const token = getStoredToken();
    if (!token) {
      throw new Error('No access token available');
    }

    const client = new GraphQLClient(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    try {
      const data = await client.request<DocumentsResponse>(GET_DOCUMENTS);
      return data.infosec_ai_docs_data.map(doc => ({
        ...doc,
        doc_name: doc.doc_url.split('/').pop() || ''
      }));
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  };

  const uploadDocument = async (file: File, username?: string): Promise<Document> => {
    const token = getStoredToken();
    if (!token) {
      throw new Error('No access token available');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploader_name', username || 'User');
      formData.append('file_name', file.name);

      const response = await fetch('https://n8n-dev.subspace.money/webhook/file/uploader', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  };

  return { fetchDocuments, uploadDocument };
};