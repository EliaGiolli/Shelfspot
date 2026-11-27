
import {
  Component,
  ElementRef,
  inject,
  viewChild,
  viewChildren,
} from '@angular/core';

import { FavoriteService } from '../../../core/services/favorites.service';
import { CardComponent } from '../../../shared/components/card/card';
import { Button } from '../../../shared/components/button/button';
import { IconComponent } from '../../../shared/components/icon/icon';
import { CoverFallbackPipe } from '../../../shared/pipes/cover-fallback-pipe-pipe';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    CardComponent,
    Button,
    IconComponent,
    CoverFallbackPipe
  ],
  templateUrl: './favorite-page.html'
})
export class FavoritePage {
  readonly favService = inject(FavoriteService);

  private readonly removeButtons =
    viewChildren<Button, ElementRef<HTMLElement>>('removeButton', {
      read: ElementRef,
    });

  private readonly emptyStateHeading =
    viewChild<ElementRef<HTMLHeadingElement>>('emptyStateHeading');

  async removeFavorite(bookId: string): Promise<void> {
    const favorites = this.favService.favorites();
    const currentIndex = favorites.findIndex(book => book.id === bookId);

    if (currentIndex === -1) return;

    const book = favorites[currentIndex];

    const success = await this.favService.toggleFavorite(book);

    if (!success) return;

    requestAnimationFrame(() => {
      const remainingButtons = this.removeButtons();

      if (remainingButtons.length > 0) {
        const nextIndex = Math.min(
          currentIndex,
          remainingButtons.length - 1
        );

        remainingButtons[nextIndex]
          .nativeElement
          .querySelector('button')
          ?.focus();
        return;
      }

      this.emptyStateHeading()?.nativeElement.focus();
    });
  }
}
