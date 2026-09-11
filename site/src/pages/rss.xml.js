import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../site.config';

export async function GET(context) {
  const posts = await getCollection('devlog', ({ data }) => !data.draft);
  return rss({
    title: `${SITE.name} — Devlog`,
    description: 'Development updates on STATIC: Salvage vs Hunter.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/devlog/${post.id}/`,
    })),
    customData: '<language>en-us</language>',
  });
}
