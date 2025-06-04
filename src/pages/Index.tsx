
import React, { useState, useEffect } from 'react';
import { LinkInput } from '../components/LinkInput';
import { SearchBar } from '../components/SearchBar';
import { TagFilter } from '../components/TagFilter';
import { LinkCard } from '../components/LinkCard';
import { LinkDetail } from '../components/LinkDetail';
import { EmptyState } from '../components/EmptyState';
import { linkStorage } from '../utils/linkStorage';
import { Link } from '../types/Link';

const Index = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Load links from localStorage on mount
  useEffect(() => {
    const savedLinks = linkStorage.getAll();
    setLinks(savedLinks);
    setFilteredLinks(savedLinks);
  }, []);

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
  };

  const handleLinkClick = (link: Link) => {
    setSelectedLink(link);
    setIsDetailOpen(true);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const allTags = [...new Set(links.flatMap(link => link.tags))];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Links</h1>
          <p className="text-gray-600">Save and organize your favorite links</p>
        </div>

        {/* Add Link Input */}
        <div className="mb-6">
          <LinkInput onAddLink={handleAddLink} />
        </div>

        {/* Search and Filters */}
        {links.length > 0 && (
          <div className="mb-6 space-y-4">
            <SearchBar 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            {allTags.length > 0 && (
              <TagFilter
                tags={allTags}
                selectedTags={selectedTags}
                onTagToggle={handleTagToggle}
              />
            )}
          </div>
        )}

        {/* Links Grid */}
        {filteredLinks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLinks.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onClick={() => handleLinkClick(link)}
              />
            ))}
          </div>
        ) : links.length > 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No links match your search</p>
          </div>
        ) : (
          <EmptyState />
        )}

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
    </div>
  );
};

export default Index;
