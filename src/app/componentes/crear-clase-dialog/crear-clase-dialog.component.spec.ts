import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearClaseDialogComponent } from './crear-clase-dialog.component';

describe('CrearClaseDialogComponent', () => {
  let component: CrearClaseDialogComponent;
  let fixture: ComponentFixture<CrearClaseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearClaseDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearClaseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
