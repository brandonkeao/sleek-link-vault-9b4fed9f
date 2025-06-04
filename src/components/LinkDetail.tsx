
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash } from 'lucide-react';
import { Link } from '../types/Link';

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
