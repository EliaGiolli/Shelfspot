import { Component, signal } from '@angular/core';

//static data
import { FAQs } from './faqs.model';
@Component({
  selector: 'app-accordion-component',
  imports: [],
  templateUrl: './accordion-component.html',
})
export class AccordionComponent {
  readonly faqs = FAQs;

  protected expandedIndex = signal<number | null>(null);

  protected toggleFaq(index: number): void {
    this.expandedIndex.update(current =>
      current === index ? null : index
    );
  }
}
