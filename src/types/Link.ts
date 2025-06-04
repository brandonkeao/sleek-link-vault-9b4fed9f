
export interface Link {
  id: string;
  url: string;
  title: string;
  tags: string[];
  createdAt: Date;
  favicon?: string;
  shortUrl?: string;
  rebrandlyId?: string;
  shorteningStatus?: 'pending' | 'shortened' | 'error';
  userId?: string;
}
