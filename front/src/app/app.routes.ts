import { Routes, provideRouter } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GridComponent } from './grid/grid.component';
import { CadastroComponent } from './cadastro/cadastro.component';
import { DetalhesComponent } from './detalhes/detalhes.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent }, 
  { path: 'grid', component: GridComponent },
  { path: 'cadastro', component: CadastroComponent },
  { path: 'detalhes/:id', component: DetalhesComponent },
  { path: 'dashboard', component: DashboardComponent }
];

export const appRouting = provideRouter(routes);
