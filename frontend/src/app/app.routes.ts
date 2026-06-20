import { Routes } from '@angular/router';
import { Dashboard } from './views/dashboard';
import { Ingredientes } from './views/ingredientes';
import { Productos } from './views/productos';
import { Clientes } from './views/clientes';
import { Ventas } from './views/ventas';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'ingredientes', component: Ingredientes },
  { path: 'productos', component: Productos },
  { path: 'clientes', component: Clientes },
  { path: 'ventas', component: Ventas },
  { path: '**', redirectTo: '' }
];

