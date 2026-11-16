import { Component } from '@angular/core';
import { ButtonLink } from '../../button-links/button-links';

@Component({
  selector: 'app-logo',
  imports: [ButtonLink],
  templateUrl: './logo.html',
  styleUrl: './logo.css',
})
export class Logo {}
