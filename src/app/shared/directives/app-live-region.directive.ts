import { Directive, HostBinding, input } from '@angular/core';

export type LiveRegionMode = 'polite' | 'assertive' | 'off';

/**
 * Configures accessible live region attributes for dynamic announcements.
 */
@Directive({
  selector: '[appLiveRegion]',
  standalone: true
})
export class AppLiveRegionDirective {
  appLiveRegion = input<LiveRegionMode>('polite');

  @HostBinding('attr.role')
  get role(): string | null {
    switch (this.appLiveRegion()) {
      case 'polite':
        return 'status';
      case 'assertive':
        return 'alert';
      case 'off':
        return null;
    }
  }

  @HostBinding('attr.aria-live')
  get ariaLive(): LiveRegionMode {
    return this.appLiveRegion();
  }
}
