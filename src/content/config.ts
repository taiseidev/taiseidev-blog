import { defineCollection, z } from 'astro:content'

export const categories = ['life', 'hobby', 'photo', 'tech'] as const
export type Category = typeof categories[number]

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    duration: z.string().optional(),
    image: z
      .object({
        src: z.string(),
        alt: z.string(),
      })
      .optional(),
    date: z
      .string()
      .or(z.date())
      .transform((val: string | number | Date) => new Date(val).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })),
    category: z.enum(categories).default('life'),
    photos: z
      .array(
        z.union([
          z.string(),
          z.object({
            src: z.string(),
            caption: z.string().optional(),
            alt: z.string().optional(),
          }),
        ]),
      )
      .optional(),
    draft: z.boolean().default(false).optional(),
    lang: z.string().default('en-US').optional(),
    tag: z.string().optional().optional(),
    redirect: z.string().optional(),
    video: z.boolean().default(false).optional(),
  }),
})

export const collections = { blog }
