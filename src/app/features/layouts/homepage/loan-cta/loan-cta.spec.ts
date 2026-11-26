
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';

import { LoanCta } from './loan-cta';

describe('LoanCta', () => {
  let component: LoanCta;
  let fixture: ComponentFixture<LoanCta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanCta],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoanCta);
    component = fixture.componentInstance;

    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
