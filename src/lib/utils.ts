export function parseImageUrl(url: string): string {
  if (!url) return '';
  // Google Drive format: https://drive.google.com/file/d/ID/view...
  const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_\-]+)/;
  const match = url.match(driveRegex);
  
  if (match && match[1]) {
    // Generate valid direct image link
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  
  return url;
}
