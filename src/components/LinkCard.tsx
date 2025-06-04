
import React from 'react';
import { Link } from '../types/Link';
import { getTimeAgo } from '../utils/timeUtils';

interface LinkCardProps {
  link: Link;
  onClick: () => void;
}

export const LinkCard: React.FC<LinkCardProps> = ({ link, onClick }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(link.url, '_blank');
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start gap-3 mb-3">
        {link.favicon && (
          <img
            src={link.favicon}
            alt=""
            className="w-5 h-5 mt-0.5 flex-shrink-0"
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
        </div>
      </div>

      {link.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {link.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">
        {getTimeAgo(link.createdAt)}
      </p>
    </div>
  );
};
