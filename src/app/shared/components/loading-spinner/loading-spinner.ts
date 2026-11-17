import { Component, input } from '@angular/core';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <span
      class="loading loading-spinner"
      [class.loading-xs]="size() === 'xs'"
      [class.loading-sm]="size() === 'sm'"
      [class.loading-md]="size() === 'md'"
      [class.loading-lg]="size() === 'lg'"
      [class.loading-xl]="size() === 'xl'"
      role="status"
      [attr.aria-label]="label()"
    ></span>
  `
})
export class LoadingSpinnerComponent {
  size = input<SpinnerSize>('md');
  label = input('Loading...');
}