import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../site.config';

export async function GET(context) {
  const posts = await getCollection('devlog', ({ data }) => !data.draft);
  return rss({
    title: `${SITE.name} — Blog`,
    description: 'News, development updates and playtest info for STATIC: Salvage vs Hunter.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
    customData: '<language>en-us</language>',
  });
}
