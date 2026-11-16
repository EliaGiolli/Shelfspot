import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../../icon/icon';
import { ButtonLink } from '../../button-links/button-links';
import { Logo } from '../logo/logo';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink, 
    RouterLinkActive,
    IconComponent, 
    ButtonLink,
    Logo,
  ],
  templateUrl: './navbar.html',
})
export class Navbar {
  isMenuOpen = signal(false);

  readonly MENU_ICON = 'menu.svg';
  readonly CLOSE_ICON = 'x.svg';

  toggleMenu() {
    this.isMenuOpen.update(val => !val);
  }
}