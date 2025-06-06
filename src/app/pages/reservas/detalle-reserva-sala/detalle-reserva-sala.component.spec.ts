import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleReservaSalaComponent } from './detalle-reserva-sala.component';

describe('DetalleReservaSalaComponent', () => {
  let component: DetalleReservaSalaComponent;
  let fixture: ComponentFixture<DetalleReservaSalaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetalleReservaSalaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleReservaSalaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
