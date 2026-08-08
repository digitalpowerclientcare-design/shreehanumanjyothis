import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content model. Adding a new service page or blog post = creating ONE
 * markdown file with this frontmatter. No template editing required.
 */

const faq = z.object({
  question: z.string(),
  answer: z.string(),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    /** Order on the services hub. Lower = higher. */
    order: z.number().default(50),
    /** T1 services get per-city pages; T2/T3 stay city-neutral for now. */
    tier: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(2),
    /** Shown on cards and in the services grid. */
    summary: z.string(),
    /** 40–60 words, answer-first. This is the block LLMs extract. */
    leadAnswer: z.string(),
    targetKeyword: z.string(),
    secondaryKeywords: z.array(z.string()).default([]),
    metaTitle: z.string(),
    metaDescription: z.string(),
    h1: z.string(),
    /** Used to build the `{service} in {city}` variants. */
    cityH1Pattern: z.string().optional(),
    icon: z.string().default('lotus'),
    faqs: z.array(faq).default([]),
    relatedServices: z.array(z.string()).default([]),
    /** Rendered verbatim in a callout. Required on anything outcome-adjacent. */
    complianceNote: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** 40–60 words, answer-first — placed directly under the H1. */
    leadAnswer: z.string(),
    targetKeyword: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum([
      'kundli-and-birth-chart',
      'marriage-and-matching',
      'relationships',
      'vastu',
      'doshas-and-remedies',
      'career-and-business',
      'choosing-an-astrologer',
    ]),
    faqs: z.array(faq).default([]),
    relatedService: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const glossary = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/glossary' }),
  schema: z.object({
    term: z.string(),
    /** One sentence, pattern: "X is a Y that Z." Built for direct quotation. */
    definition: z.string(),
    alsoKnownAs: z.array(z.string()).default([]),
    relatedService: z.string().optional(),
  }),
});

export const collections = { services, blog, glossary };
