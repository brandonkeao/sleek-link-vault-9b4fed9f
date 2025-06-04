
import { supabase } from '../integrations/supabase/client';
import { UserSettings } from '../types/Database';

export const settingsDatabase = {
  async getSettings(): Promise<UserSettings | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching settings:', error);
      return null;
    }

    if (!data) {
      // Create default settings
      const { data: newData, error: insertError } = await supabase
        .from('user_settings')
        .insert([{
          user_id: user.id,
          auto_shorten_enabled: false
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating settings:', insertError);
        return null;
      }

      return {
        id: newData.id,
        userId: newData.user_id,
        rebrandlyApiKey: newData.rebrandly_api_key,
        autoShortenEnabled: newData.auto_shorten_enabled,
        customDomain: newData.custom_domain,
        createdAt: new Date(newData.created_at),
        updatedAt: new Date(newData.updated_at)
      };
    }

    return {
      id: data.id,
      userId: data.user_id,
      rebrandlyApiKey: data.rebrandly_api_key,
      autoShortenEnabled: data.auto_shorten_enabled,
      customDomain: data.custom_domain,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async updateSettings(settings: Partial<UserSettings>): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('user_settings')
      .update({
        rebrandly_api_key: settings.rebrandlyApiKey,
        auto_shorten_enabled: settings.autoShortenEnabled,
        custom_domain: settings.customDomain,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating settings:', error);
      return false;
    }

    return true;
  }
};
