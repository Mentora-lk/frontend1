/**
 * Community materials are served straight from Cloudinary, which is a different
 * origin — so the HTML `download` attribute is ignored and a plain link just
 * opens the file in a new tab. Cloudinary's `fl_attachment` delivery flag is
 * the only way to force a real save: it makes the CDN respond with
 * `Content-Disposition: attachment`.
 *
 * `fl_attachment:<name>` also sets the saved filename — without it Cloudinary
 * names every download "file.<ext>".
 */

/** Cloudinary only accepts a restricted character set for the attachment name. */
const sanitizeFileName = (name: string) =>
  name
    .replace(/\.[^/.]+$/, "") // drop the extension; Cloudinary re-adds the real one
    .replace(/[^a-zA-Z0-9-_]+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 80);

/**
 * Rewrites a Cloudinary delivery URL so the browser saves the file instead of
 * displaying it. Non-Cloudinary URLs (and anything unparseable) are returned
 * untouched, so callers can use this unconditionally.
 *
 * @param url       the stored `secure_url` (e.g. post.media_url)
 * @param fileName  optional preferred name for the saved file
 */
export function toDownloadUrl(url: string, fileName?: string): string {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  // Already carries the flag — don't stack a second one.
  if (/\/upload\/[^/]*fl_attachment/.test(url)) return url;

  const rawName = fileName ?? decodeURIComponent(url.split("/").pop() ?? "");
  const safeName = sanitizeFileName(rawName);
  const flag = safeName ? `fl_attachment:${safeName}` : "fl_attachment";

  return url.replace("/upload/", `/upload/${flag}/`);
}
