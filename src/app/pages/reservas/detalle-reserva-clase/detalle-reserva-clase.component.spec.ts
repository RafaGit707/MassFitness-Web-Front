import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleReservaClaseComponent } from './detalle-reserva-clase.component';

describe('DetalleReservaClaseComponent', () => {
  let component: DetalleReservaClaseComponent;
  let fixture: ComponentFixture<DetalleReservaClaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetalleReservaClaseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleReservaClaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
