
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBookInput } from './search-book-input';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('SearchBookInput', () => {
  let component: SearchBookInput;
  let fixture: ComponentFixture<SearchBookInput>;
  let inputElement: HTMLInputElement;
  let submitButton: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBookInput]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBookInput);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();

    inputElement = fixture.nativeElement.querySelector('input');
    submitButton = fixture.nativeElement.querySelector('button');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should initialize with an empty query', () => {
      expect(component.query()).toBe('');
      expect(inputElement.value).toBe('');
    });

    it('should initialize the input with the provided initial query', async () => {
      fixture.componentRef.setInput('initialQuery', 'Dune');

      fixture.detectChanges();
      await fixture.whenStable();

      expect(inputElement.value).toBe('Dune');
      expect(component.query()).toBe('Dune');
    });
  });

  describe('query validation', () => {
    it('should update the query when the user types', () => {
      inputElement.value = 'Dune';
      inputElement.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      expect(component.query()).toBe('Dune');
    });

    it('should allow searching when the query has at least 3 characters', () => {
      inputElement.value = 'Dune';
      inputElement.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      expect(component.canSearch()).toBe(true);
      expect(submitButton.disabled).toBe(false);
    });

    it('should prevent searching when the query has fewer than 3 characters', () => {
      inputElement.value = 'Du';
      inputElement.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      expect(component.canSearch()).toBe(false);
      expect(submitButton.disabled).toBe(true);
    });

    it('should prevent searching when the query contains only whitespace', () => {
      inputElement.value = '   ';
      inputElement.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      expect(component.canSearch()).toBe(false);
      expect(submitButton.disabled).toBe(true);
    });

    it('should display a validation message for queries shorter than 3 characters', () => {
      inputElement.value = 'Du';
      inputElement.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain(
        'Enter at least 3 characters to search.'
      );
    });

    it('should not display the validation message when the query is empty', () => {
      expect(fixture.nativeElement.textContent).not.toContain(
        'Enter at least 3 characters to search.'
      );
    });
  });

  describe('accessibility', () => {
    it('should associate the input with the validation message', () => {
      expect(inputElement.getAttribute('aria-describedby')).toBe(
        'search-validation-message'
      );
    });

    it('should expose the validation message as a polite live region', () => {
      const message = fixture.nativeElement.querySelector(
        '#search-validation-message'
      );

      expect(message).toBeTruthy();
      expect(message.getAttribute('role')).toBe('status');
      expect(message.getAttribute('aria-live')).toBe('polite');
    });

    it('should keep the validation message container in the DOM when empty', () => {
      const message = fixture.nativeElement.querySelector(
        '#search-validation-message'
      );

      expect(message).toBeTruthy();
      expect(message.textContent.trim()).toBe('');
    });
  });

  describe('search submission', () => {
    it('should emit the search event with the trimmed query', () => {
      const searchSpy = vi.fn();
      component.search.subscribe(searchSpy);

      inputElement.value = '  Dune  ';
      inputElement.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      component.submitSearch();

      expect(searchSpy).toHaveBeenCalledOnce();
      expect(searchSpy).toHaveBeenCalledWith('Dune');
    });

    it('should not emit the search event when the query is shorter than 3 characters', () => {
      const searchSpy = vi.fn();
      component.search.subscribe(searchSpy);

      inputElement.value = 'Du';
      inputElement.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      component.submitSearch();

      expect(searchSpy).not.toHaveBeenCalled();
    });

    it('should not emit the search event when the query contains only whitespace', () => {
      const searchSpy = vi.fn();
      component.search.subscribe(searchSpy);

      inputElement.value = '   ';
      inputElement.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      component.submitSearch();

      expect(searchSpy).not.toHaveBeenCalled();
    });
  });
});
