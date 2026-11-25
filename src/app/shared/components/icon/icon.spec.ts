import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { IconComponent } from './icon';

describe('IconComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(IconComponent);

    fixture.componentRef.setInput('name', 'menu.svg');
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the correct image source path', () => {
    const fixture = TestBed.createComponent(IconComponent);

    fixture.componentRef.setInput('name', 'menu.svg');
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

    expect(image.getAttribute('src')).toBe('/assets/icons/menu.svg');
  });

  it('should apply custom dimensions', () => {
    const fixture = TestBed.createComponent(IconComponent);

    fixture.componentRef.setInput('name', 'mail.svg');
    fixture.componentRef.setInput('size', 50);
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

    expect(image.style.width).toBe('50px');
    expect(image.style.height).toBe('50px');
  });

  it('should have an empty alt and aria-hidden when decorative', () => {
    const fixture = TestBed.createComponent(IconComponent);

    fixture.componentRef.setInput('name', 'arrow-left.svg');
    fixture.componentRef.setInput('decorative', true);
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('img');

    expect(image.getAttribute('alt')).toBe('');
    expect(image.getAttribute('aria-hidden')).toBe('true');
  });

  it('should use the custom alt when the icon is informative', () => {
    const fixture = TestBed.createComponent(IconComponent);

    fixture.componentRef.setInput('name', 'search.svg');
    fixture.componentRef.setInput('alt', 'Search');
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('img');

    expect(image.getAttribute('alt')).toBe('Search');
    expect(image.getAttribute('aria-hidden')).toBeNull();
  });

  it('should use the filename as fallback alt when no custom alt is provided', () => {
    const fixture = TestBed.createComponent(IconComponent);

    fixture.componentRef.setInput('name', 'search.svg');
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('img');

    expect(image.getAttribute('alt')).toBe('search.svg icon');
  });
});