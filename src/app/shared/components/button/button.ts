import { Component, computed, input } from '@angular/core';
import { ButtonVariant } from '../../types/custom-components-types';
import { CustomButton } from '../../utils/btn-custom-variants';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [class] = "buttonClasses()"
      [type]="type()"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel() || null"
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

  // This computation is part of the mimicking the behavior of clsx and CVA began inside the btn-custom-variants.ts file
   protected buttonClasses = computed(() =>
    `${CustomButton.base} ${CustomButton.variants[this.variant()]}`
  );
}