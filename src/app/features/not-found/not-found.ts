import { Component } from '@angular/core';
import { IconComponent } from '../../shared/components/icon/icon';
import { ButtonLink } from '../../shared/components/button-links/button-links';

@Component({
  selector: 'app-not-found',
  imports: [IconComponent, ButtonLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {}
