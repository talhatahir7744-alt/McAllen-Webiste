/* Site images reused by the blog (English and Spanish posts). Kept apart from lib/blog-posts.ts so the Spanish
   post files can import them without an import cycle. */
export type BlogImage = { src: string; alt: string; width: number; height: number };

const A = '/assets/filesafe/ARD47WoZpqaZSQ9MSxLD/media';
const B = '/assets/filesafe/BljrSmLCnm4gF9LpsTRZ/media';
const L = '/assets/lcimg/image/f_webp/q_80/r_1200/u/filesafe';

/* site images reused for the blog (all already part of the site's assets) */
export const IMG = {
  store: { src: `${L}/ARD47WoZpqaZSQ9MSxLD/media/69a1d3acb617a750cec56a9b.jpg`, width: 1200, height: 800 },
  station: { src: `${B}/6a7577049a9c7792ea57899a.png`, width: 1000, height: 667 },
  pressureMap: { src: `${A}/11c4f704-6266-4eea-8702-295bb6974c13.png`, width: 1537, height: 1094 },
  sleeper: { src: `${A}/1871b85e-a9ee-4965-9e56-f7b289ce90fa.jpeg`, width: 1920, height: 720 },
  specialists: { src: `${L}/ARD47WoZpqaZSQ9MSxLD/media/695fbfed-24ba-4132-b604-2e6042bbb83f.jpeg`, width: 1000, height: 525 },
  mappingVisit: { src: '/assets/filesafe/SUCPzRcq7b6NGJH7gv9A/media/679361e8c21e373058b2232d.jpeg', width: 1000, height: 525 },
  coaches: { src: `${L}/BljrSmLCnm4gF9LpsTRZ/media/6a7578249a9c7792ea5a8b22.jpg`, width: 800, height: 1066 },
  bedroom: { src: `${L}/ARD47WoZpqaZSQ9MSxLD/media/697a3f631d0982c17e87ab11.png`, width: 1200, height: 1405 },
};
