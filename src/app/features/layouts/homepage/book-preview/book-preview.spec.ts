import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookPreview } from './book-preview';

describe('BookPreview', () => {
  let component: BookPreview;
  let fixture: ComponentFixture<BookPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookPreview],
    }).compileComponents();

    fixture = TestBed.createComponent(BookPreview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
