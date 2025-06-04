
import { Link } from '../types/Link';

const STORAGE_KEY = 'linkManager_links';

export const linkStorage = {
  save: (links: Link[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  },

  getAll: (): Link[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    try {
      const links = JSON.parse(data);
      return links.map((link: any) => ({
        ...link,
        createdAt: new Date(link.createdAt)
      }));
    } catch {
      return [];
    }
  }
};
