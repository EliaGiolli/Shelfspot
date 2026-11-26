// this schema describes a single loaned book
import { z } from 'zod';
import { BookSchema } from '../../../shared/schemas/book.schema';

export const PersistedLoanSchema = z.object({
  id: z.string(),
  book: BookSchema,
  loanDate: z.iso.datetime(), // z.string().datetime() is deprecated
  dueDate: z.iso.datetime(),
});

export const PersistedLoansSchema = z.array(PersistedLoanSchema);

export type PersistedLoan = z.infer<typeof PersistedLoanSchema>;
