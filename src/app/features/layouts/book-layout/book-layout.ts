import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon';
import { CommonModule } from '@angular/common';
import { TooltipDirective } from '../../../shared/directives/tooltip.directive';
import { Sidebar } from '../../book-search/sidebar/sidebar';

@Component({
  selector: 'app-book-layout',
  standalone: true,
  imports: [
    RouterOutlet, 
    CommonModule,
    Sidebar
  ],
  templateUrl: './book-layout.html',
  styleUrl: './book-layout.css',
})
export class BookLayout {}