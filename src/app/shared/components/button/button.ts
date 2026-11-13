import { Component, computed, input } from '@angular/core';
import { ButtonVariant } from '../../types/custom-components-types';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      class="button-control"
      [type]="type()"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel() || null"
    >
      <ng-content></ng-content>
    </button>
  `,
  styleUrl: './button.css',
  host: {
    '[class]': 'variantClass()',
    '[class.disabled]': 'disabled()'
  }
})
export class Button {
  variant = input<ButtonVariant>('primary');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input(false);
  ariaLabel = input<string>();

  protected variantClass = computed(() => `btn-${this.variant()}`);
}