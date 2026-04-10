/* ═══════════════════════════════════════════════════════════════════════════
   Sanity CMS Client — Fetches blog posts and career listings
   ═══════════════════════════════════════════════════════════════════════════ */

// TODO: Replace with your actual Sanity project ID after running:
//   cd sikani-studio && npx sanity login && npx sanity init
const SANITY_PROJECT_ID = 'YOUR_PROJECT_ID';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2024-01-01';
const SANITY_CDN = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`;

/**
 * Execute a GROQ query against the Sanity CDN.
 * Returns the `result` array or throws on error.
 */
async function sanityFetch(query, params = {}) {
  const url = new URL(SANITY_CDN);
  url.searchParams.set('query', query);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(`$${key}`, JSON.stringify(value));
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Sanity fetch failed: ${res.status}`);
  const data = await res.json();
  return data.result;
}

/**
 * Build a Sanity image URL from an image reference.
 * Format: https://cdn.sanity.io/images/{projectId}/{dataset}/{assetRef}
 */
function sanityImageUrl(imageRef, width = 800) {
  if (!imageRef?.asset?._ref) return null;
  // _ref format: image-{id}-{dimensions}-{format}
  const ref = imageRef.asset._ref;
  const [, id, dims, format] = ref.split('-');
  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dims}.${format}?w=${width}&auto=format`;
}

/**
 * Format a date string for display.
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ── GROQ Queries ─────────────────────────────────────────────────────────

const BLOG_QUERY = `*[_type == "blogPost"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  "category": category->{ name, color },
  coverImage,
  publishedAt,
  featured
}`;

const CAREERS_QUERY = `*[_type == "career" && isActive == true && applicationDeadline >= now()] | order(applicationDeadline asc) {
  _id,
  title,
  department,
  location,
  type,
  requirements,
  applicationDeadline,
  applicationEmail
}`;

// ── Expose globally ──────────────────────────────────────────────────────
window.SanityCMS = {
  fetch: sanityFetch,
  imageUrl: sanityImageUrl,
  formatDate,
  queries: { BLOG_QUERY, CAREERS_QUERY },
  projectId: SANITY_PROJECT_ID,
};
