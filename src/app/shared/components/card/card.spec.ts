import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { CardComponent } from './card';

describe('CardComponent', () => {
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);

    fixture.componentRef.setInput('titleId', 'test-card-title');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render an article element', () => {
    const article = fixture.nativeElement.querySelector('article');

    expect(article).toBeTruthy();
  });

  it('should associate the article with its title using aria-labelledby', () => {
    const article = fixture.nativeElement.querySelector('article');

    expect(article.getAttribute('aria-labelledby')).toBe('test-card-title');
  });

  it('should render the header, body and footer content', () => {
    const article = fixture.nativeElement.querySelector('article');

    expect(article.querySelector('[card-header]')).toBeTruthy();
    expect(article.querySelector('[card-body]')).toBeTruthy();
    expect(article.querySelector('[card-footer]')).toBeTruthy();
  });

  it('should apply the default card variant', () => {
    const article = fixture.nativeElement.querySelector('article');

    expect(article.className).toContain('default');
  });

  it('should update the card classes when the variant changes', () => {
    fixture.componentRef.setInput('variant', 'compact');
    fixture.detectChanges();

    const article = fixture.nativeElement.querySelector('article');

    expect(article.className).toContain('compact');
  });
});