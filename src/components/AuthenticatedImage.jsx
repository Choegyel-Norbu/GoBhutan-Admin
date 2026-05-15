import { useState, useEffect, useRef } from 'react';
import authAPI from '@/lib/authAPI';
import { API_CONFIG } from '@/lib/api';

/**
 * AuthenticatedImage component that fetches images with authentication headers
 * Use this component when images require authentication (401 errors)
 */
const AuthenticatedImage = ({ src, alt, className, onError, ...props }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const blobUrlRef = useRef(null);

  useEffect(() => {
    if (!src) {
      setLoading(false);
      return;
    }

    // If it's already a full URL starting with http, check if it needs auth
    const fullUrl = src.startsWith('http') 
      ? src 
      : `${API_CONFIG.BASE_URL}/${src.startsWith('/') ? src.slice(1) : src}`;

    // Get auth token
    const token = authAPI.getStoredToken();

    // Fetch image with authentication
    const fetchImage = async () => {
      try {
        setLoading(true);
        setError(false);

        const headers = {
          'ngrok-skip-browser-warning': 'true',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(fullUrl, {
          method: 'GET',
          headers,
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to load image: ${response.status}`);
        }

        const blob = await response.blob();
        
        // Clean up previous blob URL to prevent memory leaks
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
        }

        // Create blob URL
        const blobUrl = URL.createObjectURL(blob);
        blobUrlRef.current = blobUrl;
        setImageUrl(blobUrl);
      } catch (err) {
        console.error('Error loading authenticated image:', err);
        setError(true);
        if (onError) {
          onError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    // Cleanup blob URL on unmount
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, [src, onError]);

  if (error || !imageUrl) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className || ''}`}>
        {loading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        ) : (
          <div className="text-muted-foreground text-sm">Image unavailable</div>
        )}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={(e) => {
        setError(true);
        if (onError) {
          onError(e);
        }
      }}
      {...props}
    />
  );
};

export default AuthenticatedImage;

