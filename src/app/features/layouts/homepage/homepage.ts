import { Component, signal, inject } from '@angular/core';
import { Herosection } from "../homepage/herosection/herosection";
import { BentoGrid } from './bento-grid/bento-grid';
import { BookPreview } from './book-preview/book-preview';
import { Benefits } from './benefits/benefits';
import { AccordionComponent } from './accordion-component/accordion-component';

@Component({
  selector: 'app-homepage',
  imports: [
    Herosection,
    BentoGrid,
    BookPreview,
    Benefits,
    AccordionComponent
],
  templateUrl: './homepage.html',
})
export class Homepage {

  // Logic for the accordion
  expandedIndex = signal<number | undefined>(undefined);

  toggleFaq(index: number) {
    this.expandedIndex.update(val => val === index ? undefined : index);
  }
}
