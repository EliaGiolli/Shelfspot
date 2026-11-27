
import { Component, inject } from '@angular/core';
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
}
