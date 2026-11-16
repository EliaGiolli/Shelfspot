import { Component } from '@angular/core';
import { IconComponent } from '../icon/icon';
import { Logo } from '../navbar-layout/logo/logo';

@Component({
  selector: 'app-footer',
  imports: [IconComponent, Logo],
  templateUrl: './footer.html',
})
export class Footer {
  readonly currentYear = Date.now()
}
