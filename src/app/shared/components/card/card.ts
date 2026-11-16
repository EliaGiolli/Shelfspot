
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <article
      class="group flex h-full flex-col rounded-2xl border border-accent/20 bg-surface-elevated p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
      [attr.aria-labelledby]="titleId()"
    >
      <!-- Header -->
      <div class="mb-4">
        <ng-content select="[card-header]"></ng-content>
      </div>

      <!-- Body -->
      <div class="grow">
        <ng-content select="[card-body]"></ng-content>
      </div>

      <!-- Footer -->
      <div class="mt-4">
        <ng-content select="[card-footer]"></ng-content>
      </div>
    </article>
  `
})
export class CardComponent {
  // Unique ID associated with the card title
  titleId = input.required<string>();
}
