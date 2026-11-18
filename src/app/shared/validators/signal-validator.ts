// Check if the email belongs to a professional domain
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function professionalEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const email = control.value as string;

    if (!email) return null;

    const forbiddenDomains = ['test.com', 'dummy.it', 'spam.org'];
    const domain = email.split('@')[1]?.toLowerCase();

    return domain && forbiddenDomains.includes(domain)
      ? { professionalEmail: true }
      : null;
  };
}



  /**
 * Note: Zod could be used to centralize validation schemas and reuse them
 * across forms, API requests, and external data validation.
 * However, it is intentionally not introduced here because the current
 * complexity of this project does not justify the additional abstraction.
 * Angular's built-in validators are sufficient for the requirements of
 * this form.
 */