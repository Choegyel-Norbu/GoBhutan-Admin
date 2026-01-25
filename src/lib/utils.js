import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { API_CONFIG } from "./api"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Constructs the full URL for a hotel image from the API response
 * @param {string} imagePath - The relative image path from the API (e.g., "uploads/hotels/52/image.webp")
 * @returns {string} - The full URL to the image
 */
export function getHotelImageUrl(imagePath) {
  if (!imagePath) return null;
  
  // If the path already starts with http, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Construct full URL by combining base URL with image path
  // Remove leading slash from imagePath if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `${API_CONFIG.BASE_URL}/${cleanPath}`;
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
 * @param {string} imagePath - The relative image path from the API (e.g., "uploads/rooms/52/image.webp")
 * @returns {string} - The full URL to the image
 */
export function getRoomImageUrl(imagePath) {
  if (!imagePath) return null;
  
  // If the path already starts with http, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Construct full URL by combining base URL with image path
  // Remove leading slash from imagePath if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `${API_CONFIG.BASE_URL}/${cleanPath}`;
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
