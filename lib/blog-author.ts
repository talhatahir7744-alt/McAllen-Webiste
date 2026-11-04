/* The blog's author (the client's decision, October 27, 2026, restated November 4): the Organization "Snooze Mattress
   Company" at https://snoozemattresscompany.com, on every post in both languages — the visible byline ("By …" /
   "Por …"), the article:author tag and the BlogPosting author. This is the one place the site uses that name: everywhere
   else the business is "Snooze Mattress + Wellness", and scripts/brand-nap.mjs, which rewrites "Snooze Mattress Company"
   to it, deliberately does not read this file. */
export const BLOG_AUTHOR = { name: 'Snooze Mattress Company', url: 'https://snoozemattresscompany.com' } as const;
