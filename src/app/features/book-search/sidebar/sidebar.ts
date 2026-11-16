import { Component, signal } from '@angular/core';
import { IconComponent } from '../../../shared/components/icon/icon';
import { ButtonLink } from '../../../shared/components/button-links/button-links';
import { TooltipDirective } from '../../../shared/directives/tooltip.directive';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [
    IconComponent,
    ButtonLink,
    TooltipDirective,
    RouterLink, 
    RouterLinkActive, 
  ],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  isCollapsed = signal(false);

  menuItems = [
    { path: 'search', label: 'Search', icon: 'search.svg' },
    { path: 'loans', label: 'Loans', icon: 'book-open.svg' },
    { path: 'favorites', label: 'Favorites', icon: 'heart.svg' },
  ];

  toggleSidebar() {
    this.isCollapsed.update(v => !v);
  }
}
