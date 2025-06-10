import { TestBed } from '@angular/core/testing';

import { ModalAuthService } from './modal-auth.service';

describe('ModalAuthService', () => {
  let service: ModalAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
