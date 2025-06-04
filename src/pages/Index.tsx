
import React, { useState, useEffect } from 'react';
import { LinkInput } from '../components/LinkInput';
import { SearchBar } from '../components/SearchBar';
import { ViewSwitcher } from '../components/ViewSwitcher';
import { LinkCard } from '../components/LinkCard';
import { LinkListItem } from '../components/LinkListItem';
import { LinkDetail } from '../components/LinkDetail';
import { EmptyState } from '../components/EmptyState';
import { BulkActionToolbar } from '../components/BulkActionToolbar';
import { TagSidebar } from '../components/TagSidebar';
import { linkStorage } from '../utils/linkStorage';
import { Link } from '../types/Link';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '../components/ui/sidebar';

const Index = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>([]);

  // Load links and view preference from localStorage on mount
  useEffect(() => {
    const savedLinks = linkStorage.getAll();
    setLinks(savedLinks);
    setFilteredLinks(savedLinks);
    
    const savedViewMode = localStorage.getItem('linkManager_viewMode') as 'card' | 'list';
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Save view mode preference
  useEffect(() => {
    localStorage.setItem('linkManager_viewMode', viewMode);
  }, [viewMode]);

  // Filter links based on search and tags
  useEffect(() => {
    let filtered = links;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(link =>
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(link =>
        selectedTags.every(tag => link.tags.includes(tag))
      );
    }

    setFilteredLinks(filtered);
    
    // Clear selections when filters change
    setSelectedLinkIds([]);
  }, [links, searchQuery, selectedTags]);

  const handleAddLink = (newLink: Link) => {
    const updatedLinks = [newLink, ...links];
    setLinks(updatedLinks);
    linkStorage.save(updatedLinks);
  };

  const handleUpdateLink = (updatedLink: Link) => {
    const updatedLinks = links.map(link =>
      link.id === updatedLink.id ? updatedLink : link
    );
    setLinks(updatedLinks);
    linkStorage.save(updatedLinks);
    setSelectedLink(updatedLink);
  };

  const handleDeleteLink = (linkId: string) => {
    const updatedLinks = links.filter(link => link.id !== linkId);
    setLinks(updatedLinks);
    linkStorage.save(updatedLinks);
    setIsDetailOpen(false);
    setSelectedLink(null);
    setSelectedLinkIds(prev => prev.filter(id => id !== linkId));
  };

  const handleLinkClick = (link: Link) => {
    setSelectedLink(link);
    setIsDetailOpen(true);
  };

  const handleTagSelect = (tag: string | null) => {
    if (tag === null) {
      setSelectedTags([]);
    } else {
      setSelectedTags(prev =>
        prev.includes(tag)
          ? prev.filter(t => t !== tag)
          : [...prev, tag]
      );
    }
  };

  const handleLinkSelection = (linkId: string, selected: boolean) => {
    setSelectedLinkIds(prev =>
      selected
        ? [...prev, linkId]
        : prev.filter(id => id !== linkId)
    );
  };

  const handleBulkTag = (tagsToAdd: string[]) => {
    const updatedLinks = links.map(link => {
      if (selectedLinkIds.includes(link.id)) {
        const newTags = [...new Set([...link.tags, ...tagsToAdd])];
        return { ...link, tags: newTags };
      }
      return link;
    });
    setLinks(updatedLinks);
    linkStorage.save(updatedLinks);
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredLinks.map(link => link.id);
    setSelectedLinkIds(allFilteredIds);
  };

  const handleClearSelection = () => {
    setSelectedLinkIds([]);
  };

  const allTags = [...new Set(links.flatMap(link => link.tags))];
  
  // Calculate tag counts
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = links.filter(link => link.tags.includes(tag)).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <TagSidebar
          allTags={allTags}
          selectedTags={selectedTags}
          onTagSelect={handleTagSelect}
          linkCounts={tagCounts}
          totalLinks={links.length}
        />
        
        <SidebarInset>
          <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Links</h1>
                    <p className="text-gray-600">Save and organize your favorite links</p>
                  </div>
                </div>
                
                {links.length > 0 && (
                  <div className="flex items-center gap-4">
                    {filteredLinks.length > 0 && selectedLinkIds.length === 0 && (
                      <button
                        onClick={handleSelectAll}
                        className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
                      >
                        Select All
                      </button>
                    )}
                    <ViewSwitcher viewMode={viewMode} onViewChange={setViewMode} />
                  </div>
                )}
              </div>
            </div>

            {/* Add Link Input */}
            <div className="mb-6">
              <LinkInput onAddLink={handleAddLink} />
            </div>

            {/* Search */}
            {links.length > 0 && (
              <div className="mb-6">
                <SearchBar 
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
            )}

            {/* Links Display */}
            {filteredLinks.length > 0 ? (
              <div className={
                viewMode === 'card' 
                  ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                  : "space-y-2"
              }>
                {filteredLinks.map((link) => {
                  const isSelected = selectedLinkIds.includes(link.id);
                  
                  return viewMode === 'card' ? (
                    <LinkCard
                      key={link.id}
                      link={link}
                      isSelected={isSelected}
                      onSelect={(selected) => handleLinkSelection(link.id, selected)}
                      onClick={() => handleLinkClick(link)}
                    />
                  ) : (
                    <LinkListItem
                      key={link.id}
                      link={link}
                      isSelected={isSelected}
                      onSelect={(selected) => handleLinkSelection(link.id, selected)}
                      onClick={() => handleLinkClick(link)}
                    />
                  );
                })}
              </div>
            ) : links.length > 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No links match your search</p>
              </div>
            ) : (
              <EmptyState />
            )}

            {/* Bulk Action Toolbar */}
            <BulkActionToolbar
              selectedCount={selectedLinkIds.length}
              onClearSelection={handleClearSelection}
              onBulkTag={handleBulkTag}
              allTags={allTags}
            />

            {/* Link Detail Modal */}
            {selectedLink && (
              <LinkDetail
                link={selectedLink}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                onUpdate={handleUpdateLink}
                onDelete={handleDeleteLink}
                allTags={allTags}
              />
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
