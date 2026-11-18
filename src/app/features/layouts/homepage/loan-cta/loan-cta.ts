import { Component } from '@angular/core';
import { ButtonLink } from '../../../../shared/components/button-links/button-links';
import { CardComponent } from '../../../../shared/components/card/card';

@Component({
  selector: 'app-loan-cta',
  imports: [ 
    ButtonLink,
    CardComponent,
  ],
  templateUrl: './loan-cta.html',
})
export class LoanCta {}
