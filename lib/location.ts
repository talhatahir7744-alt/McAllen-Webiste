/* The store. Used by the footer (address, map, social links) and the site-wide LocalBusiness JSON-LD.
   scripts/relocate.mjs carries the same values for the generated GoHighLevel pages: change both together. */
export const LOCATION = {
  name: 'Snooze Mattress + Wellness — McAllen',
  legalName: 'Snooze Mattress Company',
  street: '7913 North 10th Street, Suite 130',
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
  mapLink: 'https://maps.google.com/?q=7913+North+10th+Street,+Suite+130,+McAllen,+TX+78504',
  mapEmbed: 'https://maps.google.com/maps?q=7913+North+10th+Street,+Suite+130,+McAllen,+TX+78504&z=15&output=embed',
  hours: {
    en: ['Mon – Sat 10 AM – 7 PM', 'Sunday 12 – 6 PM'],
    es: ['Lun – Sáb 10 AM – 7 PM', 'Domingo 12 – 6 PM'],
  },
  openingHours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '10:00', closes: '19:00' },
    { days: ['Sunday'], opens: '12:00', closes: '18:00' },
  ],
} as const;
