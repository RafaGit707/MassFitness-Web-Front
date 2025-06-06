import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollVideoComponent } from './scroll-video.component';

describe('ScrollVideoComponent', () => {
  let component: ScrollVideoComponent;
  let fixture: ComponentFixture<ScrollVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScrollVideoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScrollVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
