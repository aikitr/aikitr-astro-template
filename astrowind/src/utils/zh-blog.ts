import { getCollection } from 'astro:content';
import { blogPostsPerPage } from '~/utils/blog';

export const zhPostsPerPage = blogPostsPerPage ?? 8;

export async function getZhPosts() {
  return (await getCollection('postZh'))
    .filter((post) => !post.data.draft)
    .sort((a, b) => (b.data.publishDate?.valueOf() ?? 0) - (a.data.publishDate?.valueOf() ?? 0));
}
