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

export function generateSlug(title: string, id: string): string {
  if (!title) return id;
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return `${slug}--${id}`;
}

export function extractIdFromSlug(slugOrId: string): string {
  if (!slugOrId) return '';
  const parts = slugOrId.split('--');
  return parts.length > 1 ? parts[parts.length - 1] : slugOrId;
}
