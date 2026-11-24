import { type Book } from "./book";

export interface Loan {
    id: string;
    book: Book;
    loanDate: Date;
    dueDate: Date;
  }
