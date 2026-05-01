import type { APIContext, APIRoute } from 'astro';

const HOTEL_DOMAINS = [
  'booking.com',
  'hotels.com',
  'expedia.com',
  'airbnb.com',
  'tripadvisor.com',
];

const HOTEL_DOMAIN_KEYWORDS = ['hotel', 'hostel', 'motel', 'resort', 'lodge', 'airbnb'];

const PATH_HOTEL_KEYWORDS = [
  '/hotel',
  '/hotels',
  '/motel',
  '/accommodation',
  '/lodge',
  '/hostel',
  '/resort',
  '/inn',
];

export const isHotelUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = parsed.pathname.toLowerCase();

    if (HOTEL_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))) {
      return true;
    }

    if (HOTEL_DOMAIN_KEYWORDS.some((kw) => hostname.includes(kw))) {
      return true;
    }

    if (PATH_HOTEL_KEYWORDS.some((kw) => pathname.includes(kw))) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

const isValid = (visitedDomains: string[], url: string) => {
  if (!isValidURLPattern(url)) return false;

  if (isHotelUrl(url)) {
    console.log(`[hotel-filter] Filtered out: ${url}`);
    return false;
  }

  const hasAlreadyVisited = visitedDomains.includes(new URL(url).hostname);

  return !hasAlreadyVisited;
};

const isValidURLPattern = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const getURL = async (db: any, blogOnly: boolean) => {
  const blogFilter = blogOnly ? 'AND is_blog = 1' : '';

  const statement = await db.prepare(
    `SELECT * FROM page
     WHERE id >= (ABS(RANDOM()) % (SELECT MAX(id) FROM page)) + 1
     AND url NOT LIKE '%booking.com%'
     AND url NOT LIKE '%hotels.com%'
     AND url NOT LIKE '%expedia.com%'
     AND url NOT LIKE '%airbnb.com%'
     AND url NOT LIKE '%tripadvisor.com%'
     AND url NOT LIKE '%/hotel%'
     AND url NOT LIKE '%/motel%'
     AND url NOT LIKE '%/accommodation%'
     AND url NOT LIKE '%/hostel%'
     AND url NOT LIKE '%/resort%'
     AND url NOT LIKE '%/lodge%'
     AND url NOT LIKE '%/inn%'
     ${blogFilter}
     ORDER BY id
     LIMIT 1`
  );

  const result = await statement.first();

  if (!result) {
    return null;
  }

  return result.url;
};

const MAX_TRIES = 150;

const getValidURL = async (
  db: any,
  visitedDomains: string[],
  blogOnly: boolean
) => {
  let url = await getURL(db, blogOnly);

  let tries = 0;

  while (!isValid(visitedDomains, url) && tries < MAX_TRIES) {
    try {
      url = await getURL(db, blogOnly);

      tries++;
    } catch {
      tries++;
    }
  }

  if (tries >= MAX_TRIES) {
    return null;
  }

  return url;
};

const getBody = async (ctx: APIContext) => {
  try {
    return await ctx.request.json();
  } catch {
    return null;
  }
};

export const PUT: APIRoute = async (ctx) => {
  const body = await getBody(ctx);

  if (!body) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to parse body',
      }),
      { status: 400 }
    );
  }

  const visitedDomains = body.visitedDomains as string[] | undefined;

  if (!visitedDomains || typeof visitedDomains !== 'object') {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Missing visitedDomains in body',
      }),
      { status: 400 }
    );
  }

  const blogOnly = body.blogOnly === true;
  const db = ctx.locals.runtime.env.DB;

  const validURL = await getValidURL(db, visitedDomains, blogOnly);

  if (!validURL) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'No valid URL found',
      }),
      { status: 404 }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      url: validURL,
    }),
    { status: 200 }
  );
};
