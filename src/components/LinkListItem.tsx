
import React from 'react';
import { Link } from '../types/Link';
import { getTimeAgo } from '../utils/timeUtils';

interface LinkListItemProps {
  link: Link;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onClick: () => void;
}

export const LinkListItem: React.FC<LinkListItemProps> = ({ 
  link, 
  isSelected, 
  onSelect, 
  onClick 
}) => {
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
        
        <p className="text-xs text-gray-400 whitespace-nowrap">
          {getTimeAgo(link.createdAt)}
        </p>
      </div>
    </div>
  );
};
