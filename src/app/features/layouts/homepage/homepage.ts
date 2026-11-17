import { Component, signal, inject } from '@angular/core';
import { IconComponent } from '../../../shared/components/icon/icon';
import { Herosection } from "../homepage/herosection/herosection";
import { BentoGrid } from './bento-grid/bento-grid';
import { CardComponent } from '../../../shared/components/card/card';

//static data
import { benefits } from '../../../core/models/benefits.model';
import { FAQs } from '../../../core/models/faqs.model';

@Component({
  selector: 'app-homepage',
  imports: [
    IconComponent, 
    Herosection, 
    BentoGrid,
    CardComponent
  ],
  templateUrl: './homepage.html',
})
export class Homepage {
  readonly benefits = benefits;
  readonly faqs = FAQs;

  // Logic for the accordion
  expandedIndex = signal<number | undefined>(undefined);

  toggleFaq(index: number) {
    this.expandedIndex.update(val => val === index ? undefined : index);
  }
}
