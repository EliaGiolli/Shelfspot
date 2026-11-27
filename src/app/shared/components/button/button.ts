
import { Component, computed, input } from '@angular/core';
import { ButtonVariant } from '../../types/custom-components-types';
import { CustomButton } from '../../utils/btn-custom-variants';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [class]="buttonClasses()"
      [type]="type()"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-pressed]="ariaPressed() ?? null"
      [attr.aria-expanded]="ariaExpanded() ?? null"
    >
      <ng-content></ng-content>
    </button>
  `,
  host: {
    '[class.disabled]': 'disabled()'
  }
})
export class Button {
  variant = input<ButtonVariant>('primary');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input(false);
  ariaLabel = input<string>();
  ariaPressed = input<boolean | undefined>(undefined);
  ariaExpanded = input<boolean | undefined>(undefined);

  protected buttonClasses = computed(() =>
    `${CustomButton.base} ${CustomButton.variants[this.variant()]}`
  );
}
