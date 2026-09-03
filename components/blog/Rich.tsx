import type { ReactNode } from 'react';

/* Renders a paragraph string with inline [text](href) links as real anchors. Nothing else is parsed,
   so the article copy stays exactly as written. */
export function Rich({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <a key={m.index} href={m[2]}>
        {m[1]}
      </a>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

/* Plain-text version (for schema.org and meta output). */
export const plain = (text: string) => text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
