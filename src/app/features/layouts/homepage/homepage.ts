import { Component, signal, inject } from '@angular/core';
import { IconComponent } from '../../../shared/components/icon/icon';
import { Herosection } from "../homepage/herosection/herosection";
import { BentoGrid } from './bento-grid/bento-grid';
import { BookPreview } from './book-preview/book-preview';
import { Benefits } from './benefits/benefits';

//static data
import { FAQs } from '../../../core/models/faqs.model';

@Component({
  selector: 'app-homepage',
  imports: [
    IconComponent,
    Herosection,
    BentoGrid,
    BookPreview,
    Benefits
],
  templateUrl: './homepage.html',
})
export class Homepage {
  readonly faqs = FAQs;

  // Logic for the accordion
  expandedIndex = signal<number | undefined>(undefined);

  toggleFaq(index: number) {
    this.expandedIndex.update(val => val === index ? undefined : index);
  }
}
