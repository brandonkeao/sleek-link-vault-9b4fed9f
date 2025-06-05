
import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const RedirectHandler: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [loading, setLoading] = useState(true);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shortCode) {
      setError('Invalid short code');
      setLoading(false);
      return;
    }

    const resolveUrl = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('resolve-short-url', {
          body: { shortCode }
        });

        if (error) throw error;

        if (data.success) {
          setOriginalUrl(data.originalUrl);
          // Redirect to the original URL
          window.location.href = data.originalUrl;
        } else {
          setError(data.error || 'Short URL not found');
        }
      } catch (error) {
        console.error('Error resolving short URL:', error);
        setError('Failed to resolve short URL');
      }

      setLoading(false);
    };

    resolveUrl();
  }, [shortCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <p className="mt-2 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (error || !originalUrl) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">
          If you are not redirected automatically, 
          <a 
            href={originalUrl} 
            className="text-indigo-600 hover:text-indigo-500 ml-1"
          >
            click here
          </a>
        </p>
      </div>
    </div>
  );
};

export default RedirectHandler;
