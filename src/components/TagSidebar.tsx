
import React from 'react';
import { Link as LinkIcon, Hash } from 'lucide-react';
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
}

export const TagSidebar: React.FC<TagSidebarProps> = ({
  allTags,
  selectedTags,
  onTagSelect,
  linkCounts,
  totalLinks
}) => {
  const isAllLinksSelected = selectedTags.length === 0;

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-gray-200">
        <div className="flex items-center gap-2 px-4 py-2">
          <LinkIcon className="w-5 h-5 text-indigo-600" />
          <span className="font-semibold text-gray-900">My Links</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Filters</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onTagSelect(null)}
                  isActive={isAllLinksSelected}
                  className="w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    <LinkIcon size={16} />
                    <span>All Links</span>
                  </div>
                  <span className="text-xs text-gray-500">{totalLinks}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {allTags.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Tags</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {allTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  const count = linkCounts[tag] || 0;
                  
                  return (
                    <SidebarMenuItem key={tag}>
                      <SidebarMenuButton
                        onClick={() => onTagSelect(tag)}
                        isActive={isSelected}
                        className="w-full justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Hash size={16} />
                          <span className="truncate">{tag}</span>
                        </div>
                        <span className="text-xs text-gray-500">{count}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};
