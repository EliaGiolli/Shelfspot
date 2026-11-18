import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
}

@Injectable({ providedIn: 'root' })
export class ContactsService {

  sendMessage(data: ContactMessage): Observable<ContactResponse> {
    console.log('Contact message:', data);

    return of({ success: true }).pipe(
      delay(1500)
    );
  }
}
