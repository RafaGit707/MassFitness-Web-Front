import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarMiPerfilDialogComponent } from './editar-mi-perfil-dialog.component';

describe('EditarMiPerfilDialogComponent', () => {
  let component: EditarMiPerfilDialogComponent;
  let fixture: ComponentFixture<EditarMiPerfilDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarMiPerfilDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarMiPerfilDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
