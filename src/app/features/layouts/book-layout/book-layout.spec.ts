import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';

import { BookLayout } from './book-layout';
import { BOOK_NAV_ITEMS } from '../../../shared/config/navigation.config';

describe('BookLayout', () => {
  let component: BookLayout;
  let fixture: ComponentFixture<BookLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookLayout],
      providers: [provideRouter([{ path: '**', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(BookLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with sidebar collapsed and drawer closed', () => {
    expect(component.isCollapsed()).toBe(true);
    expect(component.isDrawerOpen()).toBe(false);
  });

  it('should toggle sidebar collapsed state', () => {
    component.toggleSidebar();
    expect(component.isCollapsed()).toBe(false);

    component.toggleSidebar();
    expect(component.isCollapsed()).toBe(true);
  });

  it('should render all centralized book navigation items', () => {
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll(
      'aside nav app-button-link',
    );
    expect(links.length).toBe(BOOK_NAV_ITEMS.length);
  });

  it('should close the drawer when clicking a navigation link', async () => {
    component.isDrawerOpen.set(true);
    fixture.detectChanges();

    const firstLink = (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>(
      'aside nav app-button-link a',
    );
    expect(firstLink).toBeTruthy();

    firstLink!.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.isDrawerOpen()).toBe(false);
  });
});
