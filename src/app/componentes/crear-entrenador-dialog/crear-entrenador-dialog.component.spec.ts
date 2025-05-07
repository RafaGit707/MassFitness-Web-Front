import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearEntrenadorDialogComponent } from './crear-entrenador-dialog.component';

describe('CrearEntrenadorDialogComponent', () => {
  let component: CrearEntrenadorDialogComponent;
  let fixture: ComponentFixture<CrearEntrenadorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearEntrenadorDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearEntrenadorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
