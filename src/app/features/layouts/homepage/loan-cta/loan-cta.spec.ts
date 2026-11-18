import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanCta } from './loan-cta';

describe('LoanCta', () => {
  let component: LoanCta;
  let fixture: ComponentFixture<LoanCta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanCta],
    }).compileComponents();

    fixture = TestBed.createComponent(LoanCta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
