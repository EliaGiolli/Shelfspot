
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { BentoGrid } from './bento-grid';
import { LOANS_REPOSITORY } from '../../../../core/tokens/loans-repository.token';

describe('BentoGrid', () => {
  let component: BentoGrid;
  let fixture: ComponentFixture<BentoGrid>;
  let router: Router;
  let navigateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BentoGrid],
      providers: [
        provideRouter([]),
        {
          provide: LOANS_REPOSITORY,
          useValue: {
            getAll: vi.fn().mockResolvedValue([]),
            saveAll: vi.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BentoGrid);
    component = fixture.componentInstance;

    router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigate');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onSearch()', () => {
    it('should navigate to the search page with a valid query', () => {
      component.searchQuery.set('Dune');

      component.onSearch();

      expect(navigateSpy).toHaveBeenCalledWith(
        ['/books/search'],
        {
          queryParams: { q: 'Dune' },
        },
      );
    });

    it('should trim whitespace from the search query', () => {
      component.searchQuery.set('  Dune  ');

      component.onSearch();

      expect(navigateSpy).toHaveBeenCalledWith(
        ['/books/search'],
        {
          queryParams: { q: 'Dune' },
        },
      );
    });

    it('should not navigate when the query contains fewer than three characters', () => {
      component.searchQuery.set('Du');

      component.onSearch();

      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('should not navigate when the query contains only whitespace', () => {
      component.searchQuery.set('   ');

      component.onSearch();

      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('should navigate when the query contains exactly three characters', () => {
      component.searchQuery.set('Dun');

      component.onSearch();

      expect(navigateSpy).toHaveBeenCalledWith(
        ['/books/search'],
        {
          queryParams: { q: 'Dun' },
        },
      );
    });
  });

  describe('searchQuery', () => {
    it('should initialize with an empty string', () => {
      expect(component.searchQuery()).toBe('');
    });

    it('should update when the user enters a search query', () => {
      const input: HTMLInputElement =
        fixture.nativeElement.querySelector('#quick-search-input');

      input.value = 'Dune';
      input.dispatchEvent(new Event('input'));

      expect(component.searchQuery()).toBe('Dune');
    });
  });
});
