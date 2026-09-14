import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Collection key stays `devlog` (renaming it would touch every page for zero
// user-visible benefit) — the folder and the public URL are the user-facing
// parts, and both now say "blog".
const devlog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/blog' }),
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
