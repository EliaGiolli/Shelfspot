import { Component, computed, input } from '@angular/core';
import { RouterLink, RouterLinkActive, UrlTree } from '@angular/router';
import { ButtonVariant } from '../../types/custom-components-types';
import { ButtonLinks } from '../../utils/btn-custom-variants';

@Component({
  selector: 'app-button-link',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <a
      [class.!bg-accent]="false"
      [class]="linkClasses() + ' ' + activeClasses()"
      [href]="disabled() ? null : href()"
      [routerLinkActive]="activeClasses()"
      [routerLink]="disabled() || href() ? null : routerLink()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-disabled]="disabled() ? 'true' : null"
      [attr.tabindex]="disabled() ? -1 : null"
    >
      <ng-content></ng-content>
    </a>
  `,
  host: {
    '[class.disabled]': 'disabled()'
  }
})
export class ButtonLink {
  variant = input<ButtonVariant>('primary');
  href = input<string | null>(null);
  routerLink = input<string | any[] | UrlTree | null>(null);
  disabled = input(false);
  activeClasses = input('');
  ariaLabel = input<string>();

  // This computation is part of the mimicking the behavior of clsx and CVA began inside the btn-custom-variants.ts file
  protected linkClasses = computed(() =>
    `${ButtonLinks.base} ${ButtonLinks.variants[this.variant()]}`
  );
}