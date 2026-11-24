import { z } from 'zod';

// Open Library GET /search.json — original wire format
export const SearchDocDtoSchema = z.object({
  key: z.string(),
  title: z.string(),
  author_name: z.array(z.string()).optional(),
  cover_i: z.number().optional(),
  first_publish_year: z.number().optional(),
  subject: z.array(z.string()).optional(),
});
export type SearchDocDto = z.infer<typeof SearchDocDtoSchema>;

// Open Library GET /search.json — represents the response from the search endpoint
export const SearchResponseSchema = z.object({
  // represents the total number of results
  numFound: z.number(),
  // represents the start index of the results
  start: z.number(),
  // represents the array of search results
  docs: z.array(SearchDocDtoSchema),
});

export type SearchResponseDto = z.infer<typeof SearchResponseSchema>;

// Open Library GET /works/:id.json — original wire format
const WorkDescriptionDtoSchema = z.union([
  z.string(),
  z.object({ value: z.string() }),
]);

export const WorkDtoSchema = z.object({
  key: z.string(),
  title: z.string(),
  description: WorkDescriptionDtoSchema.optional(),
  subjects: z.array(z.string()).optional(),
  covers: z.array(z.number()).optional(),
  authors: z.array(z.unknown()).optional(),
  first_publish_date: z.string().optional(),
});
export type WorkDto = z.infer<typeof WorkDtoSchema>;

// Open Library GET /subjects/:name.json — original wire format
export const SubjectWorkDtoSchema = z.object({
  key: z.string(),
  title: z.string(),
  authors: z
    .array(
      z.object({
        key: z.string(),
        name: z.string(),
      })
    )
    .optional(),
  cover_id: z.number().optional(),
  first_publish_year: z.number().optional(),
});
export type SubjectWorkDto = z.infer<typeof SubjectWorkDtoSchema>;

export const SubjectResponseSchema = z.object({
  works: z.array(SubjectWorkDtoSchema),
});
export type SubjectResponseDto = z.infer<typeof SubjectResponseSchema>;
