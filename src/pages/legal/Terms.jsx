import { useState, useEffect } from 'react';
import { getPublicSettings } from '../../services/settingsService';
import ReactMarkdown from 'react-markdown';
import { FiLoader } from 'react-icons/fi';

export default function Terms() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await getPublicSettings();
        const termsContent = response?.data?.termsOfService || response?.termsOfService || '';
        setContent(termsContent || '## Terms of Service\n\nNo content available yet.');
      } catch (err) {
        console.error('Error fetching terms:', err);
        setError('Failed to load Terms of Service');
      } finally {
        setLoading(false);
      }
    };
    fetchTerms();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white">
        <FiLoader className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 bg-white min-h-screen">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 md:p-8">
          <div className="prose max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}