
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';

import { Navbar } from './navbar';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  const getMenuButton = (): HTMLButtonElement => {
    const button = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLButtonElement>(
      'button[aria-controls="main-navigation"]',
    );

    if (!button) {
      throw new Error('Mobile menu button not found');
    }

    return button;
  };

  const getNavigation = (): HTMLElement => {
    const navigation = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLElement>('#main-navigation');

    if (!navigation) {
      throw new Error('Main navigation not found');
    }

    return navigation;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize the mobile menu as closed', () => {
      expect(component.isMenuOpen()).toBe(false);
    });

    it('should display the mobile menu button', () => {
      expect(getMenuButton()).toBeTruthy();
    });

    it('should initialize the menu button with the correct accessibility attributes', () => {
      const button = getMenuButton();

      expect(button.getAttribute('aria-expanded')).toBe('false');
      expect(button.getAttribute('aria-controls')).toBe('main-navigation');
      expect(button.getAttribute('aria-label')).toBe(
        'Open navigation menu',
      );
    });
  });

  describe('Mobile menu visibility', () => {
    it('should initially hide the mobile navigation', () => {
      const navigation = getNavigation();

      expect(navigation.classList.contains('invisible')).toBe(true);
      expect(navigation.classList.contains('opacity-0')).toBe(true);
      expect(navigation.classList.contains('max-h-0')).toBe(true);
    });

    it('should open the mobile menu when clicking the menu button', () => {
      getMenuButton().click();
      fixture.detectChanges();

      expect(component.isMenuOpen()).toBe(true);
    });

    it('should display the navigation when the menu is open', () => {
      getMenuButton().click();
      fixture.detectChanges();

      const navigation = getNavigation();

      expect(navigation.classList.contains('visible')).toBe(true);
      expect(navigation.classList.contains('opacity-100')).toBe(true);
      expect(navigation.classList.contains('overflow-y-auto')).toBe(true);
    });

    it('should update accessibility attributes when opening the menu', () => {
      getMenuButton().click();
      fixture.detectChanges();

      const button = getMenuButton();

      expect(button.getAttribute('aria-expanded')).toBe('true');
      expect(button.getAttribute('aria-label')).toBe(
        'Close navigation menu',
      );
    });

    it('should close the mobile menu when clicking the menu button again', () => {
      const button = getMenuButton();

      button.click();
      fixture.detectChanges();

      button.click();
      fixture.detectChanges();

      expect(component.isMenuOpen()).toBe(false);
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('Navigation links', () => {
    it('should display all navigation links', () => {
      const links = (
        fixture.nativeElement as HTMLElement
      ).querySelectorAll('nav app-button-link');

      expect(links.length).toBe(5);
    });

    it('should provide a link to the homepage', () => {
      const link = (
        fixture.nativeElement as HTMLElement
      ).querySelector('app-button-link[routerLink="/"]');

      expect(link).toBeTruthy();
    });

    it('should provide a link to book search', () => {
      const link = (
        fixture.nativeElement as HTMLElement
      ).querySelector('app-button-link[routerLink="/books/search"]');

      expect(link).toBeTruthy();
    });

    it('should provide a link to favorites', () => {
      const link = (
        fixture.nativeElement as HTMLElement
      ).querySelector('app-button-link[routerLink="/books/favorites"]');

      expect(link).toBeTruthy();
    });

    it('should provide a link to loans', () => {
      const link = (
        fixture.nativeElement as HTMLElement
      ).querySelector('app-button-link[routerLink="/books/loans"]');

      expect(link).toBeTruthy();
    });

    it('should provide a link to contacts', () => {
      const link = (
        fixture.nativeElement as HTMLElement
      ).querySelector('app-button-link[routerLink="/contacts"]');

      expect(link).toBeTruthy();
    });

    it('should close the menu after selecting a navigation link', () => {
      getMenuButton().click();
      fixture.detectChanges();

      const link = getNavigation().querySelector<HTMLAnchorElement>(
        'app-button-link a',
      );

      expect(link).toBeTruthy();

      link!.click();
      fixture.detectChanges();

      expect(component.isMenuOpen()).toBe(false);
    });
  });

  describe('Focus management', () => {
    it('should return focus to the menu button when closing the menu', () => {
      const button = getMenuButton();

      button.click();
      fixture.detectChanges();

      const link = getNavigation().querySelector<HTMLAnchorElement>(
        'app-button-link a',
      );

      expect(link).toBeTruthy();

      link!.focus();
      expect(document.activeElement).toBe(link);

      component.closeMenu();
      fixture.detectChanges();

      expect(document.activeElement).toBe(button);
    });

    it('should return focus to the menu button after selecting a navigation link', () => {
      const button = getMenuButton();

      button.click();
      fixture.detectChanges();

      const link = getNavigation().querySelector<HTMLAnchorElement>(
        'app-button-link a',
      );

      expect(link).toBeTruthy();

      link!.click();
      fixture.detectChanges();

      expect(document.activeElement).toBe(button);
    });
  });

  describe('Responsive layout', () => {
    it('should hide the mobile menu button on medium and larger screens', () => {
      expect(getMenuButton().classList.contains('md:hidden')).toBe(true);
    });

    it('should display navigation horizontally on medium and larger screens', () => {
      const navigation = getNavigation();

      expect(navigation.classList.contains('md:flex-row')).toBe(true);
      expect(navigation.classList.contains('md:static')).toBe(true);
      expect(navigation.classList.contains('md:visible')).toBe(true);
      expect(navigation.classList.contains('md:opacity-100')).toBe(true);
    });

    it('should use the elevated surface background for the mobile navigation', () => {
      expect(
        getNavigation().classList.contains('bg-surface-elevated'),
      ).toBe(true);
    });
  });

  describe('Menu toggle', () => {
    it('should open and close the menu using the toggle method', () => {
      component.toggleMenu();

      expect(component.isMenuOpen()).toBe(true);

      component.toggleMenu();

      expect(component.isMenuOpen()).toBe(false);
    });

    it('should expose the correct menu icon names', () => {
      expect(component.MENU_ICON).toBe('menu.svg');
      expect(component.CLOSE_ICON).toBe('x.svg');
    });
  });
});
