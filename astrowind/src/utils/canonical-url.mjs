/**
 * Create the public canonical URL for a page, including a template's deploy base.
 *
 * @param {string} pathname
 * @param {string | undefined} site
 * @param {string | undefined} base
 * @param {boolean | undefined} trailingSlash
 */
export function canonicalUrl(pathname = '', site, base = '/', trailingSlash) {
  const normalizedBase = `/${(base ?? '/').split('/').filter(Boolean).join('/')}`;
  const pagePath = pathname || '/';
  const basePath = normalizedBase === '/' ? '' : normalizedBase;
  const isAlreadyPrefixed = basePath && (pagePath === basePath || pagePath.startsWith(`${basePath}/`));
  const publicPath =
    basePath && !isAlreadyPrefixed ? `${basePath}${pagePath.startsWith('/') ? pagePath : `/${pagePath}`}` : pagePath;
  const url = new URL(publicPath, site).toString();

  if (trailingSlash === false && pathname && url.endsWith('/')) {
    return url.slice(0, -1);
  }

  if (trailingSlash === true && pathname && !url.endsWith('/')) {
    return `${url}/`;
  }

  return url;
}
