import { useState, useEffect } from 'react';
import { getPublicSettings } from '../../services/settingsService';
import ReactMarkdown from 'react-markdown';
import { FiLoader } from 'react-icons/fi';

export default function AdChoices() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await getPublicSettings();
        const adContent = response?.data?.adChoicesContent || response?.adChoicesContent || '';
        setContent(adContent || '## Ad Choices\n\nNo content available yet.');
      } catch (err) {
        console.error('Error fetching ad choices:', err);
        setError('Failed to load Ad Choices page');
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><FiLoader className="animate-spin text-primary-600" size={32} /></div>;
  if (error) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 md:p-8">
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}