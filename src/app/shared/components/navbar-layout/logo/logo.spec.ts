import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideRouter } from '@angular/router';
import { Logo } from './logo';

describe('Logo', () => {
  let component: Logo;
  let fixture: ComponentFixture<Logo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Logo],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Logo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the ShelfSpot brand name', () => {
    const heading = fixture.nativeElement.querySelector('h2');

    expect(heading).toBeTruthy();
    expect(heading.textContent.trim()).toBe('ShelfSpot');
  });

  it('should render the logo image with an empty alt attribute by default', () => {
    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

    expect(image).toBeTruthy();
    expect(image.getAttribute('alt')).toBe('');
  });

  it('should use a custom alt attribute when provided', () => {
    fixture.componentRef.setInput('alt', 'ShelfSpot brand symbol');
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

    expect(image.getAttribute('alt')).toBe('ShelfSpot brand symbol');
  });

  it('should apply the configured image dimensions', () => {
    fixture.componentRef.setInput('size', 48);
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

    expect(image.style.width).toBe('48px');
    expect(image.style.height).toBe('48px');
  });

  it('should expose an accessible name on the home link', () => {
    const link = fixture.nativeElement.querySelector('a');

    expect(link).toBeTruthy();
    expect(link.getAttribute('aria-label')).toBe('ShelfSpot, home');
  });
});