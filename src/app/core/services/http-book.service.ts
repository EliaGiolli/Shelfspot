import { 
    Injectable, 
    inject,
} from "@angular/core";
// HTTP
import { HttpClient } from "@angular/common/http";
// RxJS and Operators
import { map, Observable } from "rxjs";
// Tokens
import { API_URL } from "../tokens/api.token";
// Types and Schemas
import { type ApiBookData } from "../../shared/types/api-book-data";
import { 
    type BookSearchResult, 
    SearchResponseSchema,
    SubjectResponseSchema,
} from "../schemas/book-api.schema";

@Injectable({ providedIn: 'root' })
export class HttpBookService {
    private http = inject(HttpClient);
    private readonly API_URL = inject(API_URL);

    // definition of the method that will be called by the component(s)
    searchBooks(query: string, page: number = 1): Observable<BookSearchResult[]> {
        const params = `?q=${encodeURIComponent(query)}&page=${page}`;
        
        return this.http.get<unknown>(`${this.API_URL}/search.json${params}`).pipe(
            map(rawResponse => {
            const result = SearchResponseSchema.safeParse(rawResponse);
            
            if (!result.success) {
                console.error('Schema validation failed:', result.error.format());
                return []; 
            }
            
            return result.data.docs;
            }),
            map(books => books.slice(0, 12))
        );
    }

    getBooksBySubject( subject: string, page: number = 1 ): Observable<BookSearchResult[]> {
        const limit = 12;
        // allows to prepare the pagination
        const offset = (page - 1) * limit;

        const params = `?limit=${limit}&offset=${offset}`;

        return this.http.get<unknown>(
                `${this.API_URL}/subjects/${encodeURIComponent(subject)}.json${params}`
            )
            .pipe(
                // converts authors in author_name and cover_id in cover_i
                // this mantains one format for each component
                map(rawResponse => {
                    const result = SubjectResponseSchema.safeParse(rawResponse);

                    if (!result.success) {
                    console.error(
                        'Subject schema validation failed:',
                        result.error.format()
                    );
                    return [];
                    }

                    return result.data.works.map(book => ({
                    key: book.key,
                    title: book.title,
                    author_name: book.authors?.map(author => author.name) ?? [],
                    cover_i: book.cover_id,
                    first_publish_year: book.first_publish_year
                    }));
                })
            );
    }

    searchBookById(id:string):Observable<ApiBookData | null> {
        return this.http.get<ApiBookData>(`${this.API_URL}/works/${id}.json`);
    }

    //It returns only the first result
    getFirstBookByQuery(query: string): Observable<BookSearchResult | null> {
        return this.searchBooks(query)
            .pipe(
                map(books => books.length > 0 ? books[0] : null)
            );
    }
}