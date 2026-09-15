/* The GoHighLevel runtime still reports page stats and attribution sessions to its API, which the converter points at
   /ghl-stub/api/… (nothing on the site depends on those calls). Answer them with an empty JSON object instead of a
   404 so they leave no errors in the console. Widget/form/link paths are rewritten to the placeholder page and
   /ghl-stub/api/js/* to an empty script in next.config.ts before this handler is reached. Hand-written: the
   converter keeps app/ghl-stub when it regenerates the app directory. */
const ok = () => new Response('{}', { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export function GET() { return ok(); }
export function POST() { return ok(); }
export function PUT() { return ok(); }
export function PATCH() { return ok(); }
export function DELETE() { return ok(); }
export function OPTIONS() { return new Response(null, { status: 204 }); }
