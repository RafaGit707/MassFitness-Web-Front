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
    PerfilDeUsuarioComponent
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
    MatSnackBarModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
