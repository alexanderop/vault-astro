import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const stringList = z.union([z.array(z.string()), z.string().transform((value) => [value])]);

const notes = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/notes",
    generateId: ({ entry }) =>
      entry
        .replaceAll("\\", "/")
        .replace(/^notes\//, "")
        .replace(/\.md$/, ""),
  }),
  schema: z
    .object({
      title: z.string().optional(),
      name: z.string().optional(),
      slug: z.string().optional(),
      aliases: stringList.optional(),
      tags: stringList.optional(),
      publish: z.boolean().optional().default(true),
      permalink: z.string().optional(),
      nav_hidden: z.boolean().optional(),
      nav_order: z.number().optional(),
      date: z.union([z.coerce.date(), z.string()]).optional(),
      cssclasses: stringList.optional(),
      description: z.string().optional(),
      summary: z.string().optional(),
      authors: stringList.optional(),
      type: z.string().optional(),
      url: z.string().optional(),
      website: z.string().optional(),
      artwork: z.string().optional(),
      image: z.string().optional(),
      feed: z.string().optional(),
      platforms: z.record(z.string(), z.string()).optional(),
      cover: z.string().optional(),
      notes: z.string().optional(),
    })
    .passthrough(),
});

export const collections = { notes };
