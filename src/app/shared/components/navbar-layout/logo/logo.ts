import { Component, input } from '@angular/core';
import { ButtonLink } from '../../button-links/button-links';

@Component({
  selector: 'app-logo',
  imports: [ButtonLink],
  templateUrl: './logo.html',
  styleUrl: './logo.css',
})
export class Logo {
  alt = input<string | undefined>()
  size = input<number>(24);
}
