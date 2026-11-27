
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InputComponent } from './input';
import { CustomInput } from '../../utils/input-custom-variants';

describe('InputComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(InputComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render an input element', () => {
    const fixture = TestBed.createComponent(InputComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('input')).toBeTruthy();
  });

  it('should apply the default input variant classes', () => {
    const fixture = TestBed.createComponent(InputComponent);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    const expectedClasses = CustomInput.variants.default.split(' ');

    expectedClasses.forEach(className => {
      expect(input.classList).toContain(className);
    });
  });

  it('should apply the search variant classes', () => {
    const fixture = TestBed.createComponent(InputComponent);
    fixture.componentRef.setInput('variant', 'search');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');
    const expectedClasses = CustomInput.variants.search.split(' ');

    expectedClasses.forEach(className => {
      expect(input.classList).toContain(className);
    });
  });

  it('should apply the focus-visible styles', () => {
    const fixture = TestBed.createComponent(InputComponent);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');

    expect(input.classList).toContain('focus-visible:outline-2');
    expect(input.classList).toContain('focus-visible:outline-offset-2');
    expect(input.classList).toContain('focus-visible:outline-accent');
  });

  it('should apply the custom input type', () => {
    const fixture = TestBed.createComponent(InputComponent);
    fixture.componentRef.setInput('type', 'email');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');

    expect(input.getAttribute('type')).toBe('email');
  });

  it('should apply the custom id', () => {
    const fixture = TestBed.createComponent(InputComponent);
    fixture.componentRef.setInput('id', 'email-input');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');

    expect(input.getAttribute('id')).toBe('email-input');
  });

  it('should apply the placeholder', () => {
    const fixture = TestBed.createComponent(InputComponent);
    fixture.componentRef.setInput('placeholder', 'Enter your email');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');

    expect(input.getAttribute('placeholder')).toBe('Enter your email');
  });

  it('should apply the accessible label', () => {
    const fixture = TestBed.createComponent(InputComponent);
    fixture.componentRef.setInput('ariaLabel', 'Email address');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');

    expect(input.getAttribute('aria-label')).toBe('Email address');
  });

  it('should update the value when the user types', () => {
    const fixture = TestBed.createComponent(InputComponent);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.value = 'test@example.com';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('test@example.com');
  });

  it('should write an external value to the input', () => {
    const fixture = TestBed.createComponent(InputComponent);
    fixture.componentInstance.writeValue('test@example.com');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(input.value).toBe('test@example.com');
  });

  it('should notify the registered change callback', () => {
    const fixture = TestBed.createComponent(InputComponent);
    const onChange = vi.fn();

    fixture.componentInstance.registerOnChange(onChange);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    input.value = 'new-value';
    input.dispatchEvent(new Event('input'));

    expect(onChange).toHaveBeenCalledWith('new-value');
  });

  it('should notify the touched callback on blur', () => {
    const fixture = TestBed.createComponent(InputComponent);
    const onTouched = vi.fn();

    fixture.componentInstance.registerOnTouched(onTouched);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new Event('blur'));

    expect(onTouched).toHaveBeenCalledOnce();
  });

  it('should disable the input when setDisabledState is called', () => {
    const fixture = TestBed.createComponent(InputComponent);

    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(input.disabled).toBe(true);
  });

  it('should enable the input when setDisabledState is false', () => {
    const fixture = TestBed.createComponent(InputComponent);

    fixture.componentInstance.setDisabledState(true);
    fixture.componentInstance.setDisabledState(false);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(input.disabled).toBe(false);
  });

  it('should set aria-describedby when provided', () => {
    const fixture = TestBed.createComponent(InputComponent);
    fixture.componentRef.setInput('ariaDescribedBy', 'search-validation-message');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input');

    expect(input.getAttribute('aria-describedby')).toBe(
      'search-validation-message'
    );
  });
});
