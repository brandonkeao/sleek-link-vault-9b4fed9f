import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LinkInput } from '../components/LinkInput';
import { SearchBar } from '../components/SearchBar';
import { ViewSwitcher } from '../components/ViewSwitcher';
import { LinkCard } from '../components/LinkCard';
import { LinkListItem } from '../components/LinkListItem';
import { LinkDetail } from '../components/LinkDetail';
import { EmptyState } from '../components/EmptyState';
import { BulkActionToolbar } from '../components/BulkActionToolbar';
import { TagSidebar } from '../components/TagSidebar';
import SettingsPage from '../components/SettingsPage';
import { linkDatabase } from '../utils/linkDatabase';
import { Link } from '../types/Link';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '../components/ui/sidebar';

const Index = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [links, setLinks] = useState<Link[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Load links when user is authenticated
  useEffect(() => {
    if (user) {
      loadLinks();
      
      // Set up real-time subscription for links
      const channel = supabase
        .channel('links-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'links'
          },
          () => {
            loadLinks();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  // Load view preference from localStorage
  useEffect(() => {
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
    setSelectedLinkIds([]);
  }, [links, searchQuery, selectedTags]);

  const loadLinks = async () => {
    const loadedLinks = await linkDatabase.getAll();
    setLinks(loadedLinks);
  };

  const handleAddLink = async (newLink: Omit<Link, 'id' | 'createdAt'>) => {
    const savedLink = await linkDatabase.save(newLink);
    if (savedLink) {
      setLinks(prev => [savedLink, ...prev]);
      
      // Check for Slack notification
      const slackConnected = localStorage.getItem('slackConnected') === 'true';
      const slackEvents = JSON.parse(localStorage.getItem('slackEvents') || '{"newLink":true}');
      const slackChannel = localStorage.getItem('slackChannel') || '#general';
      
      if (slackConnected && slackEvents.newLink) {
        toast({
          title: "Link saved and Slack notified",
          description: `Notified ${slackChannel}`,
        });
      }
    }
  };

  const handleUpdateLink = async (updatedLink: Link) => {
    const success = await linkDatabase.update(updatedLink);
    if (success) {
      setLinks(prev => prev.map(link =>
        link.id === updatedLink.id ? updatedLink : link
      ));
      setSelectedLink(updatedLink);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    const success = await linkDatabase.delete(linkId);
    if (success) {
      setLinks(prev => prev.filter(link => link.id !== linkId));
      setIsDetailOpen(false);
      setSelectedLink(null);
      setSelectedLinkIds(prev => prev.filter(id => id !== linkId));
    }
  };

  const handleLinkClick = (link: Link) => {
    setSelectedLink(link);
    setIsDetailOpen(true);
  };

  const handleTagSelect = (tag: string | null, event?: React.MouseEvent) => {
    if (tag === null) {
      setSelectedTags([]);
    } else {
      // Check for modifier keys for multi-selection
      const isMultiSelect = event && (event.shiftKey || event.metaKey || event.ctrlKey);
      
      if (isMultiSelect) {
        // Multi-selection: toggle the tag
        setSelectedTags(prev =>
          prev.includes(tag)
            ? prev.filter(t => t !== tag)
            : [...prev, tag]
        );
      } else {
        // Single selection: replace current selection
        if (selectedTags.length === 1 && selectedTags[0] === tag) {
          setSelectedTags([]);
        } else {
          setSelectedTags([tag]);
        }
      }
    }
  };

  const handleLinkSelection = (linkId: string, selected: boolean) => {
    setSelectedLinkIds(prev =>
      selected
        ? [...prev, linkId]
        : prev.filter(id => id !== linkId)
    );
  };

  const handleBulkTag = async (tagsToAdd: string[]) => {
    const updatedLinks = await Promise.all(
      selectedLinkIds.map(async (linkId) => {
        const link = links.find(l => l.id === linkId);
        if (link) {
          const newTags = [...new Set([...link.tags, ...tagsToAdd])];
          const updatedLink = { ...link, tags: newTags };
          await linkDatabase.update(updatedLink);
          return updatedLink;
        }
        return link;
      })
    );

    setLinks(prev => prev.map(link => {
      const updated = updatedLinks.find(u => u?.id === link.id);
      return updated || link;
    }));
  };

  const handleBulkShorten = () => {
    // The bulk shortening is handled by the toolbar component
    // This callback is used to trigger any UI updates if needed
    loadLinks();
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredLinks.map(link => link.id);
    setSelectedLinkIds(allFilteredIds);
  };

  const handleClearSelection = () => {
    setSelectedLinkIds([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  // Calculate allTags and tagCounts - moved before the settings page render
  const allTags = [...new Set(links.flatMap(link => link.tags))];
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = links.filter(link => link.tags.includes(tag)).length;
    return acc;
  }, {} as Record<string, number>);

  if (showSettings) {
    return (
      <SettingsPage 
        onBack={() => setShowSettings(false)}
        allTags={allTags}
        linkCounts={tagCounts}
        totalLinks={links.length}
      />
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <TagSidebar
          allTags={allTags}
          selectedTags={selectedTags}
          onTagSelect={handleTagSelect}
          linkCounts={tagCounts}
          totalLinks={links.length}
          onSettingsClick={() => setShowSettings(true)}
        />
        
        <SidebarInset>
          <div className="w-full bg-white min-h-screen">
            {/* Header */}
            <div className="mb-8 p-6 pb-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Links</h1>
                    <p className="text-gray-700">Save and organize your favorite links</p>
                  </div>
                </div>
                
                {links.length > 0 && (
                  <div className="flex items-center gap-4">
                    {filteredLinks.length > 0 && selectedLinkIds.length === 0 && (
                      <button
                        onClick={handleSelectAll}
                        className="text-sm text-purple-600 hover:text-purple-700 transition-colors duration-200"
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
            <div className="mb-6 px-6">
              <LinkInput onAddLink={handleAddLink} />
            </div>

            {/* Search */}
            {links.length > 0 && (
              <div className="mb-6 px-6">
                <SearchBar 
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
            )}

            {/* Links Display */}
            <div className="px-6">
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
                        onUpdate={handleUpdateLink}
                      />
                    ) : (
                      <LinkListItem
                        key={link.id}
                        link={link}
                        isSelected={isSelected}
                        onSelect={(selected) => handleLinkSelection(link.id, selected)}
                        onClick={() => handleLinkClick(link)}
                        onUpdate={handleUpdateLink}
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
            </div>

            {/* Bulk Action Toolbar */}
            <BulkActionToolbar
              selectedCount={selectedLinkIds.length}
              selectedLinkIds={selectedLinkIds}
              onClearSelection={handleClearSelection}
              onBulkTag={handleBulkTag}
              onBulkShorten={handleBulkShorten}
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
