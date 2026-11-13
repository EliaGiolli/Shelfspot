import { Component, computed, input } from '@angular/core';
import { RouterLink, UrlTree } from '@angular/router';
import { ButtonVariant } from '../../types/custom-components-types';

@Component({
  selector: 'app-button-link',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a
      class="button-control"
      [href]="disabled() ? null : href()"
      [routerLink]="disabled() || href() ? null : routerLink()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-disabled]="disabled() ? 'true' : null"
      [attr.tabindex]="disabled() ? -1 : null"
    >
      <ng-content></ng-content>
    </a>
  `,
  styleUrl: '../button/button.css',
  host: {
    '[class]': 'variantClass()',
    '[class.disabled]': 'disabled()'
  }
})
export class ButtonLink {
  variant = input<ButtonVariant>('primary');
  href = input<string | null>(null);
  routerLink = input<string | any[] | UrlTree | null>(null);
  disabled = input(false);
  ariaLabel = input<string>();

  protected variantClass = computed(() => `btn-${this.variant()}`);
}