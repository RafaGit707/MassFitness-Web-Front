import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminGuard } from './auth/admin.guard';
import { PerfilDeUsuarioComponent } from './pages/perfil-de-usuario/perfil-de-usuario.component';
import { AuthGuard } from './auth/auth.guard';
import { ScrollVideoComponent } from './componentes/scroll-video/scroll-video.component';
import { ScrollVideoBoxeoComponent } from './componentes/scroll-video-boxeo/scroll-video-boxeo.component';
import { ListaClasesComponent } from './pages/reservas/lista-clases/lista-clases.component';
import { ListaSalasComponent } from './pages/reservas/lista-salas/lista-salas.component';
import { DetalleReservaClaseComponent } from './pages/reservas/detalle-reserva-clase/detalle-reserva-clase.component';
import { DetalleReservaSalaComponent } from './pages/reservas/detalle-reserva-sala/detalle-reserva-sala.component';
import { InfoGymComponent } from './componentes/info-gym/info-gym.component';
import { ListaEntrenadoresComponent } from './pages/lista-entrenadores/lista-entrenadores.component';


const routes: Routes = [
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'perfil',
    component: PerfilDeUsuarioComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '',
    component: ScrollVideoComponent,
  },
  // {
  //   path: '',
  //   component: InfoGymComponent,
  // },
  { path: 'entrenadores', component: ListaEntrenadoresComponent },
  {
    path: 'boxeo',
    component: ScrollVideoBoxeoComponent,
  },
  
  {
    path: 'reservar', // Ruta principal para la selección de tipo de reserva
    component: ScrollVideoComponent, // O SeleccionReservaComponent si creas uno nuevo
    canActivate: [AuthGuard] // Solo usuarios logueados pueden acceder a reservar
  },
  {
    path: 'reservar/clases', // Listado de clases
    component: ListaClasesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'reservar/salas', // Listado de salas
    component: ListaSalasComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'reservar/clase/:id', // Detalle y reserva de una clase específica (usa el ID de la clase)
    component: DetalleReservaClaseComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'reservar/sala/:id', // Detalle y reserva de una sala específica (usa el ID de la sala)
    component: DetalleReservaSalaComponent,
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
