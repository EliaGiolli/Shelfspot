import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import {
  AppLiveRegionDirective,
  type LiveRegionMode
} from './app-live-region.directive';

@Component({
  standalone: true,
  imports: [AppLiveRegionDirective],
  template: `
    <p [appLiveRegion]="mode()">
      Feedback message
    </p>
  `
})
class TestHostComponent {
  mode = signal<LiveRegionMode>('polite');
}

describe('AppLiveRegionDirective', () => {
  async function createComponent(mode: LiveRegionMode = 'polite') {
    const fixture = TestBed.createComponent(TestHostComponent);

    fixture.componentInstance.mode.set(mode);
    fixture.detectChanges();

    return fixture;
  }

  it('should create the directive', async () => {
    const fixture = await createComponent();

    expect(fixture.nativeElement.querySelector('p')).toBeTruthy();
  });

  it('should set status role and polite announcement by default', async () => {
    const fixture = await createComponent();

    const element = fixture.nativeElement.querySelector('p');

    expect(element.getAttribute('role')).toBe('status');
    expect(element.getAttribute('aria-live')).toBe('polite');
  });

  it('should set alert role for assertive announcements', async () => {
    const fixture = await createComponent('assertive');

    const element = fixture.nativeElement.querySelector('p');

    expect(element.getAttribute('role')).toBe('alert');
    expect(element.getAttribute('aria-live')).toBe('assertive');
  });

  it('should disable announcements when mode is off', async () => {
    const fixture = await createComponent('off');

    const element = fixture.nativeElement.querySelector('p');

    expect(element.hasAttribute('role')).toBe(false);
    expect(element.getAttribute('aria-live')).toBe('off');
  });

  it('should update attributes when the mode changes', async () => {
    const fixture = await createComponent('polite');
    const element = fixture.nativeElement.querySelector('p');

    expect(element.getAttribute('role')).toBe('status');

    fixture.componentInstance.mode.set('assertive');
    fixture.detectChanges();

    expect(element.getAttribute('role')).toBe('alert');
    expect(element.getAttribute('aria-live')).toBe('assertive');
  });

  it('should preserve the host content', async () => {
    const fixture = await createComponent();

    const element = fixture.nativeElement.querySelector('p');

    expect(element.textContent.trim()).toBe('Feedback message');
  });
});
