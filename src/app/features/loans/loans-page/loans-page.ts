
import {
  Component,
  ElementRef,
  inject,
  viewChild,
  viewChildren
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AppLiveRegionDirective } from '../../../shared/directives/app-live-region.directive';
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
    IconComponent,
    AppLiveRegionDirective
  ],
  templateUrl: './loans-page.html'
})
export class LoansPage {
  readonly loanService = inject(LoanService);
  readonly getLoanDeadline = getLoanDeadline;

  private readonly returnButtons =
    viewChildren<Button, ElementRef<HTMLElement>>('returnButton', {
      read: ElementRef
    });

  private readonly emptyStateHeading =
    viewChild<ElementRef<HTMLHeadingElement>>('emptyStateHeading');

  protected getAbsoluteDays(days: number): number {
    return Math.abs(days);
  }

  isValidDate(date: Date | null | undefined): boolean {
    return date instanceof Date && !Number.isNaN(date.getTime());
  }

  retryLoading(): void {
    void this.loanService.retryLoad();
  }

  async returnLoan(loanId: string): Promise<void> {
    const currentLoans = this.loanService.loans();

    const currentIndex = currentLoans.findIndex(
      loan => loan.id === loanId
    );

    if (currentIndex === -1) {
      return;
    }

    const success = await this.loanService.returnBook(loanId);

    if (!success) {
      return;
    }

    requestAnimationFrame(() => {
      const remainingButtons = this.returnButtons();

      if (remainingButtons.length > 0) {
        const nextIndex = Math.min(
          currentIndex,
          remainingButtons.length - 1
        );

        remainingButtons[nextIndex]
          .nativeElement
          .querySelector('button')
          ?.focus();

        return;
      }

      this.emptyStateHeading()?.nativeElement.focus();
    });
  }
}
