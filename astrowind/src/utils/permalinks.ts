import slugify from 'limax';
import { canonicalUrl } from './canonical-url.mjs';

import { SITE, APP_BLOG } from 'astrowind:config';

import { trim } from '~/utils/utils';

export const trimSlash = (s: string) => trim(trim(s, '/'));
const createPath = (...params: string[]) => {
  const paths = params
    .map((el) => trimSlash(el))
    .filter((el) => !!el)
    .join('/');
  return '/' + paths + (SITE.trailingSlash && paths ? '/' : '');
};

const BASE_PATHNAME = SITE.base || '/';
const BASE_SEGMENT = trimSlash(BASE_PATHNAME);

export const withBasePath = (href?: string) => {
  if (!href || BASE_SEGMENT === '' || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(href)) {
    return href;
  }

  const base = `/${BASE_SEGMENT}`;
  if (href === base || href.startsWith(`${base}/`)) {
    return href;
  }

  return `${base}${href.startsWith('/') ? href : `/${href}`}`;
};

const withoutBasePath = (pathname: string) => {
  const path = `/${trimSlash(pathname)}`;
  const base = `/${trimSlash(BASE_PATHNAME)}`;

  if (base !== '/' && (path === base || path.startsWith(`${base}/`))) {
    return path.slice(base.length) || '/';
  }

  return path;
};

export const isChinesePath = (pathname: string) => /^\/zh-cn(?:\/|$)/.test(withoutBasePath(pathname));

export const getLocalizedPermalink = (pathname: string, locale: 'en' | 'zh-cn') => {
  const relativePath = withoutBasePath(pathname).replace(/^\/zh-cn(?=\/|$)/, '') || '/';
  const localizedPath =
    locale === 'zh-cn' ? (relativePath === '/' ? '/zh-cn/' : `/zh-cn${relativePath}`) : relativePath;

  return getPermalink(localizedPath);
};

export const cleanSlug = (text = '') =>
  trimSlash(text)
    .split('/')
    .map((slug) => slugify(slug))
    .join('/');

export const BLOG_BASE = cleanSlug(APP_BLOG?.list?.pathname);
export const CATEGORY_BASE = cleanSlug(APP_BLOG?.category?.pathname);
export const TAG_BASE = cleanSlug(APP_BLOG?.tag?.pathname) || 'tag';

export const POST_PERMALINK_PATTERN = trimSlash(APP_BLOG?.post?.permalink || `${BLOG_BASE}/%slug%`);

/** */
export const getCanonical = (path = ''): string | URL => {
  return canonicalUrl(path, SITE.site, SITE.base, SITE.trailingSlash);
};

/** */
export const getPermalink = (slug = '', type = 'page'): string => {
  let permalink: string;

  if (
    slug.startsWith('https://') ||
    slug.startsWith('http://') ||
    slug.startsWith('://') ||
    slug.startsWith('#') ||
    slug.startsWith('javascript:')
  ) {
    return slug;
  }

  switch (type) {
    case 'home':
      permalink = getHomePermalink();
      break;

    case 'blog':
      permalink = getBlogPermalink();
      break;

    case 'asset':
      permalink = getAsset(slug);
      break;

    case 'category':
      permalink = createPath(CATEGORY_BASE, trimSlash(slug));
      break;

    case 'tag':
      permalink = createPath(TAG_BASE, trimSlash(slug));
      break;

    case 'post':
      permalink = createPath(trimSlash(slug));
      break;

    case 'page':
    default:
      permalink = createPath(slug);
      break;
  }

  return definitivePermalink(permalink);
};

/** */
export const getHomePermalink = (): string => getPermalink('/');

/** */
export const getBlogPermalink = (): string => getPermalink(BLOG_BASE);

/** */
export const getAsset = (path: string): string =>
  '/' +
  [BASE_PATHNAME, path]
    .map((el) => trimSlash(el))
    .filter((el) => !!el)
    .join('/');

/** */
const definitivePermalink = (permalink: string): string => createPath(BASE_PATHNAME, permalink);
