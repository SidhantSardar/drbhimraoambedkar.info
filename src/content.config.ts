import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const keyDate = z.object({
  date: z.coerce.string(),
  label: z.string(),
  source: z.string().optional(),
});

// Story chapters and themes share one shape (see research/CONVENTIONS.md).
const story = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  order: z.number(),
  period: z.string().optional(),
  summary: z.string().optional(),
  inShort: z.array(z.string()).optional().default([]),
  keyDates: z.array(keyDate).optional().default([]),
  imageIdeas: z.array(z.string()).optional().default([]),
  heroImage: z.string().optional(),
});

const life = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/life', generateId: ({ entry }) => entry.replace(/^\d+-/, '').replace(/\.md$/, '') }),
  schema: story,
});

const themes = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/themes' }),
  schema: story,
});

const blogSchema = z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    author: z.string().default('drbhimraoambedkar.info'),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  });
const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: blogSchema,
});

// Long-form research files that are also published as pages (e.g. where the physical archives are).
const research = defineCollection({
  loader: glob({ pattern: ['works/*.md', 'constitution/*.md'], base: './research' }),
  schema: z.object({ title: z.string().optional() }).passthrough(),
});

// Marathi translations: same file names and ids under src/content/mr/ and research/mr/.
const lifeMr = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/mr/life', generateId: ({ entry }) => entry.replace(/^\d+-/, '').replace(/\.md$/, '') }),
  schema: story,
});
const themesMr = defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/mr/themes' }), schema: story });
const blogMr = defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/mr/blog' }), schema: blogSchema });
const researchMr = defineCollection({
  loader: glob({ pattern: ['works/*.md', 'constitution/*.md'], base: './research/mr' }),
  schema: z.object({ title: z.string().optional() }).passthrough(),
});

export const collections = { life, themes, blog, research, lifeMr, themesMr, blogMr, researchMr };
