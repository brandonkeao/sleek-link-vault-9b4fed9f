
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash, Link2, Share } from 'lucide-react';
import { Link } from '../types/Link';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';

interface LinkDetailProps {
  link: Link;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (link: Link) => void;
  onDelete: (linkId: string) => void;
  allTags: string[];
}

export const LinkDetail: React.FC<LinkDetailProps> = ({
  link,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  allTags
}) => {
  const [tags, setTags] = useState<string[]>(link.tags);
  const [newTag, setNewTag] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isShortening, setIsShortening] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setTags(link.tags);
  }, [link.tags]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      onUpdate({ ...link, tags: updatedTags });
      setNewTag('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    onUpdate({ ...link, tags: updatedTags });
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!tags.includes(suggestion)) {
      const updatedTags = [...tags, suggestion];
      setTags(updatedTags);
      onUpdate({ ...link, tags: updatedTags });
    }
    setShowSuggestions(false);
    setNewTag('');
  };

  const handleShortenLink = async () => {
    setIsShortening(true);
    try {
      const { data, error } = await supabase.functions.invoke('shorten-link', {
        body: {
          linkId: link.id,
          url: link.url
        }
      });

      if (error) throw error;

      if (data.success) {
        const updatedLink = {
          ...link,
          shortUrl: data.shortUrl,
          rebrandlyId: data.rebrandlyId,
          shorteningStatus: 'shortened' as const
        };
        onUpdate(updatedLink);
        toast({
          title: "Link shortened successfully!",
          description: `Short URL: ${data.shortUrl}`,
        });
      } else {
        throw new Error(data.error || 'Failed to shorten link');
      }
    } catch (error) {
      console.error('Error shortening link:', error);
      toast({
        title: "Error shortening link",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsShortening(false);
    }
  };

  const handleShareLink = async () => {
    if (link.shortUrl) {
      try {
        const fullShortUrl = link.shortUrl.startsWith('http') ? link.shortUrl : `https://${link.shortUrl}`;
        await navigator.clipboard.writeText(fullShortUrl);
        toast({
          title: "Link copied!",
          description: "Short link has been copied to clipboard",
        });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast({
          title: "Copy failed",
          description: "Could not copy link to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  const handleShortUrlClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (link.shortUrl) {
      const fullShortUrl = link.shortUrl.startsWith('http') ? link.shortUrl : `https://${link.shortUrl}`;
      window.open(fullShortUrl, '_blank');
    }
  };

  const suggestions = allTags.filter(tag => 
    !tags.includes(tag) && 
    tag.toLowerCase().includes(newTag.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Link Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors duration-200"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">{link.title}</h3>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 text-sm break-all transition-colors duration-200"
            >
              {link.url}
            </a>
            
            {link.shortUrl && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Short URL:</p>
                <a
                  href={link.shortUrl.startsWith('http') ? link.shortUrl : `https://${link.shortUrl}`}
                  onClick={handleShortUrlClick}
                  className="text-purple-600 hover:text-purple-700 text-sm break-all transition-colors duration-200 cursor-pointer"
                >
                  {link.shortUrl}
                </a>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-md text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-indigo-600 transition-colors duration-200"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => {
                    setNewTag(e.target.value);
                    setShowSuggestions(e.target.value.length > 0);
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="Add a tag..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
                <button
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Plus size={16} />
                </button>
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors duration-200 text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200 text-center"
            >
              Open Link
            </a>
            
            {!link.shortUrl && (
              <button
                onClick={handleShortenLink}
                disabled={isShortening}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
              >
                <Link2 size={16} />
                {isShortening ? 'Shortening...' : 'Shorten'}
              </button>
            )}
            
            {link.shortUrl && (
              <button
                onClick={handleShareLink}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
              >
                <Share size={16} />
                Share
              </button>
            )}
            
            <button
              onClick={() => onDelete(link.id)}
              className="px-4 py-2 text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors duration-200"
            >
              <Trash size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
