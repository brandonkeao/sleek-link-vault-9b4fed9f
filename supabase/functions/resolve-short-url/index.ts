
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { shortCode } = await req.json();

    if (!shortCode) {
      return new Response(
        JSON.stringify({ success: false, error: 'Short code is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Try to find the link by matching the short URL or extract from short URL
    const { data: links, error } = await supabaseClient
      .from('links')
      .select('url, short_url')
      .or(`short_url.ilike.%${shortCode}%,short_url.ilike.%${shortCode}`);

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'Database error' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // Find the best matching link
    const matchingLink = links?.find(link => 
      link.short_url && (
        link.short_url.includes(shortCode) ||
        link.short_url.endsWith(shortCode)
      )
    );

    if (matchingLink) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          originalUrl: matchingLink.url,
          shortUrl: matchingLink.short_url
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Short URL not found' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      );
    }
  } catch (error) {
    console.error('Error resolving short URL:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to resolve short URL',
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})
