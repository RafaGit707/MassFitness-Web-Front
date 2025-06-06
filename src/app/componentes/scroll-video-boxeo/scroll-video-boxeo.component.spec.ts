import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollVideoBoxeoComponent } from './scroll-video-boxeo.component';

describe('ScrollVideoBoxeoComponent', () => {
  let component: ScrollVideoBoxeoComponent;
  let fixture: ComponentFixture<ScrollVideoBoxeoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScrollVideoBoxeoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScrollVideoBoxeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
