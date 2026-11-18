import { Component, computed, input } from '@angular/core';

import { FormVariant } from '../../types/custom-components-types';
import { CustomForm } from '../../utils/form-custom-variants';

@Component({
  selector: 'app-form',
  standalone: true,
  template: `
    <section [class]="formClasses()">
      @if (title()) {
        <header class="flex flex-col gap-2">
          <h2 class="text-2xl font-bold text-base-content">
            {{ title() }}
          </h2>

          @if (description()) {
            <p class="text-base-content/70">
              {{ description() }}
            </p>
          }
        </header>
      }

      <ng-content />
    </section>
  `
})
export class FormComponent {
  variant = input<FormVariant>('default');
  title = input<string>();
  description = input<string>();

  protected formClasses = computed(() =>
    `${CustomForm.base} ${CustomForm.variants[this.variant()]}`
  );
}
