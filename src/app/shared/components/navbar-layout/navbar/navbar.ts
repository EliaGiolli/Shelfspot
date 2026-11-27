import { 
  Component, 
  signal, 
  ElementRef, 
  viewChild 
} from '@angular/core';
import { RouterLinkActive } from '@angular/router';
import { IconComponent } from '../../icon/icon';
import { ButtonLink } from '../../button-links/button-links';
import { Logo } from '../logo/logo';
import { MAIN_NAV_ITEMS } from '../../../config/navigation.config';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLinkActive,
    IconComponent, 
    ButtonLink,
    Logo,
  ],
  templateUrl: './navbar.html',
})
export class Navbar {
  isMenuOpen = signal(false);

  readonly navItems = MAIN_NAV_ITEMS;
  readonly MENU_ICON = 'menu.svg';
  readonly CLOSE_ICON = 'x.svg';

  // Retrieves a reference to the mobile menu button to manage keyboard focus.
  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');

  closeMenu(): void {
    this.isMenuOpen.set(false);
    this.menuButton()?.nativeElement.focus();
  }

  toggleMenu() {
    this.isMenuOpen.update(val => !val);
  }
}