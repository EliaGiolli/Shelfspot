import { InjectionToken } from '@angular/core';
import type { LoansRepository } from '../../features/loans/repository/loans.repository';

export const LOANS_REPOSITORY = new InjectionToken<LoansRepository>(
  'LOANS_REPOSITORY'
);
