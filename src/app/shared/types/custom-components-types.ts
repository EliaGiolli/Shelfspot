// Buttons
export type ButtonVariant = 'primary' | 'accent' | 'outline'; // This is used inside the btn-custom-variants.ts file as well

// Form-Contacts

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
