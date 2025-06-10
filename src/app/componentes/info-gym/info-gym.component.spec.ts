import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoGymComponent } from './info-gym.component';

describe('InfoGymComponent', () => {
  let component: InfoGymComponent;
  let fixture: ComponentFixture<InfoGymComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoGymComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoGymComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
