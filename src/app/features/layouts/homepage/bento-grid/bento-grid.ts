
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IconComponent } from '../../../../shared/components/icon/icon';
import { CardComponent } from '../../../../shared/components/card/card';
import { ButtonLink } from '../../../../shared/components/button-links/button-links';
import { Button } from '../../../../shared/components/button/button';
import { LoanService } from '../../../../core/services/loans.service';

@Component({
  selector: 'app-bento-grid',
  imports: [IconComponent, CardComponent, ButtonLink, Button],
  templateUrl: './bento-grid.html',
})
export class BentoGrid {
  private router = inject(Router);
  private loanService = inject(LoanService);

  loanCount = this.loanService.loanCount;
  searchQuery = signal('');

  onSearch(): void {
    const query = this.searchQuery().trim();

    if (query.length < 3) return;

    this.router.navigate(['/books/search'], {
      queryParams: { q: query }
    });
  }
}
