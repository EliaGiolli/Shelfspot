import { Component, input } from '@angular/core';
import { ButtonLink } from '../../button-links/button-links';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [ButtonLink],
  template: `
    <app-button-link
      variant="outline"
      routerLink="/"
      aria-label="ShelfSpot, home"
    >
      <div class="flex items-center justify-center gap-2 text-center">
        <img
          src="logo-mark.png"
          [alt]="alt() ?? ''"
          [style.width.px]="size()"
          [style.height.px]="size()"
        />
        <h2 class="mb-0">ShelfSpot</h2>
      </div>
    </app-button-link>
  `
})
export class Logo {
  alt = input<string | undefined>();
  size = input<number>(24);
}