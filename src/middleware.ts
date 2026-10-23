import { defineMiddleware } from 'astro:middleware';
import { langFromPath, localizeLinks } from './i18n';

// Sets the page language from the URL and keeps readers of the Marathi site on Marathi pages.
export const onRequest = defineMiddleware(async (ctx, next) => {
  const lang = langFromPath(ctx.url.pathname);
  ctx.locals.lang = lang;
  const res = await next();
  if (lang !== 'mr' || !(res.headers.get('content-type') || '').includes('text/html')) return res;
  const html = await res.text();
  return new Response(localizeLinks(html), { status: res.status, statusText: res.statusText, headers: res.headers });
});
