import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { CardComponent } from './card';
import { CustomCard } from '../../utils/card-custom-variants';

@Component({
  standalone: true,
  imports: [CardComponent],
  template: `
    <app-card titleId="test-card-title">
      <div card-header>
        <h2 id="test-card-title">Test title</h2>
      </div>

      <div card-body>
        <p>Test body</p>
      </div>

      <div card-footer>
        <button>Test action</button>
      </div>
    </app-card>
  `
})
class TestHostComponent {}

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
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();

    const article = hostFixture.nativeElement.querySelector('article');

    expect(article.querySelector('[card-header] h2').textContent.trim())
      .toBe('Test title');

    expect(article.querySelector('[card-body] p').textContent.trim())
      .toBe('Test body');

    expect(article.querySelector('[card-footer] button').textContent.trim())
      .toBe('Test action');
  });

  it('should apply the default card variant classes', () => {
    const article = fixture.nativeElement.querySelector('article');

    const expectedClasses = CustomCard.variants.default.split(' ');

    expectedClasses.forEach(className => {
      expect(article.classList).toContain(className);
    });
  });

  it('should update the card classes when the variant changes', () => {
    fixture.componentRef.setInput('variant', 'compact');
    fixture.detectChanges();

    const article = fixture.nativeElement.querySelector('article');

    const expectedClasses = CustomCard.variants.compact.split(' ');

    expectedClasses.forEach(className => {
      expect(article.classList).toContain(className);
    });
  });
});