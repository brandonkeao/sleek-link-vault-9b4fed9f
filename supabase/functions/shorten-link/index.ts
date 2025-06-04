
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

    const { linkId, url } = await req.json();

    if (!linkId || !url) {
      return new Response(
        JSON.stringify({ success: false, error: 'Link ID and URL are required' }),
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

    // Update link status to pending
    await supabaseClient
      .from('links')
      .update({ shortening_status: 'pending' })
      .eq('id', linkId)
      .eq('user_id', user.id);

    // Prepare Rebrandly request
    const rebrandlyRequest = {
      destination: url,
      ...(settings.custom_domain && { domain: { fullName: settings.custom_domain } })
    };

    // Log the request
    await supabaseClient
      .from('api_logs')
      .insert([{
        user_id: user.id,
        request_type: 'shorten_link',
        request_data: rebrandlyRequest
      }]);

    // Make request to Rebrandly API
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
        request_type: 'shorten_link_response',
        request_data: rebrandlyRequest,
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
        .eq('id', linkId)
        .eq('user_id', user.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          shortUrl: responseData.shortUrl,
          rebrandlyId: responseData.id
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } else {
      // Update link status to error
      await supabaseClient
        .from('links')
        .update({ shortening_status: 'error' })
        .eq('id', linkId)
        .eq('user_id', user.id);

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Rebrandly API error: ${response.status}`,
          details: responseData
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
  } catch (error) {
    console.error('Error shortening link:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to shorten link',
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})
