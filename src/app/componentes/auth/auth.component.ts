
import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { AuthService, User } from '../../servicios/auth.service';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  @ViewChild('headerElement') headerRef!: ElementRef;
  @ViewChild('containerHeader') containerRef!: ElementRef;

  loginData = { nombre_usuario: '', contrasena: '' };
  registroData = { nombre: '', correo_electronico: '', nombre_usuario: '', contrasena: '' };

  loggedIn: boolean = false;
  currentUserName: string = '';
  isAdmin: boolean = false;

  showLoginModal = false;
  showRegisterModal = false;
  isLoadingLogin = false;
  isLoadingRegister = false;
  loginError: string | null = null;
  registerError: string | null = null;

  passwordValidation = {
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
    valid: false
  };

  private userSubscription: Subscription | null = null;
  private adminSubscription: Subscription | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.loggedIn = !!user;
      this.currentUserName = user ? user.nombre_usuario : '';
      if (this.loggedIn) {
        this.closeModals();
      }
      console.log('AuthComponent: User state change detected', user);
    });

    // Subscribe to admin status changes from the service
    this.adminSubscription = this.authService.isAdmin$.subscribe(isAdmin => {
        this.isAdmin = isAdmin;
        console.log('AuthComponent: Admin status change detected', isAdmin);
    });

    // Initial state is set by the service constructor calling loadInitialAuthState()
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.userSubscription?.unsubscribe();
    this.adminSubscription?.unsubscribe();
    document.body.classList.remove("no-scroll");
  }

  openLogin(): void {
    this.closeModals();
    this.showLoginModal = true;
    this.loginError = null;
    this.loginData = { nombre_usuario: '', contrasena: '' };
    document.body.classList.add("no-scroll");
  }

  openRegister(): void {
    this.closeModals();
    this.showRegisterModal = true;
    this.registerError = null;
    this.clearRegisterForm();
    this.checkPasswordStrength('');
    document.body.classList.add("no-scroll");
  }

  closeModals(): void {
    this.showLoginModal = false;
    this.showRegisterModal = false;
    document.body.classList.remove("no-scroll");
  }

  onLoginSubmit(form: NgForm): void {
    if (!this.loginData.nombre_usuario || !this.loginData.contrasena) {
       this.loginError = "Por favor, rellena ambos campos.";
       form.controls['nombre_usuario']?.markAsTouched();
       form.controls['contrasena']?.markAsTouched();
       return;
    }
    this.isLoadingLogin = true;
    this.loginError = null;

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.isLoadingLogin = false;
        // State updates (loggedIn, currentUserName) are handled by the user$ subscription
        console.log('Login successful via component', response + " - " + response.usuario);
        // No need for window.location.reload()
      },
      error: (error) => {
        this.isLoadingLogin = false;
        this.loginError = error.message;
        console.error('Login failed via component', error);
      }
    });
  }

  onRegisterSubmit(form: NgForm): void {
    if (form.invalid || !this.passwordValidation.valid) {
       this.registerError = "Por favor, completa todos los campos correctamente y asegúrate que la contraseña cumpla los requisitos.";
       Object.keys(form.controls).forEach(field => form.controls[field].markAsTouched());
       return;
    }
    this.isLoadingRegister = true;
    this.registerError = null;

    this.authService.registrar(this.registroData).subscribe({
      next: (response) => {
        this.isLoadingRegister = false;
        // State updates handled by subscription
        console.log('Registration successful via component', response);
        // Maybe show a success message or automatically log them in (already happens via handleAuthentication)
      },
      error: (error) => {
        this.isLoadingRegister = false;
        this.registerError = error.message;
        console.error('Registration failed via component', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    // State updates handled by subscription
    // No need for window.location.reload()
    console.log('Logout initiated via component');
  }

  clearRegisterForm(): void {
    this.registroData = { nombre: '', correo_electronico: '', nombre_usuario: '', contrasena: '' };
    this.checkPasswordStrength('');
  }

  checkPasswordStrength(password: string): void {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$@!%&*?_])(?!\s)[a-zA-Z\d#$@!%&*?_]{8,16}$/;
    this.passwordValidation.length = password.length >= 8 && password.length <= 16;
    this.passwordValidation.lowercase = /(?=.*[a-z])/.test(password);
    this.passwordValidation.uppercase = /(?=.*[A-Z])/.test(password);
    this.passwordValidation.number = /(?=.*\d)/.test(password);
    this.passwordValidation.special = /(?=.*[#$@!%&*?_])/.test(password);
    this.passwordValidation.valid = regex.test(password);
  }

  ngAfterViewInit() {
    this.getScrollValue();    
    this.setupScrollHeader();
    this.checkPasswordStrength(this.registroData.contrasena);
  }
  
  getScrollValue() {
    let ticking = false;

    const updateScroll = () => {
      document.documentElement.style.setProperty('--scroll-y', `${window.scrollY}`);
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    });
  }

  setupScrollHeader() {
    const header = this.headerRef.nativeElement;
    const checkScroll = () => {
      const headerTop = header.getBoundingClientRect().top;
      const triggerHeight = window.innerHeight - header.offsetHeight;
      const scrollPosition = window.scrollY;

      if (headerTop <= 0) {
        header.classList.add('header-fixed');
      }
      if (scrollPosition <= triggerHeight) {
        header.classList.remove('header-fixed');
      }
    };
    window.addEventListener('scroll', checkScroll);
  }

}