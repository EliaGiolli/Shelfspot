
import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CoverFallbackPipe } from '../../../shared/pipes/cover-fallback-pipe-pipe';
import { Button } from '../../../shared/components/button/button';
import { IconComponent } from '../../../shared/components/icon/icon';

import { LoanService } from '../../../core/services/loans.service';
import { getLoanDeadline } from '../helpers/loan-status';

@Component({
  selector: 'app-loans-page',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    CoverFallbackPipe,
    Button,
    IconComponent
  ],
  templateUrl: './loans-page.html'
})
export class LoansPage {
  readonly loanService = inject(LoanService);

  readonly getLoanDeadline = getLoanDeadline;

  isValidDate(date: Date | null | undefined): boolean {
    return date instanceof Date && !Number.isNaN(date.getTime());
  }

  retryLoading(): void {
    void this.loanService.retryLoad();
  }
}
