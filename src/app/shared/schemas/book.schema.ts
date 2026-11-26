
import { z } from 'zod';

export const BookSchema = z.object({
  id: z.string(),
  key: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  coverId: z.number().int().optional(),
  description: z.string().optional(),
  firstPublishYear: z.number().int().optional(),
  subjects: z.array(z.string()),
});

// This schema defines and validates the application-layer data