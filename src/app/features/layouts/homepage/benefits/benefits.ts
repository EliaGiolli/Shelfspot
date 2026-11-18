import { Component, signal, inject } from '@angular/core';
import { CardComponent } from '../../../../shared/components/card/card';
//static data
import { benefits } from './benefits.model';

@Component({
  selector: 'app-benefits',
  imports: [CardComponent],
  templateUrl: './benefits.html',
})
export class Benefits {
  readonly benefits = benefits;
}
