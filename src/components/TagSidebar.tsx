
import React from 'react';
import { Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from './ui/sidebar';

interface TagSidebarProps {
  allTags: string[];
  selectedTags: string[];
  onTagSelect: (tag: string | null) => void;
  linkCounts: Record<string, number>;
  totalLinks: number;
  onSettingsClick: () => void;
}

export const TagSidebar: React.FC<TagSidebarProps> = ({
  allTags,
  selectedTags,
  onTagSelect,
  linkCounts,
  totalLinks,
  onSettingsClick
}) => {
  const { user, signOut } = useAuth();

  const handleTagClick = (tag: string, event: React.MouseEvent) => {
    // Check for Shift or Cmd/Ctrl key for multi-selection
    if (event.shiftKey || event.metaKey || event.ctrlKey) {
      // Multi-selection mode - toggle tag
      onTagSelect(tag);
    } else {
      // Single selection mode - replace current selection
      if (selectedTags.length === 1 && selectedTags[0] === tag) {
        // If clicking the only selected tag, clear selection
        onTagSelect(null);
      } else {
        // Replace selection with this tag
        onTagSelect(tag);
      }
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">My Links</h2>
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettingsClick}
              className="p-2 text-gray-700 hover:text-gray-900"
            >
              <Settings size={16} />
            </Button>
          )}
        </div>
        {user && (
          <div className="text-sm text-gray-700">
            <p className="font-medium">{user.email}</p>
            <Button
              variant="link"
              size="sm"
              onClick={signOut}
              className="p-0 h-auto text-xs text-purple-600 hover:text-purple-700"
            >
              Sign out
            </Button>
          </div>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-900 font-medium">Filter by Tags</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onTagSelect(null)}
                  className={`w-full justify-between text-gray-900 ${
                    selectedTags.length === 0 ? 'bg-purple-50 text-purple-700 font-medium' : 'hover:bg-gray-50'
                  }`}
                >
                  <span>All Links</span>
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                    {totalLinks}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {allTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <SidebarMenuItem key={tag}>
                    <SidebarMenuButton
                      onClick={(e) => handleTagClick(tag, e)}
                      className={`w-full justify-between text-gray-900 ${
                        isSelected ? 'bg-purple-50 text-purple-700 font-medium' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{tag}</span>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        {linkCounts[tag] || 0}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {selectedTags.length > 1 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-900 font-medium">Active Filters</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="text-xs text-gray-600 px-3">
                Hold Shift or Cmd/Ctrl to select multiple tags
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};
