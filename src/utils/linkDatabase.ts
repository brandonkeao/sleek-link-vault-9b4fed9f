
import { supabase } from '../integrations/supabase/client';
import { Link } from '../types/Link';

export const linkDatabase = {
  async getAll(): Promise<Link[]> {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching links:', error);
      return [];
    }

    return data.map(link => ({
      id: link.id,
      url: link.url,
      title: link.title,
      tags: link.tags || [],
      createdAt: new Date(link.created_at),
      favicon: link.favicon,
      shortUrl: link.short_url,
      rebrandlyId: link.rebrandly_id,
      shorteningStatus: link.shortening_status,
      userId: link.user_id
    }));
  },

  async save(link: Omit<Link, 'id' | 'createdAt'>): Promise<Link | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('links')
      .insert([{
        url: link.url,
        title: link.title,
        tags: link.tags,
        favicon: link.favicon,
        short_url: link.shortUrl,
        rebrandly_id: link.rebrandlyId,
        shortening_status: link.shorteningStatus,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving link:', error);
      return null;
    }

    return {
      id: data.id,
      url: data.url,
      title: data.title,
      tags: data.tags || [],
      createdAt: new Date(data.created_at),
      favicon: data.favicon,
      shortUrl: data.short_url,
      rebrandlyId: data.rebrandly_id,
      shorteningStatus: data.shortening_status,
      userId: data.user_id
    };
  },

  async update(link: Link): Promise<boolean> {
    const { error } = await supabase
      .from('links')
      .update({
        url: link.url,
        title: link.title,
        tags: link.tags,
        favicon: link.favicon,
        short_url: link.shortUrl,
        rebrandly_id: link.rebrandlyId,
        shortening_status: link.shorteningStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', link.id);

    if (error) {
      console.error('Error updating link:', error);
      return false;
    }

    return true;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting link:', error);
      return false;
    }

    return true;
  }
};
