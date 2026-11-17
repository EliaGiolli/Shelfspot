import { 
  Component, 
  inject, 
  signal, 
  OnInit 
} from '@angular/core';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { CardComponent } from '../../../../shared/components/card/card';
import { ButtonLink } from '../../../../shared/components/button-links/button-links';

import { HttpBookService } from '../../../../core/services/http-book.service';
import { ApiBookData } from '../../../../shared/types/api-book-data';

@Component({
  selector: 'app-herosection',
  imports: [IconComponent, CardComponent, ButtonLink],
  templateUrl: './herosection.html',
  styleUrl: './herosection.css',
})
export class Herosection implements OnInit {
  private bookService = inject(HttpBookService);
  featuredBook = signal<ApiBookData | null>(null);

  ngOnInit() {
    this.bookService.getFirstBookByQuery('The Great Gatsby').subscribe(
      book => this.featuredBook.set(book as ApiBookData)
    );
  }
}
