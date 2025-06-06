import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeleccionReservaComponent } from './seleccion-reserva.component';

describe('SeleccionReservaComponent', () => {
  let component: SeleccionReservaComponent;
  let fixture: ComponentFixture<SeleccionReservaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeleccionReservaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeleccionReservaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
