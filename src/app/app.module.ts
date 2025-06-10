import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReservasComponent } from './componentes/reservas/reservas.component';
import { AuthComponent } from './componentes/auth/auth.component';
import { FooterComponent } from './componentes/footer/footer.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { ConfirmDialogComponent } from './componentes/confirm-dialog/confirm-dialog.component';
import { CrearUsuarioDialogComponent } from './componentes/crear-usuario-dialog/crear-usuario-dialog.component';
import { CommonModule } from '@angular/common';
import { EditarUsuarioDialogComponent } from './componentes/editar-usuario-dialog/editar-usuario-dialog.component';
import { CrearEntrenadorDialogComponent } from './componentes/crear-entrenador-dialog/crear-entrenador-dialog.component';
import { CrearEspacioDialogComponent } from './componentes/crear-espacio-dialog/crear-espacio-dialog.component';
import { EditarEntrenadorDialogComponent } from './componentes/editar-entrenador-dialog/editar-entrenador-dialog.component';
import { CrearClaseDialogComponent } from './componentes/crear-clase-dialog/crear-clase-dialog.component';
import { EditarClaseDialogComponent } from './componentes/editar-clase-dialog/editar-clase-dialog.component';
import { EditarEspacioDialogComponent } from './componentes/editar-espacio-dialog/editar-espacio-dialog.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { PerfilDeUsuarioComponent } from './pages/perfil-de-usuario/perfil-de-usuario.component';
import { ScrollVideoComponent } from './componentes/scroll-video/scroll-video.component';
import { ScrollVideoBoxeoComponent } from './componentes/scroll-video-boxeo/scroll-video-boxeo.component';
import { EditarMiPerfilDialogComponent } from './componentes/editar-mi-perfil-dialog/editar-mi-perfil-dialog.component';
import { SeleccionReservaComponent } from './pages/reservas/seleccion-reserva/seleccion-reserva.component';
import { ListaClasesComponent } from './pages/reservas/lista-clases/lista-clases.component';
import { ListaSalasComponent } from './pages/reservas/lista-salas/lista-salas.component';
import { DetalleReservaClaseComponent } from './pages/reservas/detalle-reserva-clase/detalle-reserva-clase.component';
import { DetalleReservaSalaComponent } from './pages/reservas/detalle-reserva-sala/detalle-reserva-sala.component';
import { MatListModule } from '@angular/material/list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { GestionarClaseHorarioDialogComponent } from './componentes/gestionar-clase-horario-dialog/gestionar-clase-horario-dialog.component';
import { InfoGymComponent } from './componentes/info-gym/info-gym.component';

@NgModule({
  declarations: [
    AppComponent,
    ReservasComponent,
    AuthComponent,
    FooterComponent,
    AdminDashboardComponent,
    ConfirmDialogComponent,
    CrearUsuarioDialogComponent,
    EditarUsuarioDialogComponent,
    CrearEntrenadorDialogComponent,
    CrearEspacioDialogComponent,
    EditarEntrenadorDialogComponent,
    CrearClaseDialogComponent,
    EditarClaseDialogComponent,
    EditarEspacioDialogComponent,
    PerfilDeUsuarioComponent,
    ScrollVideoComponent,
    ScrollVideoBoxeoComponent,
    EditarMiPerfilDialogComponent,
    SeleccionReservaComponent,
    ListaClasesComponent,
    ListaSalasComponent,
    DetalleReservaClaseComponent,
    DetalleReservaSalaComponent,
    GestionarClaseHorarioDialogComponent,
    InfoGymComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatListModule,
    MatDatepickerModule,
    MatNativeDateModule, 
    MatChipsModule,
    MatCardModule
    
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
