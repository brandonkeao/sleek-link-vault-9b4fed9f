
import React, { useState } from 'react';
import { Link } from '../types/Link';
import { fetchLinkMetadata } from '../utils/linkMetadata';

interface LinkInputProps {
  onAddLink: (link: Link) => void;
}

export const LinkInput: React.FC<LinkInputProps> = ({ onAddLink }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);

    try {
      // Ensure URL has protocol
      let formattedUrl = url.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }

      const metadata = await fetchLinkMetadata(formattedUrl);

      const newLink: Link = {
        id: Date.now().toString(),
        url: formattedUrl,
        title: metadata.title,
        tags: [],
        createdAt: new Date(),
        favicon: metadata.favicon
      };

      onAddLink(newLink);
      setUrl('');
    } catch (error) {
      console.error('Error adding link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a URL to save..."
          className="w-full px-4 py-3 pr-28 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!url.trim() || isLoading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            'Save Link'
          )}
        </button>
      </div>
    </form>
  );
};
