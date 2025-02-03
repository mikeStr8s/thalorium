import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const legendarium = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: './src/legendarium' }),
    schema: z.object({
        title: z.string(),
        modified: z.date(),
        created: z.date()
    })
});

export const collections = { legendarium };