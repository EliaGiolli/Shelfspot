
import {
  Component,
  computed,
  forwardRef,
  input,
  signal
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

import { InputVariant } from '../../types/custom-components-types';
import { CustomInput } from '../../utils/input-custom-variants';

@Component({
  selector: 'app-input',
  standalone: true,
  template: `
    <input
      [class]="inputClasses()"
      [id]="id() || null"
      [type]="type()"
      [placeholder]="placeholder()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.aria-describedby]="ariaDescribedBy() || null"
      [disabled]="isDisabled()"
      [value]="value()"
      (input)="onInput($event)"
      (blur)="onBlur()"
    />
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  variant = input<InputVariant>('default');
  type = input<'text' | 'search' | 'email' | 'password' | 'number'>('text');
  id = input<string>();
  placeholder = input('');
  ariaLabel = input<string>();
  ariaDescribedBy = input<string>();

  protected value = signal('');
  protected isDisabled = signal(false);

  protected inputClasses = computed(() =>
    `${CustomInput.base} ${CustomInput.variants[this.variant()]}`
  );

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.value.set(value);
    this.onChange(value);
  }

  protected onBlur(): void {
    this.onTouched();
  }
}
