
export const fetchLinkMetadata = async (url: string): Promise<{ title: string; favicon?: string }> => {
  try {
    // For a real implementation, you'd need a CORS proxy or backend service
    // For now, we'll extract the domain and create a basic title
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    
    // Try to get a decent title from the URL
    let title = domain;
    if (urlObj.pathname !== '/') {
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        title = pathParts[pathParts.length - 1]
          .replace(/[-_]/g, ' ')
          .replace(/\.(html|php|aspx?)$/i, '')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }

    return {
      title: title || domain,
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    };
  } catch {
    return {
      title: url,
      favicon: undefined
    };
  }
};
