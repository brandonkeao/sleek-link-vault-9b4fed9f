
import React, { useState } from 'react';
import { Link2 } from 'lucide-react';
import { Link } from '../types/Link';
import { getTimeAgo } from '../utils/timeUtils';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';

interface LinkListItemProps {
  link: Link;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onClick: () => void;
  onUpdate?: (updatedLink: Link) => void;
}

export const LinkListItem: React.FC<LinkListItemProps> = ({ 
  link, 
  isSelected, 
  onSelect, 
  onClick,
  onUpdate
}) => {
  const [shortening, setShortening] = useState(false);
  const { toast } = useToast();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(link.url, '_blank');
  };

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(!isSelected);
  };

  const handleShortenLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShortening(true);

    try {
      const { data, error } = await supabase.functions.invoke('shorten-link', {
        body: { linkId: link.id, url: link.url }
      });

      if (error) throw error;

      if (data.success) {
        const updatedLink = {
          ...link,
          shortUrl: data.shortUrl,
          rebrandlyId: data.rebrandlyId,
          shorteningStatus: 'shortened' as const
        };
        
        if (onUpdate) {
          onUpdate(updatedLink);
        }

        toast({
          title: "Link shortened successfully",
          description: `Short URL: ${data.shortUrl}`,
        });
      } else {
        throw new Error(data.error || 'Failed to shorten link');
      }
    } catch (error) {
      console.error('Error shortening link:', error);
      toast({
        title: "Error",
        description: "Failed to shorten link. Please try again.",
        variant: "destructive",
      });
    }

    setShortening(false);
  };

  const handleShortUrlClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (link.shortUrl) {
      // Ensure we're opening the full URL, not a relative path
      const fullUrl = link.shortUrl.startsWith('http') 
        ? link.shortUrl 
        : `https://${link.shortUrl}`;
      window.open(fullUrl, '_blank');
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white border border-gray-200 p-4 hover:shadow-sm hover:border-gray-300 transition-all duration-200 cursor-pointer group flex items-center gap-4 ${
        isSelected ? 'ring-2 ring-indigo-500 border-indigo-300' : ''
      }`}
    >
      <div
        onClick={handleCheckboxChange}
        className="flex-shrink-0"
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-center gap-3 flex-1 min-w-0">
        {link.favicon && (
          <img
            src={link.favicon}
            alt=""
            className="w-4 h-4 flex-shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors duration-200">
            {link.title}
          </h3>
          <a
            href={link.url}
            onClick={handleLinkClick}
            className="text-sm text-gray-500 hover:text-indigo-600 truncate block transition-colors duration-200"
          >
            {link.url}
          </a>
          {link.shortUrl && (
            <a
              href={link.shortUrl.startsWith('http') ? link.shortUrl : `https://${link.shortUrl}`}
              onClick={handleShortUrlClick}
              className="text-sm text-green-600 hover:text-green-700 truncate block transition-colors duration-200"
            >
              {link.shortUrl}
            </a>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        {link.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {link.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
            {link.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                +{link.tags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {!link.shortUrl && (
          <button
            onClick={handleShortenLink}
            disabled={shortening}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors duration-200 disabled:opacity-50"
          >
            <Link2 size={12} />
            {shortening ? 'Shortening...' : 'Shorten'}
          </button>
        )}
        
        <p className="text-xs text-gray-400 whitespace-nowrap">
          {getTimeAgo(link.createdAt)}
        </p>
      </div>
    </div>
  );
};
