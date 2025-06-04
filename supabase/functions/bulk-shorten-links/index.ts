
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
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { linkIds } = await req.json();

    if (!linkIds || !Array.isArray(linkIds) || linkIds.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Link IDs array is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Get user's API settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('user_settings')
      .select('rebrandly_api_key, custom_domain')
      .eq('user_id', user.id)
      .single();

    if (settingsError || !settings?.rebrandly_api_key) {
      throw new Error('Rebrandly API key not configured');
    }

    // Get links that need shortening (not already shortened)
    const { data: links, error: linksError } = await supabaseClient
      .from('links')
      .select('id, url, short_url')
      .in('id', linkIds)
      .eq('user_id', user.id)
      .is('short_url', null);

    if (linksError) {
      throw new Error('Failed to fetch links');
    }

    if (links.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No links need shortening (already shortened or not found)',
          processed: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Update all links to pending status
    await supabaseClient
      .from('links')
      .update({ shortening_status: 'pending' })
      .in('id', links.map(l => l.id))
      .eq('user_id', user.id);

    // Process links with rate limiting (1 request per second to respect API limits)
    let successCount = 0;
    let errorCount = 0;

    for (const link of links) {
      try {
        const rebrandlyRequest = {
          destination: link.url,
          ...(settings.custom_domain && { domain: { fullName: settings.custom_domain } })
        };

        // Log the request
        await supabaseClient
          .from('api_logs')
          .insert([{
            user_id: user.id,
            request_type: 'bulk_shorten_link',
            request_data: { linkId: link.id, ...rebrandlyRequest }
          }]);

        const response = await fetch('https://api.rebrandly.com/v1/links', {
          method: 'POST',
          headers: {
            'apikey': settings.rebrandly_api_key,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(rebrandlyRequest)
        });

        const responseData = await response.json();

        // Log the response
        await supabaseClient
          .from('api_logs')
          .insert([{
            user_id: user.id,
            request_type: 'bulk_shorten_link_response',
            request_data: { linkId: link.id, ...rebrandlyRequest },
            response_data: responseData,
            status_code: response.status,
            error_message: response.ok ? null : `HTTP ${response.status}`
          }]);

        if (response.ok) {
          // Update link with shortened URL
          await supabaseClient
            .from('links')
            .update({
              short_url: responseData.shortUrl,
              rebrandly_id: responseData.id,
              shortening_status: 'shortened'
            })
            .eq('id', link.id)
            .eq('user_id', user.id);

          successCount++;
        } else {
          // Update link status to error
          await supabaseClient
            .from('links')
            .update({ shortening_status: 'error' })
            .eq('id', link.id)
            .eq('user_id', user.id);

          errorCount++;
        }

        // Rate limiting: wait 1 second between requests
        if (links.indexOf(link) < links.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error shortening link ${link.id}:`, error);
        
        await supabaseClient
          .from('links')
          .update({ shortening_status: 'error' })
          .eq('id', link.id)
          .eq('user_id', user.id);

        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: links.length,
        successful: successCount,
        errors: errorCount,
        message: `Processed ${links.length} links: ${successCount} successful, ${errorCount} errors`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in bulk shortening:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to process bulk shortening',
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})
