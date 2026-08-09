/**
 * Utility to sanitize and format venue & stage strings across the application.
 * Removes unwanted block/room details (e.g. Ezhuthachan Block, Academic Block, Art Gallery, Literary Hall)
 * and formats clean, accurate stage and auditorium location labels.
 */
export function cleanVenueName(venue?: string | null, stage?: string | null): string {
  let v = (venue || '').trim();
  let s = (stage || '').trim();

  // Strip erroneous venue text
  v = v
    .replace(/Ezhuthachan\s*Block/gi, '')
    .replace(/Academic\s*Block/gi, '')
    .replace(/Academic\s*Library\s*Hall/gi, '')
    .replace(/Art\s*Gallery/gi, '')
    .replace(/Literary\s*Hall/gi, '')
    .replace(/\(\s*\)/g, '')
    .trim();

  s = s
    .replace(/Ezhuthachan\s*Block/gi, '')
    .replace(/Academic\s*Block/gi, '')
    .replace(/Academic\s*Library\s*Hall/gi, '')
    .replace(/Art\s*Gallery/gi, '')
    .replace(/Literary\s*Hall/gi, '')
    .replace(/\(\s*\)/g, '')
    .trim();

  // Remove leading/trailing hyphens or colons left over
  v = v.replace(/^[-:\s]+|[-:\s]+$/g, '');
  s = s.replace(/^[-:\s]+|[-:\s]+$/g, '');

  if (s && v && s.toLowerCase() !== v.toLowerCase()) {
    // If both stage and venue exist and aren't identical
    if (s.toLowerCase().includes(v.toLowerCase())) return s;
    if (v.toLowerCase().includes(s.toLowerCase())) return v;
    return `${s} - ${v}`;
  }

  return s || v || 'Main Auditorium';
}
