import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaEntrenadoresComponent } from './lista-entrenadores.component';

describe('ListaEntrenadoresComponent', () => {
  let component: ListaEntrenadoresComponent;
  let fixture: ComponentFixture<ListaEntrenadoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaEntrenadoresComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaEntrenadoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
