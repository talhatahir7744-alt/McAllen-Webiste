/* The store. Used by the footer (address, map, social links) and the site-wide LocalBusiness JSON-LD.
   scripts/relocate.mjs carries the same values for the generated GoHighLevel pages: change both together.
   Business name and NAP as the client wrote them for the SEO audit (October 2026): "Snooze Mattress + Wellness",
   7913 N 10th St, Suite 130, McAllen, TX 78504 · (956) 586-5646 · Mon–Sat 10 AM–7 PM, Sun 12–6 PM
   (scripts/brand-nap.mjs applies the same wording to the generated pages). No legal entity name is asserted anywhere:
   the registered name is NEEDS CLIENT INPUT. */
export const LOCATION = {
  name: 'Snooze Mattress + Wellness',
  legalName: 'Snooze Mattress + Wellness', // confirmed by the client (October 22, 2026): the legal name is the display name
  street: '7913 N 10th St, Suite 130',
  city: 'McAllen',
  region: 'TX',
  postalCode: '78504',
  country: 'US',
  phone: '(956) 586-5646',
  phoneHref: 'tel:+19565865646',
  phoneIntl: '+1 956-586-5646',
  email: 'northmcallen@snoozemattresscompany.com',
  /* coordinates of the storefront (10th & Auburn); taken from the store's Google Maps link */
  geo: { latitude: 26.2746879, longitude: -98.2189774 },
  social: {
    facebook: 'https://www.facebook.com/p/Snooze-Mattress-Wellness-61575812121380/',
    instagram: 'https://www.instagram.com/snoozemcallen',
    youtube: 'https://www.youtube.com/@SnoozeMcAllen',
  },
  /* Google Maps: the query is the business name + the exact NAP, so the map and the directions link resolve to the
     store's own listing (SEO audit, October 2026 — section 6b; scripts/brand-nap.mjs writes the same URLs into the
     generated pages' location cards). */
  /* The store's Google Business Profile listing (Place ID supplied by the client, October 21, 2026): the top bar's
     address link and the footer's "Get Directions" / "Open Maps" links open it, the LocalBusiness schema lists it in
     sameAs and hasMap. The footer map embed keeps its business-name query. */
  placeId: 'ChIJBYBxOXChZYYR48f71GAS7YY',
  gbpUrl: 'https://www.google.com/maps/place/?q=place_id:ChIJBYBxOXChZYYR48f71GAS7YY',
  mapLink: 'https://www.google.com/maps/place/?q=place_id:ChIJBYBxOXChZYYR48f71GAS7YY',
  mapEmbed: 'https://www.google.com/maps?q=Snooze+Mattress+%2B+Wellness%2C+7913+N+10th+St%2C+Suite+130%2C+McAllen%2C+TX+78504&output=embed',
  /* LocalBusiness schema (components/LocalBusinessJsonLd.tsx, SEO audit section 5a) */
  storefrontImage: '/assets/filesafe/ARD47WoZpqaZSQ9MSxLD/media/684480ff2c95c570cfc22e24.jpeg.webp', // the storefront photo of the location card
  priceRange: '$$',
  areaServed: ['McAllen', 'Edinburg', 'Mission', 'Pharr'],
  hours: {
    en: ['Mon–Sat 10 AM–7 PM', 'Sun 12–6 PM'],
    es: ['Lun–Sáb 10 AM–7 PM', 'Dom 12–6 PM'],
  },
  openingHours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '10:00', closes: '19:00' },
    { days: ['Sunday'], opens: '12:00', closes: '18:00' },
  ],
} as const;
