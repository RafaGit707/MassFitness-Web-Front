import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarClaseDialogComponent } from './editar-clase-dialog.component';

describe('EditarClaseDialogComponent', () => {
  let component: EditarClaseDialogComponent;
  let fixture: ComponentFixture<EditarClaseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarClaseDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarClaseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
