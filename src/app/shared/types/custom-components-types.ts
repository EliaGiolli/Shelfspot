// Buttons
export type ButtonVariant = 'primary' | 'accent' | 'outline'; // This is used inside the btn-custom-variants.ts file as well
// Input fields
export type InputVariant = 'default' | 'search';
// Card
export type CardVariant = 'default' | 'featured' | 'compact';
// Form-Contacts
export type FormVariant = 'default' | 'auth';

export enum FormStatus {
    idle = 'idle', 
    sending = 'sending',
    success = 'success',
    error ='error'
} 

export interface ContactsFormTypes {
    name: string,
    email:string,
    message?: string
    formStatus: FormStatus
}
