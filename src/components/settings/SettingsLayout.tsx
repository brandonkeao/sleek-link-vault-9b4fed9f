
import React from 'react';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '../ui/sidebar';
import { TagSidebar } from '../TagSidebar';

interface SettingsLayoutProps {
  children: React.ReactNode;
  onBack?: () => void;
  allTags?: string[];
  linkCounts?: Record<string, number>;
  totalLinks?: number;
  onNavigateToFilteredLinks?: (tag: string | null) => void;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  children,
  onBack,
  allTags = [],
  linkCounts = {},
  totalLinks = 0,
  onNavigateToFilteredLinks
}) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <TagSidebar
          allTags={allTags}
          selectedTags={[]}
          onTagSelect={() => {}}
          linkCounts={linkCounts}
          totalLinks={totalLinks}
          onSettingsClick={() => {}}
          onNavigateToLinks={onNavigateToFilteredLinks}
        />
        
        <SidebarInset>
          <div className="w-full px-4 py-8 bg-white min-h-screen">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-700">Manage your integrations and view API logs</p>
                  </div>
                </div>
                
                {onBack && (
                  <Button
                    onClick={onBack}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft size={16} />
                    Back to Links
                  </Button>
                )}
              </div>
            </div>

            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
