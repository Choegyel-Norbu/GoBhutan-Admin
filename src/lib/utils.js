import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { API_CONFIG } from "./api"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Constructs the full URL for a hotel image from the API response
 * @param {string} imagePath - The image path from the API 
 *   (e.g., "/opt/uploads/hotels/1/556dc0bb-dfe2-4058-93b6-da7ec6acbc40.webp")
 *   Server location: /opt/uploads/hotels/{hotelId}/{filename}
 *   Nginx serves /opt/uploads/ at /uploads/ URL path
 * @returns {string} - The full URL to the image
 */
export function getHotelImageUrl(imagePath) {
  if (!imagePath) return null;

  // If the path already starts with http, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Get the base domain (without /boot path)
  const baseUrl = API_CONFIG.BASE_URL.replace('/boot', '');

  // Handle server paths like "/opt/uploads/hotels/..." 
  // Extract the path after "opt/uploads" to get "hotels/1/filename.webp"
  let relativePath = imagePath;

  // Remove leading slash if present
  if (relativePath.startsWith('/')) {
    relativePath = relativePath.slice(1);
  }

  // Remove "opt/uploads/" prefix to get just "hotels/1/filename.webp"
  if (relativePath.startsWith('opt/uploads/')) {
    relativePath = relativePath.replace('opt/uploads/', '');
  }

  // Handle paths that already start with "uploads/" (avoid double prefix)
  if (relativePath.startsWith('uploads/')) {
    relativePath = relativePath.replace('uploads/', '');
  }

  // Construct URL: https://gobhutan.site/uploads/hotels/1/filename.webp
  // Nginx should be configured to serve /opt/uploads/ at /uploads/
  return `${baseUrl}/uploads/${relativePath}`;
}

/**
 * Gets the primary image from a hotel's images array, or the first image if no primary is set
 * @param {Array} images - Array of image objects from the API
 * @returns {string|null} - The full URL to the image, or null if no images
 */
export function getHotelPrimaryImage(images) {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return null;
  }

  // Find primary image first
  const primaryImage = images.find(img => img.isPrimary === true);
  if (primaryImage && primaryImage.url) {
    return getHotelImageUrl(primaryImage.url);
  }

  // Fallback to first image
  if (images[0] && images[0].url) {
    return getHotelImageUrl(images[0].url);
  }

  return null;
}

/**
 * Constructs the full URL for a room image from the API response
 * @param {string} imagePath - The image path from the API 
 *   (e.g., "/opt/uploads/rooms/3/651b5e86-ed4e-4be4-92b3-66f147cc1af4.png" or "uploads/rooms/3/...")
 *   Note: Room images are stored under hotels directory on the server
 *   Server location: /opt/uploads/hotels/{hotelId}/{filename}
 *   Nginx serves /opt/uploads/ at /uploads/ URL path
 * @returns {string} - The full URL to the image (always points to /hotels/ path)
 */
export function getRoomImageUrl(imagePath) {
  if (!imagePath) return null;

  // If the path already starts with http, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Get the base domain (without /boot path)
  const baseUrl = API_CONFIG.BASE_URL.replace('/boot', '');

  // Handle server paths like "/opt/uploads/rooms/..." or "uploads/rooms/..."
  let relativePath = imagePath;

  // Remove leading slash if present
  if (relativePath.startsWith('/')) {
    relativePath = relativePath.slice(1);
  }

  // Remove "opt/uploads/" prefix if present
  if (relativePath.startsWith('opt/uploads/')) {
    relativePath = relativePath.replace('opt/uploads/', '');
  }

  // Remove "uploads/" prefix if present (to avoid double prefix)
  // This handles cases where API returns "uploads/rooms/..." instead of "opt/uploads/rooms/..."
  if (relativePath.startsWith('uploads/')) {
    relativePath = relativePath.replace('uploads/', '');
  }

  // Convert rooms/ to hotels/ since room images are stored under hotels directory
  // This ensures all room images point to /hotels/ path instead of /rooms/
  if (relativePath.startsWith('rooms/')) {
    relativePath = relativePath.replace('rooms/', 'hotels/');
  }

  // Construct URL: https://gobhutan.site/uploads/hotels/3/filename.webp
  // All room images will point to /hotels/ path as required
  // Nginx should be configured to serve /opt/uploads/ at /uploads/
  return `${baseUrl}/uploads/${relativePath}`;
}

/**
 * Gets the primary image from a room's images array, or the first image if no primary is set
 * @param {Array} images - Array of image objects from the API
 * @returns {string|null} - The full URL to the image, or null if no images
 */
export function getRoomPrimaryImage(images) {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return null;
  }

  // Find primary image first
  const primaryImage = images.find(img => img.isPrimary === true);
  if (primaryImage && primaryImage.url) {
    return getRoomImageUrl(primaryImage.url);
  }

  // Fallback to first image
  if (images[0] && images[0].url) {
    return getRoomImageUrl(images[0].url);
  }

  return null;
}

/**
 * Full URL for a screening poster (same /uploads/ nginx path as hotel images).
 * @param {string} imagePath
 * @returns {string|null}
 */
export function getScreeningImageUrl(imagePath) {
  return getHotelImageUrl(imagePath);
}

/**
 * Extract a storage path or URL from a poster image API item.
 * @param {string|object} item
 * @returns {string|null}
 */
function getPosterPathFromItem(item) {
  if (!item) return null;
  if (typeof item === 'string') return item.trim() || null;
  if (typeof item !== 'object') return null;
  const path =
    item.url ??
    item.filePath ??
    item.path ??
    item.imagePath ??
    item.imageUrl ??
    item.fileName ??
    item.posterUrl ??
    null;
  return path && String(path).trim() ? String(path).trim() : null;
}

/**
 * Normalize poster images from a screening API record (supports several field shapes).
 * @param {object} screening
 * @returns {Array<{ id?: number|string, url: string, isPrimary?: boolean, title?: string }>}
 */
export function getScreeningPosterImages(screening) {
  if (!screening || typeof screening !== 'object') return [];

  // Backend hall/list/detail DTO uses singular posterImage (object, string, or null)
  if (screening.posterImage != null && screening.posterImage !== '') {
    if (typeof screening.posterImage === 'object') {
      const url = getPosterPathFromItem(screening.posterImage);
      if (url) {
        return [{
          ...screening.posterImage,
          id: screening.posterImage.id ?? 'poster-0',
          url,
        }];
      }
    }
    if (typeof screening.posterImage === 'string') {
      const url = getPosterPathFromItem(screening.posterImage);
      if (url) return [{ id: 'poster-0', url }];
    }
  }

  const candidates = [
    screening.posterImages,
    screening.posterImageList,
    screening.posterImageEntities,
    screening.screeningImages,
    screening.images,
    screening.posters,
  ];

  let raw = candidates.find((c) => c != null && c !== '');
  if (raw == null) {
    const singular =
      screening.posterImageUrl ??
      screening.posterUrl ??
      screening.imageUrl ??
      screening.posterPath;
    if (singular) raw = [singular];
  }

  if (typeof raw === 'string') {
    const path = getPosterPathFromItem(raw);
    return path ? [{ id: 'poster-0', url: path }] : [];
  }

  if (!Array.isArray(raw)) return [];

  return raw
    .map((item, index) => {
      const url = getPosterPathFromItem(item);
      if (!url) return null;
      if (typeof item === 'object' && item !== null) {
        return {
          id: item.id ?? `poster-${index}`,
          url,
          isPrimary: item.isPrimary,
          title: item.title ?? item.name,
        };
      }
      return { id: `poster-${index}`, url };
    })
    .filter(Boolean);
}
