import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearEspacioDialogComponent } from './crear-espacio-dialog.component';

describe('CrearEspacioDialogComponent', () => {
  let component: CrearEspacioDialogComponent;
  let fixture: ComponentFixture<CrearEspacioDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearEspacioDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearEspacioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
