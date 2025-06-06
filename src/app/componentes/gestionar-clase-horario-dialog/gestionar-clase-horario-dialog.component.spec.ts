import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarClaseHorarioDialogComponent } from './gestionar-clase-horario-dialog.component';

describe('GestionarClaseHorarioDialogComponent', () => {
  let component: GestionarClaseHorarioDialogComponent;
  let fixture: ComponentFixture<GestionarClaseHorarioDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestionarClaseHorarioDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionarClaseHorarioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
