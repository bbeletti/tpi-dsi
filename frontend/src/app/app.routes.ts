import { Routes } from '@angular/router';
import { Seguimiento } from './views/seguimiento';

export const routes: Routes = [
  { path: '', component: Seguimiento },
  { path: '**', redirectTo: '' }
];
