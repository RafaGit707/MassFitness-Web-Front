
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { AuthService, User } from '../../servicios/auth.service';
import { filter, Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModalAuthService } from 'src/app/servicios/modal-auth.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AdminService, ClaseResumida, SalaResumida } from 'src/app/admin/admin.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  animations: [ // Animaciones para los dropdowns del menú móvil
      trigger('expandCollapse', [
        state('collapsed', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
        state('expanded', style({ height: '*', opacity: 1 })), // '*' calcula la altura automáticamente
        transition('expanded <=> collapsed', animate('250ms ease-in-out'))
      ])
    ]
})
export class AuthComponent implements OnInit, OnDestroy {
  @ViewChild('headerElement') headerRef!: ElementRef;
  @ViewChild('containerHeader') containerRef!: ElementRef;

  loginData = { nombre_usuario: '', contrasena: '' };
  registroData = { nombre: '', correo_electronico: '', nombre_usuario: '', contrasena: '' };

  loggedIn: boolean = false;
  currentUserName: string = '';
  isAdmin: boolean = false;
  isMobileMenuOpen = false;
  isHomePage = false; 

  showLoginModal = false;
  showRegisterModal = false;
  isLoadingLogin = false;
  isLoadingRegister = false;
  loginError: string | null = null;
  registerError: string | null = null;
  private scrollListener: (() => void) | null = null;

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
  private routerSubscription: Subscription | null = null;
  private modalAuthSubscription: Subscription | null = null;


  clasesDisponibles: ClaseResumida[] = [];
  salasDisponibles: SalaResumida[] = [];
  isLoadingClases = false;
  isLoadingSalas = false;

  showClasesDropdownDesktop = false;
  showSalasDropdownDesktop = false;

  showClasesSubmenuMobile = false;
  showSalasSubmenuMobile = false;

  @ViewChild('clasesDropdownContainer') clasesDropdownContainerRef!: ElementRef<HTMLElement>;
  @ViewChild('salasDropdownContainer') salasDropdownContainerRef!: ElementRef<HTMLElement>;

  isClasesDropUp = false;
  isSalasDropUp = false;

  constructor(private authService: AuthService, private router: Router,  private modalAuthService: ModalAuthService, private snackBar: MatSnackBar, private adminService: AdminService) {}

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

    this.modalAuthSubscription = this.modalAuthService.abrirLoginModal$.subscribe(() => {
      console.log('AuthComponent: Solicitud recibida para abrir modal de login.');
      this.snackBar.open('Debes iniciar sesión para continuar.', 'Cerrar', {
        duration: 3000,
        verticalPosition: 'top'
      });
      this.openLogin(); // Llama a tu método existente para abrir el modal
    });

    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const previousHomePageState = this.isHomePage;
      this.isHomePage = (event.urlAfterRedirects === '/' || event.urlAfterRedirects === '/home');

      // Llama a la lógica de configuración del header CADA VEZ que cambia la ruta
      this.configureHeaderState();
    });

    // Configuración inicial al cargar el componente
    // Esto es importante si el componente carga directamente en una ruta que no es la home,
    // o si carga en la home.
    this.isHomePage = (this.router.url === '/' || this.router.url === '/home');
    this.configureHeaderState(); // true para forzar re-configuración inicial
    this.cargarListasParaDropdowns();

    // Initial state is set by the service constructor calling loadInitialAuthState()
  }

  cargarListasParaDropdowns(): void {
    this.isLoadingClases = true;
    this.adminService.getClasesParaDropdown().subscribe(clases => {
      this.clasesDisponibles = clases;
      this.isLoadingClases = false;
    }, error => {
      console.error("Error cargando clases para dropdown:", error);
      this.isLoadingClases = false;
    });

    this.isLoadingSalas = true;
    this.adminService.getSalasParaDropdown().subscribe(salas => {
      this.salasDisponibles = salas;
      this.isLoadingSalas = false;
    }, error => {
      console.error("Error cargando salas para dropdown:", error);
      this.isLoadingSalas = false;
    });
  }

   // --- Métodos para Dropdowns de Escritorio ---
  private configureDropdown(
    triggerElement: HTMLElement,
    dropdownMenuElement: HTMLElement | null, // El div.dropdown-menu
    isToShow: boolean,
    dropUpFlagSetter: (isDropUp: boolean) => void
  ): void {
    if (!dropdownMenuElement) {
      // Si el menú aún no está en el DOM (por *ngIf), no podemos calcular
      // Pero si isToShow es false, no importa. Si es true, el setTimeout lo manejará.
      if (!isToShow) dropUpFlagSetter(false); // Resetear al ocultar
      return;
    }

    if (!isToShow) {
      dropUpFlagSetter(false); // Resetear al ocultar
      return;
    }

    // Forzar al navegador a recalcular layout para obtener dimensiones correctas
    // Esto es importante si el dropdown acaba de ser añadido al DOM por *ngIf
    dropdownMenuElement.style.visibility = 'hidden'; // Ocultar temporalmente para medir
    dropdownMenuElement.style.display = 'block'; // Asegurar que esté en el flujo para medir
    const dropdownHeight = dropdownMenuElement.offsetHeight;
    dropdownMenuElement.style.display = ''; // Restaurar
    dropdownMenuElement.style.visibility = ''; // Restaurar


    const triggerRect = triggerElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    const spaceBelow = windowHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;

    // Decidir si desplegar hacia arriba
    // Se despliega hacia arriba si:
    // 1. No hay suficiente espacio abajo (spaceBelow < dropdownHeight)
    // 2. Y (hay más espacio arriba que abajo O hay suficiente espacio arriba para el dropdown)
    if (spaceBelow < dropdownHeight && (spaceAbove > spaceBelow || spaceAbove >= dropdownHeight)) {
      dropUpFlagSetter(true);
    } else {
      dropUpFlagSetter(false);
    }
  }

  // Al entrar/salir del contenedor del item de navegación que tiene el dropdown
  onDropdownContainerMouseEnter(event: MouseEvent, type: 'clases' | 'salas'): void {
    const triggerLiElement = event.currentTarget as HTMLElement;
    let dropdownMenuElement: HTMLElement | null = null;

    if (type === 'clases') {
      this.showClasesDropdownDesktop = true;
      // Esperar un ciclo para que *ngIf renderice el dropdown
      setTimeout(() => {
        dropdownMenuElement = triggerLiElement.querySelector('.dropdown-menu[data-type="clases"]') as HTMLElement | null;
        this.configureDropdown(triggerLiElement, dropdownMenuElement, true, (isUp) => this.isClasesDropUp = isUp);
      }, 0);
    } else if (type === 'salas') {
      this.showSalasDropdownDesktop = true;
      setTimeout(() => {
        dropdownMenuElement = triggerLiElement.querySelector('.dropdown-menu[data-type="salas"]') as HTMLElement | null;
        this.configureDropdown(triggerLiElement, dropdownMenuElement, true, (isUp) => this.isSalasDropUp = isUp);
      }, 0);
    }
  }

  onDropdownContainerMouseLeave(type: 'clases' | 'salas'): void {
    if (type === 'clases') {
      this.showClasesDropdownDesktop = false;
      // No es necesario resetear isClasesDropUp aquí, se recalcula al mostrar
    } else if (type === 'salas') {
      this.showSalasDropdownDesktop = false;
    }
  }


  // Si prefieres controlar con CLICK en lugar de hover para mostrar/ocultar
  toggleClasesDropdownDesktop(event: MouseEvent): void {
    const triggerLiElement = (event.currentTarget as HTMLElement).closest('.nav-item.dropdown-container') as HTMLElement;
    this.showSalasDropdownDesktop = false;
    this.showClasesDropdownDesktop = !this.showClasesDropdownDesktop;

    if (this.showClasesDropdownDesktop) {
      setTimeout(() => {
        const dropdownMenuElement = triggerLiElement.querySelector('.dropdown-menu[data-type="clases"]') as HTMLElement | null;
        this.configureDropdown(triggerLiElement, dropdownMenuElement, true, (isUp) => this.isClasesDropUp = isUp);
      }, 0);
    } else {
        this.isClasesDropUp = false; // Resetear al cerrar
    }
  }

  toggleSalasDropdownDesktop(event: MouseEvent): void {
    const triggerLiElement = (event.currentTarget as HTMLElement).closest('.nav-item.dropdown-container') as HTMLElement;
    this.showClasesDropdownDesktop = false;
    this.showSalasDropdownDesktop = !this.showSalasDropdownDesktop;

    if (this.showSalasDropdownDesktop) {
      setTimeout(() => {
        const dropdownMenuElement = triggerLiElement.querySelector('.dropdown-menu[data-type="salas"]') as HTMLElement | null;
        this.configureDropdown(triggerLiElement, dropdownMenuElement, true, (isUp) => this.isSalasDropUp = isUp);
      }, 0);
    } else {
        this.isSalasDropUp = false; // Resetear al cerrar
    }
  }

  // --- Métodos para Dropdowns de Escritorio (ejemplo con click) ---
  // toggleClasesDropdownDesktop(): void {
  //   this.showClasesDropdownDesktop = !this.showClasesDropdownDesktop;
  //   this.showSalasDropdownDesktop = false; // Cierra el otro si está abierto
  // }

  // toggleSalasDropdownDesktop(): void {
  //   this.showSalasDropdownDesktop = !this.showSalasDropdownDesktop;
  //   this.showClasesDropdownDesktop = false; // Cierra el otro
  // }

  // Opcional: cerrar dropdowns si se hace clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Lógica para cerrar dropdowns de escritorio si el clic es fuera de ellos
    // Necesitarías @ViewChild para los elementos del dropdown y el botón que lo abre
    // Ejemplo muy simplificado:
    // if (this.showClasesDropdownDesktop && !this.claseSDropdownElementRef?.nativeElement.contains(event.target)) {
    //   this.showClasesDropdownDesktop = false;
    // }
    // Esta parte puede ser compleja de implementar bien sin ensuciar.
    // A menudo, para hover no se necesita, y para click se puede gestionar con más cuidado.
  }


  // --- Métodos para Submenús Móviles ---
  toggleClasesSubmenuMobile(): void {
    this.showClasesSubmenuMobile = !this.showClasesSubmenuMobile;
    this.showSalasSubmenuMobile = false; // Cierra el otro si está abierto
  }

  toggleSalasSubmenuMobile(): void {
    this.showSalasSubmenuMobile = !this.showSalasSubmenuMobile;
    this.showClasesSubmenuMobile = false; // Cierra el otro
  }

  // Navegar a la página de detalle de una clase/sala específica desde el dropdown
  navegarADetalle(tipo: 'clase' | 'sala', id: number | string): void {
    this.closeMenuAndNavigate(); // Cierra menú móvil
    this.showClasesDropdownDesktop = false; // Cierra dropdowns escritorio
    this.showSalasDropdownDesktop = false;

    // Asume que tienes rutas como /reservar/clases/:id y /reservar/salas/:id
    if (tipo === 'clase') {
      this.router.navigate(['/reservar/clase', id]);
    } else if (tipo === 'sala') {
      this.router.navigate(['/reservar/sala', id]);
    }
  }

  configureHeaderState() {
    if (!this.headerRef?.nativeElement) {
      console.warn('Header element not available yet for configuration.');
      // Se podría reintentar en ngAfterViewInit si esto sucede a menudo.
      return;
    }
    const header = this.headerRef.nativeElement as HTMLElement;
    const containerHeader = this.containerRef?.nativeElement as HTMLElement; // El contenedor de la "hero"

    // 1. Limpiar listener de scroll anterior si existe
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
      this.scrollListener = null;
      // console.log('Previous scroll listener removed.');
    }

    // 2. Aplicar/Quitar clases y configurar listener según la página
    if (this.isHomePage) {
      // --- EN LA HOME PAGE ---
      header.classList.remove('header-fixed');
      containerHeader.removeAttribute('style');

      // Definir la función de scroll para la home
      // Guardamos la referencia a ESTA función para poder quitarla luego
      this.scrollListener = () => {
        if (!this.headerRef?.nativeElement || !this.containerRef?.nativeElement) return;

        const headerEl = this.headerRef.nativeElement;
        const containerHeaderEl = this.containerRef.nativeElement;

        // Condición para fijar: Cuando el final del containerHeader (hero) está a punto de salir
        // o cuando se ha scrolleado más allá de su altura menos la altura del header.
        // O una lógica más simple si el header siempre está al fondo del containerHeader.
        // Tu lógica original:
        const headerTop = headerEl.getBoundingClientRect().top;
        const triggerHeight = window.innerHeight - headerEl.offsetHeight;
        const scrollPosition = window.scrollY;
        if (headerTop <= 0) {
          headerEl.classList.add('header-fixed'); // Fijo cuando el header llega al top
        }

        if (scrollPosition <= triggerHeight) {
          header.classList.remove('header-fixed');
        }

      };
      window.addEventListener('scroll', this.scrollListener);
      // console.log('Scroll listener ADDED for Home page.');
      // Ejecutar una vez por si la página carga ya scrolleada en la home
      this.scrollListener();

    } else {
      // --- NO ES LA HOME PAGE ---
      header.classList.add('header-fixed'); // Fijo desde el inicio
      containerHeader.setAttribute('style', 'height: 0;'); // Aseguramos que no haya padding extra
      // console.log('Header set to fixed for non-home page.');
    }

    this.updatePageContentPadding();
  }

  updatePageContentPadding() {
    // Tu lógica de `updatePageContentPadding` es para ajustar el contenido principal
    // que está DENTRO del `<router-outlet>`.
    // Si el `<router-outlet>` está dentro de `div.container-header` y después del `<header>`,
    // esta lógica podría necesitar ajustes.

    // Si tu <router-outlet> está dentro de <main class="page-content"> que es HERMANO
    // de <div class="container-header"> (como en mi sugerencia anterior), entonces:
    const pageContent = document.querySelector('.page-content') as HTMLElement;
    if (pageContent && this.headerRef?.nativeElement) {
      if (!this.isHomePage) { // Solo en otras páginas (donde el header está fijo arriba)
        const headerHeight = this.headerRef.nativeElement.offsetHeight;
        // Si el router-outlet está directamente en el body o en un main principal
        document.body.style.paddingTop = `${headerHeight}px`; // O pageContent.style.paddingTop
      } else {
        document.body.style.paddingTop = '0px'; // O pageContent.style.paddingTop
      }
    }
  }

  ngAfterViewInit() {
    this.getScrollValue();
    // Se llama a configureHeaderState desde ngOnInit, pero una llamada aquí
    // asegura que los elementos del DOM (headerRef, containerRef) existen.
    if (this.headerRef?.nativeElement && this.containerRef?.nativeElement) {
      this.configureHeaderState();
    } else {
      // Podrías usar un setTimeout si a veces no están listos
      setTimeout(() => {
          if (this.headerRef?.nativeElement && this.containerRef?.nativeElement) {
              this.configureHeaderState();
          }
      }, 0);
    }
    this.checkPasswordStrength(this.registroData.contrasena); // Asegurarse de que la validación de contraseña esté lista
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.adminSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
    this.modalAuthSubscription?.unsubscribe();

    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
      this.scrollListener = null;
      // console.log('Scroll listener removed on component destroy.');
    }
    document.body.classList.remove("no-scroll");
    document.body.style.paddingTop = '0px'; // Resetear padding del body
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.updateNoScrollBody();
  }

  closeMenuAndNavigate(target?: string): void {
    this.isMobileMenuOpen = false;
    this.updateNoScrollBody();
    if (target && target.startsWith('#')) {
      this.scrollToContact(target);
    }
    // La navegación con routerLink se maneja automáticamente al hacer clic.
  }

  openLoginAndCloseMenu(): void {
    this.openLogin(); // Tu método existente para abrir el modal de login
    this.isMobileMenuOpen = false;
    this.updateNoScrollBody(); // openLogin ya debería manejar no-scroll, pero por si acaso
  }

  logoutAndCloseMenu(): void {
    this.logout(); // Tu método existente
    this.isMobileMenuOpen = false;
    this.updateNoScrollBody();
  }

  scrollToContact(hash: string): void {
    this.isMobileMenuOpen = false; // Asegúrate de cerrar el menú
    this.updateNoScrollBody();
    const targetId = hash.substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.warn(`Elemento con id '${targetId}' no encontrado.`);
      // Opcional: navegar a la home si no se encuentra y estás en otra página
      // this.router.navigate(['/']);
    }
  }

  // Método para controlar el scroll del body cuando el menú o modales están abiertos
  private updateNoScrollBody(): void {
    if (this.isMobileMenuOpen || this.showLoginModal || this.showRegisterModal) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }

  // Asegúrate de llamar a updateNoScrollBody() también en tus open/closeModals
  openLogin(): void {
    this.closeModals();
    this.showLoginModal = true;
    this.loginError = null;
    this.loginData = { nombre_usuario: '', contrasena: '' };
    this.updateNoScrollBody(); // AÑADIR
  }

  openRegister(): void {
    this.closeModals();
    this.showRegisterModal = true;
    this.registerError = null;
    this.clearRegisterForm();
    this.checkPasswordStrength('');
    this.updateNoScrollBody(); // AÑADIR
  }

  closeModals(): void {
    this.showLoginModal = false;
    this.showRegisterModal = false;
    this.updateNoScrollBody(); // AÑADIR o ASEGURAR que está
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