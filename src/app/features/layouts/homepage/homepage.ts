import { Component, signal, inject } from '@angular/core';
import { Herosection } from "../homepage/herosection/herosection";
import { BentoGrid } from './bento-grid/bento-grid';
import { BookPreview } from './book-preview/book-preview';
import { Benefits } from './benefits/benefits';
import { ButtonLink } from '../../../shared/components/button-links/button-links';
import { CardComponent } from '../../../shared/components/card/card';
import { AccordionComponent } from './accordion-component/accordion-component';
import { LoanCta } from './loan-cta/loan-cta';

@Component({
  selector: 'app-homepage',
  imports: [
    Herosection,
    BentoGrid,
    BookPreview,
    Benefits,
    AccordionComponent,
    LoanCta
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
