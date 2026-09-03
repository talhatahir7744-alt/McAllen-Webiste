import { LOCATION } from '@/lib/location';
import { SITE } from './site-config';
import type { Locale } from '@/lib/i18n';

/* Site-wide LocalBusiness schema, rendered by the footer on every route (both locales). The converted
   GoHighLevel pages carry their own per-page schema inside the Nuxt payload; this one is the canonical,
   complete record (geo, e-mail, social profiles, hours) for the McAllen store. */
const SITE_URL = 'https://mcallen.snoozemattresscompany.com';

export function LocalBusinessJsonLd({ locale = 'en' }: { locale?: Locale }) {
  const L = LOCATION;
  const data = {
    '@context': 'https://schema.org',
    '@type': ['FurnitureStore', 'LocalBusiness'],
    '@id': `${SITE_URL}/#store`,
    name: L.name,
    legalName: L.legalName,
    url: locale === 'es' ? `${SITE_URL}/es` : `${SITE_URL}/`,
    image: `${SITE_URL}${SITE.logo}`,
    logo: `${SITE_URL}${SITE.logo}`,
    telephone: L.phoneIntl,
    email: L.email,
    priceRange: '$300+',
    address: {
      '@type': 'PostalAddress',
      streetAddress: L.street,
      addressLocality: L.city,
      addressRegion: L.region,
      postalCode: L.postalCode,
      addressCountry: L.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: L.geo.latitude, longitude: L.geo.longitude },
    hasMap: L.mapLink,
    sameAs: [L.social.facebook, L.social.instagram, L.social.youtube],
    openingHoursSpecification: L.openingHours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days.map((d) => `https://schema.org/${d}`),
      opens: h.opens,
      closes: h.closes,
    })),
    areaServed: { '@type': 'City', name: `${L.city}, Texas` },
  };
  return (
    <script
      type="application/ld+json"
      // JSON inside a script element: escape "<" so no markup can terminate the block
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
