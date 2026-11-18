
import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

// Custom Components
import { Button } from '../../shared/components/button/button';
import { IconComponent } from '../../shared/components/icon/icon';
import { FormComponent } from '../../shared/components/form/form-component';

// Services and Validators
import { ContactsService } from '../../core/services/contacts.service';
import { professionalEmailValidator } from '../../shared/validators/signal-validator';

// Types
import { FormStatus } from '../../shared/types/custom-components-types';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Button,
    IconComponent,
    FormComponent
  ],
  templateUrl: './contacts.html'
})
export class Contacts {
  private fb = inject(FormBuilder);
  private contactService = inject(ContactsService);

  protected status = signal<FormStatus>(FormStatus.idle);

  protected contactForm = this.fb.nonNullable.group({
    name: ['', [
      Validators.required,
      Validators.minLength(3)
    ]],
    email: ['', [
      Validators.required,
      Validators.email,
      professionalEmailValidator()
    ]],
    message: ['', [
      Validators.required,
      Validators.minLength(10)
    ]]
  });

  protected sendContact(): void {
    if (this.contactForm.invalid || this.status() === FormStatus.sending) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.status.set(FormStatus.sending);

    this.contactService.sendMessage(this.contactForm.getRawValue()).subscribe({
      next: () => {
        this.status.set(FormStatus.success);
        this.contactForm.reset();

        setTimeout(() => {
          this.status.set(FormStatus.idle);
        }, 3000);
      },
      error: (error) => {
        console.error('Error sending contact message:', error);
        this.status.set(FormStatus.error);
      }
    });
  }
}
