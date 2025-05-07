import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarEntrenadorDialogComponent } from './editar-entrenador-dialog.component';

describe('EditarEntrenadorDialogComponent', () => {
  let component: EditarEntrenadorDialogComponent;
  let fixture: ComponentFixture<EditarEntrenadorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarEntrenadorDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarEntrenadorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
