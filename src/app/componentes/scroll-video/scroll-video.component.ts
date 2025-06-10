// import { Component, AfterViewInit, HostListener, ElementRef, ViewChild } from '@angular/core';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-scroll-video',
//   templateUrl: './scroll-video.component.html',
//   styleUrls: ['./scroll-video.component.css']
// })

// export class ScrollVideoComponent implements AfterViewInit {
//   @ViewChild('scrollCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
//   private context!: CanvasRenderingContext2D;
//   private images: HTMLImageElement[] = [];
//   private frameCount = 186;
//   private scrollHeight = window.innerHeight * 4.75;

//   esMovil: boolean = false;

//   constructor(private router: Router) {}

//   ngAfterViewInit(): void {
//     const canvas = this.canvasRef.nativeElement;
//     this.context = canvas.getContext('2d')!;
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     this.setFrame();
//     this.preloadImages();

//     const img = new Image();
//     img.src = this.currentFrame(1);
//     img.onload = () => this.context.drawImage(img, 0, 0, canvas.width, canvas.height);

//     document.body.style.height = `${this.scrollHeight}`;
    
//   }

//   private lastFrameIndex = -1;

//   @HostListener('window:scroll', [])
//   onWindowScroll(): void {
//     const scrollTop = window.scrollY;
//     const maxScrollTop = this.scrollHeight - window.innerHeight;
//     const scrollFraction = scrollTop / maxScrollTop;
//     const frameIndex = Math.min(this.frameCount - 1, Math.floor(scrollFraction * this.frameCount));

//     if (frameIndex === this.lastFrameIndex || !this.images[frameIndex]) return;

//     this.lastFrameIndex = frameIndex;

//     requestAnimationFrame(() => {
//       const canvas = this.canvasRef.nativeElement;
//       this.context.clearRect(0, 0, canvas.width, canvas.height);
//       this.context.drawImage(this.images[frameIndex], 0, 0, canvas.width, canvas.height);
//     });
//   }

//   // @HostListener('window:resize', [])
//   // onResize(): void {
//   //   const canvas = this.canvasRef.nativeElement;
//   //   canvas.width = window.innerWidth;
//   //   canvas.height = window.innerHeight;
//   // }

//   // private currentFrame(index: number): string {
//   //   return `assets/frames/ezgif-frame-${String(index).padStart(3, '00')}.webp`;
//   // }

//   setFrame() {
//     const canvas = this.canvasRef.nativeElement;

//     const checkMovil = () => {
//       this.esMovil = window.innerWidth < 768;
//       if (this.esMovil) {
//         canvas.classList.add('video-movil');
//       } else {
//         canvas.classList.remove('video-movil');
//       }
//     };

//     checkMovil();

//     window.addEventListener('resize', checkMovil);
//   }

//   @HostListener('window:resize', [])
//   onResize(): void {
//     const canvas = this.canvasRef.nativeElement;
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     this.esMovil = window.innerWidth < 768;
//     console.log('Cargando frame:', this.esMovil ? 'assets/frames5/ezgif-frame-001.jpg' : 'assets/frames/ezgif-frame-001.webp');
//   }

//   private currentFrame(index: number): string {
//     const folder = this.esMovil ? 'assets/frames5' : 'assets/frames';
//     const extension = this.esMovil ? 'jpg' : 'webp';
//     const path = `${folder}/ezgif-frame-${String(index).padStart(3, '00')}.${extension}`;
//     console.log('Cargando frame:', path);
//     return path;
//   }


//   private preloadImages(): void {
//     for (let i = 1; i <= this.frameCount; i++) {
//       const img = new Image();
//       img.src = this.currentFrame(i);
//       this.images[i - 1] = img;
//     }
//   }

//   navegarAReservaClases(): void {
//     this.router.navigate(['/reservar/clases']);
//   }

//   navegarAReservaSalas(): void {
//     this.router.navigate(['/reservar/salas']);
//   }
  
// }

// import { Component, AfterViewInit, HostListener, ElementRef, ViewChild, OnDestroy } from '@angular/core';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-scroll-video',
//   templateUrl: './scroll-video.component.html',
//   styleUrls: ['./scroll-video.component.css']
// })
// export class ScrollVideoComponent implements AfterViewInit, OnDestroy {
//   @ViewChild('scrollCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
//   @ViewChild('contentContainer', { static: true }) contentRef!: ElementRef<HTMLElement>; // Referencia al div.content

//   private context!: CanvasRenderingContext2D;
//   private images: HTMLImageElement[] = [];
//   private frameCount = 186;

//   esMovil: boolean = false;
//   private lastFrameIndex = -1;
//   private isLoadingImages = false;
//   private animationFrameId?: number;

//   constructor(private router: Router) {}

//   ngAfterViewInit(): void {
//     const canvas = this.canvasRef.nativeElement;
//     this.context = canvas.getContext('2d')!;

//     this.handleResize(); // Configuración inicial (tamaño, esMovil, carga de imágenes)

//     // No se modifica la altura del body aquí. La altura la da el .content
//     document.body.style.overflowX = 'hidden'; // Prevenir scroll horizontal si el contenido es más ancho
//     document.documentElement.style.scrollBehavior = 'auto';
//   }

//   private initializeCanvasAndPreload(): void {
//     if (this.isLoadingImages) return;

//     this.isLoadingImages = true;
//     this.images = [];
//     this.lastFrameIndex = -1;

//     const canvas = this.canvasRef.nativeElement;
//     // El canvas SIEMPRE es 100vw y 100vh debido a position:fixed
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     console.log(`Canvas fixed dimensions: ${canvas.width}x${canvas.height}`);
//     console.log(`Inicializando para ${this.esMovil ? 'móvil' : 'escritorio'}. Cargando imágenes...`);
//     this.applyDeviceSpecificClass();

//     this.preloadImages().then(() => {
//       this.isLoadingImages = false;
//       console.log('Imágenes precargadas.');
//       this.drawInitialFrame();
//       this.onWindowScroll(); // Dibujar el frame correcto según el scroll actual
//     }).catch(error => {
//       this.isLoadingImages = false;
//       console.error("Error precargando imágenes:", error);
//     });
//   }

//   private drawInitialFrame(): void {
//     if (this.images.length > 0 && this.images[0]?.complete) {
//       this.drawFrame(0);
//     } else if (this.images.length > 0) {
//       this.images[0].onload = () => this.drawFrame(0);
//     }
//   }

//   private drawFrame(frameIndex: number): void {
//     if (!this.context || !this.images[frameIndex] || !this.images[frameIndex].complete) return;

//     const canvas = this.canvasRef.nativeElement;
//     if (frameIndex === this.lastFrameIndex) { // Solo redibujar si el frame cambió
//         return;
//     }
//     this.lastFrameIndex = frameIndex;

//     if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

//     this.animationFrameId = requestAnimationFrame(() => {
//       if (!this.context) return;
//       this.context.clearRect(0, 0, canvas.width, canvas.height);
//       this.context.drawImage(this.images[frameIndex], 0, 0, canvas.width, canvas.height);
//     });
//   }

//   @HostListener('window:scroll', [])
//   onWindowScroll(): void {
//     if (this.isLoadingImages || !this.images.length || !this.context || !this.contentRef?.nativeElement) return;

//     const scrollTop = window.scrollY;
//     // Altura total scrolleable del contenido principal.
//     // Esto es la altura total del div.content menos la altura de la ventana.
//     const contentHeight = this.contentRef.nativeElement.offsetHeight;
//     const scrollableContentHeight = contentHeight - window.innerHeight;

//     let scrollFraction = 0;
//     if (scrollableContentHeight > 0) {
//       scrollFraction = Math.min(1, Math.max(0, scrollTop / scrollableContentHeight));
//     } else if (scrollTop > 0) { // Si no hay contenido scrolleable pero se hizo scroll (raro)
//       scrollFraction = 1;
//     }

//     const frameIndex = Math.min(this.frameCount - 1, Math.max(0, Math.floor(scrollFraction * this.frameCount)));
//     this.drawFrame(frameIndex);
//   }

//   @HostListener('window:resize', [])
//   onResize(): void {
//     this.handleResize();
//   }

//   private handleResize(): void {
//     const previousEsMovil = this.esMovil;
//     this.esMovil = window.innerWidth < 768;

//     const canvas = this.canvasRef.nativeElement;
//     // El canvas siempre es 100vw y 100vh por el CSS fijo
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     this.applyDeviceSpecificClass();

//     if (previousEsMovil !== this.esMovil || this.images.length === 0) {
//       console.log(`Redimensionado. Es móvil: ${this.esMovil}. Recargando imágenes.`);
//       this.initializeCanvasAndPreload();
//     } else {
//       // Mismo tipo de dispositivo, solo redimensionar y redibujar el frame actual
//       console.log("Redimensionado, mismo tipo de dispositivo. Redibujando frame actual.");
//       // Forzar redibujo porque las dimensiones del canvas cambiaron
//       this.lastFrameIndex = -1; // Forzar que drawFrame redibuje
//       if (this.images.length > 0) {
//           const currentScrollTop = window.scrollY;
//           const contentHeight = this.contentRef.nativeElement.offsetHeight;
//           const scrollableContentHeight = contentHeight - window.innerHeight;
//           let scrollFraction = 0;
//           if (scrollableContentHeight > 0) {
//             scrollFraction = Math.min(1, Math.max(0, currentScrollTop / scrollableContentHeight));
//           } else if (currentScrollTop > 0) {
//             scrollFraction = 1;
//           }
//           const frameIndex = Math.min(this.frameCount - 1, Math.max(0, Math.floor(scrollFraction * this.frameCount)));
//           if (this.images[frameIndex]?.complete) {
//             this.drawFrame(frameIndex);
//           } else {
//             this.drawInitialFrame(); // Fallback
//           }
//       }
//     }
//   }

//   private applyDeviceSpecificClass(): void {
//     const canvas = this.canvasRef.nativeElement;
//     if (this.esMovil) {
//       canvas.classList.add('video-movil');
//       canvas.classList.remove('video-desktop'); // Asegurar que la otra no esté
//     } else {
//       canvas.classList.remove('video-movil');
//       canvas.classList.add('video-desktop'); // Clase para escritorio
//     }
//   }

//   private currentFramePath(index: number): string {
//     const frameNumber = index + 1;
//     const folder = this.esMovil ? 'assets/frames5' : 'assets/frames'; // Nombres de carpeta
//     const extension = this.esMovil ? 'jpg' : 'webp';
//     const path = `${folder}/ezgif-frame-${String(frameNumber).padStart(3, '0')}.${extension}`;
//     return path;
//   }

//   private preloadImages(): Promise<void[]> {
//     // ... (tu método preloadImages sin cambios, pero asegúrate que use currentFramePath)
//     console.log(`Precargando ${this.frameCount} imágenes desde ${this.esMovil ? 'móvil' : 'escritorio'} set...`);
//     const promises: Promise<void>[] = [];
//     this.images = new Array(this.frameCount);

//     for (let i = 0; i < this.frameCount; i++) {
//       const img = new Image();
//       const promise = new Promise<void>((resolve, reject) => {
//         img.onload = () => resolve();
//         img.onerror = (err) => {
//           console.error(`Error cargando imagen: ${img.src}`, err);
//           resolve();
//         };
//       });
//       img.src = this.currentFramePath(i);
//       this.images[i] = img;
//       promises.push(promise);
//     }
//     return Promise.all(promises);
//   }

//   navegarAReservaClases(): void {
//     this.cleanupBeforeNavigate();
//     this.router.navigate(['/reservar/clases']);
//   }

//   navegarAReservaSalas(): void {
//     this.cleanupBeforeNavigate();
//     this.router.navigate(['/reservar/salas']);
//   }

//   private cleanupBeforeNavigate(): void {
//     document.body.style.overflowX = '';
//     document.documentElement.style.scrollBehavior = '';
//     window.scrollTo(0,0);
//     if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
//   }

//   ngOnDestroy(): void {
//     this.cleanupBeforeNavigate();
//     console.log("ScrollVideoComponent destruido.");
//   }
// }



import { Component, AfterViewInit, HostListener, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/servicios/auth.service';
import { ModalAuthService } from 'src/app/servicios/modal-auth.service';

@Component({
  selector: 'app-scroll-video',
  templateUrl: './scroll-video.component.html',
  styleUrls: ['./scroll-video.component.css']
})
export class ScrollVideoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('scrollCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('contentContainer', { static: true }) contentRef!: ElementRef<HTMLElement>;

  private context!: CanvasRenderingContext2D;
  private images: HTMLImageElement[] = [];
  private frameCount = 186; // Número de imágenes en tus secuencias

  esMovil: boolean = false;
  private lastFrameIndex = -1;
  private isLoadingImages = false;
  private animationFrameId?: number;

  private isLoggedIn: boolean = false;
  private authSubscription: Subscription | null = null;

  constructor(private router: Router, private authService: AuthService, private modalAuthService: ModalAuthService) {}

   ngOnInit(): void { // Añadir ngOnInit si no lo tenías
    this.authSubscription = this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

   navegarAReservaClases(): void {
    if (this.isLoggedIn) {
      this.cleanupBeforeNavigate();
      this.router.navigate(['/reservar/clases']);
    } else {
      // El usuario no está logueado, solicitar abrir el modal
      this.modalAuthService.solicitarAbrirLoginModal();
    }
  }

  navegarAReservaSalas(): void {
    if (this.isLoggedIn) {
      this.cleanupBeforeNavigate();
      this.router.navigate(['/reservar/salas']);
    } else {
      // El usuario no está logueado, solicitar abrir el modal
      this.modalAuthService.solicitarAbrirLoginModal();
    }
  }

  navegarAEntrenadores(): void {
    this.cleanupBeforeNavigate();
    this.router.navigate(['/entrenadores']); // Asumiendo que tienes esta ruta
  }

  ngAfterViewInit(): void {
    if (!this.canvasRef || !this.contentRef) {
      console.error("Canvas o ContentRef no están disponibles.");
      return;
    }
    const canvas = this.canvasRef.nativeElement;
    this.context = canvas.getContext('2d')!;

    this.handleResize(); // Configuración inicial y carga de imágenes

    document.body.style.overflowX = 'hidden';
    document.documentElement.style.scrollBehavior = 'auto';
  }

  private initializeCanvasAndPreload(): void {
    if (this.isLoadingImages || !this.canvasRef || !this.contentRef) return;

    this.isLoadingImages = true;
    this.images = [];
    this.lastFrameIndex = -1;

    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    console.log(`Canvas: ${canvas.width}x${canvas.height}. Móvil: ${this.esMovil}. Cargando imágenes...`);
    this.applyDeviceSpecificClass();

    this.preloadImages().then(() => {
      this.isLoadingImages = false;
      console.log('Imágenes precargadas.');
      this.drawInitialFrame();
      // Forzar una actualización inicial basada en el scroll actual
      // Es importante que contentRef.nativeElement.offsetHeight tenga su valor final aquí
      requestAnimationFrame(() => this.onWindowScroll());
    }).catch(error => {
      this.isLoadingImages = false;
      console.error("Error precargando imágenes:", error);
    });
  }

  private drawInitialFrame(): void {
    // Dibuja el primer frame si está disponible
    if (this.images.length > 0) {
        if (this.images[0]?.complete) {
            this.drawFrame(0);
        } else {
            this.images[0].onload = () => this.drawFrame(0);
        }
    }
  }

  private drawFrame(frameIndex: number): void {
    if (!this.context || frameIndex < 0 || frameIndex >= this.images.length || !this.images[frameIndex]?.complete) {
      // console.warn(`No se puede dibujar frame ${frameIndex}. Contexto: ${!!this.context}, Imagen: ${this.images[frameIndex]?.complete}`);
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    if (frameIndex === this.lastFrameIndex) return; // Optimización: no redibujar el mismo frame

    this.lastFrameIndex = frameIndex;

    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

    this.animationFrameId = requestAnimationFrame(() => {
      if (!this.context) return;
      this.context.clearRect(0, 0, canvas.width, canvas.height);
      this.context.drawImage(this.images[frameIndex], 0, 0, canvas.width, canvas.height);
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (this.isLoadingImages || !this.images.length || !this.context || !this.contentRef?.nativeElement) return;

    const scrollTop = window.scrollY;
    const contentHeight = this.contentRef.nativeElement.offsetHeight;
    const windowHeight = window.innerHeight;
    
    const actualScrollableContentHeight = contentHeight - windowHeight;

    let frameIndex: number;

    if (actualScrollableContentHeight <= 0) {
      // Si no hay suficiente contenido para scrollear más allá de la altura de la ventana,
      // la animación no progresará mucho.
      // Decidimos qué frame mostrar: el primero si no hay scroll, o el último si hay algo de scroll.
      frameIndex = scrollTop > 0 ? this.frameCount - 1 : 0;
    } else {
      // --- AJUSTE PARA RALENTIZAR LA ANIMACIÓN ---
      let scrollSlowdownFactor = 0; // <--- ¡AJUSTA ESTE VALOR!

      if (this.esMovil) {
        scrollSlowdownFactor = 28;
      } else {
        scrollSlowdownFactor = 40;
      }

      // Calculamos la fracción de scroll sobre una altura "extendida"
      // La animación completará sus frames cuando scrollTop alcance actualScrollableContentHeight * scrollSlowdownFactor
      // Pero el scroll real de la página solo llega hasta actualScrollableContentHeight.
      // Por lo tanto, necesitamos mapear el scrollTop actual al rango [0, actualScrollableContentHeight]
      // y luego escalar eso a la progresión de frames.

      // Opción A: La animación se completa cuando se scrollea toda la altura real del contenido.
      // El slowdownFactor hace que cada pixel de scroll avance menos frames.
      // let scrollFraction = scrollTop / actualScrollableContentHeight;
      // frameIndex = Math.min(this.frameCount - 1, Math.max(0, Math.floor((scrollFraction / scrollSlowdownFactor) * this.frameCount)));

      // Opción B (Más intuitiva para "la animación dura X veces el scroll del contenido"):
      // La animación se distribuye a lo largo de (actualScrollableContentHeight * scrollSlowdownFactor) de scroll "virtual".
      // El scroll real solo va hasta actualScrollableContentHeight.
      const virtualTotalScrollForAnimation = actualScrollableContentHeight * scrollSlowdownFactor;
      let scrollFractionForAnimation = scrollTop / virtualTotalScrollForAnimation;
      
      scrollFractionForAnimation = Math.min(1, Math.max(0, scrollFractionForAnimation)); // Clampear entre 0 y 1

      frameIndex = Math.min(this.frameCount - 1, Math.max(0, Math.floor(scrollFractionForAnimation * this.frameCount)));

      // Si quieres que la animación se DETENGA cuando el scroll real del contenido ha terminado,
      // y no siga progresando si el slowdownFactor es > 1:
      if (scrollTop >= actualScrollableContentHeight && scrollSlowdownFactor > 1) {
          // Ya se scrolleó todo el contenido real. Si la animación no ha terminado debido al slowdownFactor,
          // podrías decidir si forzarla al último frame o dejarla donde esté.
          // Por ahora, la lógica de arriba la dejará donde esté según virtualTotalScrollForAnimation.
          // Si quieres que SIEMPRE llegue al último frame cuando se acaba el contenido REAL:
          // if (scrollTop >= actualScrollableContentHeight) {
          //   frameIndex = this.frameCount - 1;
          // }
      }
    }

    this.drawFrame(frameIndex);
  }

  @HostListener('window:resize', [])
  onResize(): void {
    this.handleResize();
  }

  private handleResize(): void {
    if (!this.canvasRef || !this.contentRef) return;

    const previousEsMovil = this.esMovil;
    this.esMovil = window.innerWidth < 768;

    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.applyDeviceSpecificClass();

    if (previousEsMovil !== this.esMovil || this.images.length === 0) {
      console.log(`Redimensionado. Cambió esMóvil o no hay imágenes. Móvil: ${this.esMovil}. Recargando.`);
      this.initializeCanvasAndPreload();
    } else {
      console.log("Redimensionado, mismo tipo de dispositivo. Redibujando frame actual.");
      this.lastFrameIndex = -1; // Forzar redibujo
      // Es importante recalcular el frame basado en el scroll actual DESPUÉS de que el layout se haya estabilizado
      requestAnimationFrame(() => this.onWindowScroll());
    }
  }

  private applyDeviceSpecificClass(): void {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    if (this.esMovil) {
      canvas.classList.add('video-movil');
      canvas.classList.remove('video-desktop');
    } else {
      canvas.classList.remove('video-movil');
      canvas.classList.add('video-desktop');
    }
  }

  private currentFramePath(index: number): string {
    const frameNumber = index + 1; // Mis frames van de 1 a N
    const folder = this.esMovil ? 'assets/frames1-movil' : 'assets/frames1-desktop'; // Nombres de carpeta
    const extension = this.esMovil ? 'jpg' : 'webp'; // Diferentes extensiones
    return `${folder}/ezgif-frame-${String(frameNumber).padStart(3, '0')}.webp`;
  }

  private preloadImages(): Promise<void[]> {
    console.log(`Precargando ${this.frameCount} imágenes de ${this.esMovil ? 'móvil' : 'escritorio'}...`);
    const promises: Promise<void>[] = [];
    this.images = new Array(this.frameCount);

    for (let i = 0; i < this.frameCount; i++) {
      const img = new Image();
      const promise = new Promise<void>((resolve) => { // No necesitamos reject aquí
        img.onload = () => resolve();
        img.onerror = (err) => {
          console.error(`Error al cargar: ${img.src}`, err);
          resolve(); // Continuar incluso si una imagen falla
        };
      });
      img.src = this.currentFramePath(i);
      this.images[i] = img;
      promises.push(promise);
    }
    return Promise.all(promises);
  }

  private cleanupBeforeNavigate(): void {
    document.body.style.overflowX = '';
    document.documentElement.style.scrollBehavior = '';
    window.scrollTo(0,0);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  ngOnDestroy(): void {
    this.cleanupBeforeNavigate();
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId); // Asegurar limpieza
      this.authSubscription?.unsubscribe();
    console.log("ScrollVideoComponent destruido.");
  }
}