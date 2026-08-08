import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { brand } from '../data/business.ts';

export async function GET(context) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
  );

  return rss({
    title: `${brand.name} — Articles`,
    description:
      'Vedic astrology explained plainly — kundli matching, doshas, Vastu, and how to tell a genuine astrologer from a sales pitch.',
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.publishDate,
      link: `/blog/${p.id}/`,
    })),
    customData: '<language>en-in</language>',
  });
}
