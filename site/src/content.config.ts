import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const devlog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/devlog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    /** Optional freshness signal — surfaces as dateModified in BlogPosting JSON-LD. */
    updatedDate: z.coerce.date().optional(),
    /** Shown in the mono kicker on the post + OG card. */
    tag: z.enum(['design', 'production', 'systems']).default('design'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { devlog };
