
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';

import { Herosection } from './herosection';

describe('Herosection', () => {
  let component: Herosection;
  let fixture: ComponentFixture<Herosection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Herosection],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Herosection);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Content rendering', () => {
    it('should display the main heading', () => {
      const heading: HTMLElement =
        fixture.nativeElement.querySelector('h1');

      expect(heading).toBeTruthy();
      expect(heading.textContent).toContain('Stories worth');
      expect(heading.textContent).toContain('keeping close.');
    });

    it('should display the introductory text', () => {
      const paragraph: HTMLElement =
        fixture.nativeElement.querySelector('p.text-base-content\\/70');

      expect(paragraph).toBeTruthy();
      expect(paragraph.textContent).toContain(
        'A considered collection of fiction',
      );
    });

    it('should display the library tagline', () => {
      const tagline: HTMLElement =
        fixture.nativeElement.querySelector('p.text-xs');

      expect(tagline.textContent).toContain('Your Personal Library');
      expect(tagline.textContent).toContain('Est. 2024');
    });
  });

  describe('Navigation', () => {
    it('should provide a link to the book collection', () => {
      const link: HTMLElement =
        fixture.nativeElement.querySelector(
          'app-button-link[routerLink="/books/search"]',
        );

      expect(link).toBeTruthy();
    });

    it('should provide a link to the contact page', () => {
      const link: HTMLElement =
        fixture.nativeElement.querySelector(
          'app-button-link[routerLink="/contacts"]',
        );

      expect(link).toBeTruthy();
    });
  });

  describe('Hero image', () => {
    it('should render the library image with descriptive alternative text', () => {
      const image: HTMLImageElement =
        fixture.nativeElement.querySelector('img');

      expect(image).toBeTruthy();
      expect(image.getAttribute('src')).toBe(
        'assets/library-hero-section.jpg',
      );
      expect(image.alt).toBe(
        'Stacks of books arranged on a warm wooden shelf in a sunlit library',
      );
    });
  });
});
