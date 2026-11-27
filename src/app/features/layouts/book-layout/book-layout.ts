import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon';
import { ButtonLink } from '../../../shared/components/button-links/button-links';
import { Button } from '../../../shared/components/button/button';
import { TooltipDirective } from '../../../shared/directives/tooltip.directive';
import { BOOK_NAV_ITEMS } from '../../../shared/config/navigation.config';

@Component({
  selector: 'app-book-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    IconComponent,
    ButtonLink,
    Button,
    TooltipDirective,
  ],
  templateUrl: './book-layout.html',
})
export class BookLayout {
  isCollapsed = signal(true);
  isDrawerOpen = signal(false);

  readonly menuItems = BOOK_NAV_ITEMS;

  toggleSidebar(): void {
    this.isCollapsed.update((collapsed) => !collapsed);
  }

  onDrawerToggle(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.isDrawerOpen.set(input.checked);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }
}
