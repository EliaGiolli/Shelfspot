
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ButtonLink } from './button-links';

@Component({
  standalone: true,
  imports: [ButtonLink],
  template: `
    <app-button-link>Homepage</app-button-link>
  `,
})
class TestHost {}

describe('ButtonLink', () => {
  let component: ButtonLink;
  let fixture: ComponentFixture<ButtonLink>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonLink],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonLink);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const getLink = (): HTMLAnchorElement => {
    const link = (fixture.nativeElement as HTMLElement)
      .querySelector('a');

    if (!link) {
      throw new Error('Link element not found');
    }

    return link;
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render projected content', async () => {
    const hostFixture = TestBed.createComponent(TestHost);
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    expect(
      (hostFixture.nativeElement as HTMLElement)
        .querySelector('a')
        ?.textContent?.trim(),
    ).toBe('Homepage');
  });

  describe('Variants', () => {
    it('should apply the primary variant by default', () => {
      expect(getLink().className).toContain('btn-primary');
      expect(getLink().className).toContain('shadow-lg');
    });

    it('should apply the accent variant', () => {
      fixture.componentRef.setInput('variant', 'accent');
      fixture.detectChanges();

      expect(getLink().className).toContain('btn-error');
      expect(getLink().className).toContain('text-white');
    });

    it('should apply the outline variant', () => {
      fixture.componentRef.setInput('variant', 'outline');
      fixture.detectChanges();

      expect(getLink().className).toContain('btn-ghost');
    });
  });

  describe('Active classes', () => {
    it('should apply custom active classes', () => {
      fixture.componentRef.setInput(
        'activeClasses',
        'bg-accent text-white',
      );
      fixture.detectChanges();

      expect(getLink().className).toContain('bg-accent');
      expect(getLink().className).toContain('text-white');
    });

    it('should not apply active classes by default', () => {
      expect(getLink().className).not.toContain('bg-accent');
    });
  });

  describe('Link attributes', () => {
    it('should apply the href input', () => {
      fixture.componentRef.setInput('href', 'https://example.com');
      fixture.detectChanges();

      expect(getLink().getAttribute('href')).toBe(
        'https://example.com',
      );
    });

    it('should apply the aria-label input', () => {
      fixture.componentRef.setInput('ariaLabel', 'Open homepage');
      fixture.detectChanges();

      expect(getLink().getAttribute('aria-label')).toBe(
        'Open homepage',
      );
    });
  });

  describe('Disabled state', () => {
    it('should mark the link as disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      expect(getLink().getAttribute('aria-disabled')).toBe('true');
      expect(getLink().getAttribute('tabindex')).toBe('-1');
      expect(getLink().getAttribute('href')).toBeNull();
    });

    it('should remove disabled attributes when enabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      fixture.componentRef.setInput('disabled', false);
      fixture.detectChanges();

      expect(getLink().getAttribute('aria-disabled')).toBeNull();
      expect(getLink().getAttribute('tabindex')).toBeNull();
    });
  });
});
