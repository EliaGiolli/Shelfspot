
import { Component, computed, input } from '@angular/core';
import { CardVariant } from '../../types/custom-components-types';
import { CustomCard } from '../../utils/card-custom-variants';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <article
      [class]="cardClasses()"
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
  titleId = input.required<string>();
  variant = input<CardVariant>('default');

  protected cardClasses = computed(() =>
    `${CustomCard.base} ${CustomCard.variants[this.variant()]}`
  );
}
