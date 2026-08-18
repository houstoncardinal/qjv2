/**
 * Renders schema.org structured data. Rendered in the document body so it can
 * use client-loaded data (products, breadcrumbs) — crawlers read JSON-LD
 * anywhere in the document.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
