const BASE_URL = 'https://openlibrary.org';
const COVER_URL = 'https://covers.openlibrary.org/b/id';


export async function searchBooks({ query, type = 'q', limit = 20 }) {
  const params = new URLSearchParams({
    [type]: query,
    limit,
    fields: 'key,title,author_name,first_publish_year,cover_i,subject,ia,ebook_access',
  });

  const response = await fetch(`${BASE_URL}/search.json?${params}`);
  if (!response.ok) {
    throw new Error(`Open Library returned ${response.status}. Please try again.`);
  }

  const data = await response.json();
  return data.docs.map(normaliseBook);
}

function normaliseBook(doc) {
  return {
    id:        doc.key,                          
    title:     doc.title || 'Unknown title',
    authors:   doc.author_name || [],
    year:      doc.first_publish_year || null,
    coverId:   doc.cover_i || null,
    subjects:  (doc.subject || []).slice(0, 5),
    hasEbook:  doc.ebook_access === 'borrowable' || doc.ebook_access === 'public',
  };
}


export function getCoverUrl(coverId, size = 'M') {
  if (!coverId) return null;
  return `${COVER_URL}/${coverId}-${size}.jpg`;
}
