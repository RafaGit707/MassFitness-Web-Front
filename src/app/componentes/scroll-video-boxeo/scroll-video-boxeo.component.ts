import { Component, AfterViewInit, HostListener, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-scroll-video-boxeo',
  templateUrl: './scroll-video-boxeo.component.html',
  styleUrls: ['./scroll-video-boxeo.component.css']
})
export class ScrollVideoBoxeoComponent implements AfterViewInit {
  @ViewChild('scrollCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private context!: CanvasRenderingContext2D;
  private images: HTMLImageElement[] = [];
  private frameCount = 200;
  private scrollHeight = window.innerHeight * 3.5;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.context = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.preloadImages();

    const img = new Image();
    img.src = this.currentFrame(1);
    img.onload = () => this.context.drawImage(img, 0, 0, canvas.width, canvas.height);

    document.body.style.height = `${this.scrollHeight}`;
    
  }

  private lastFrameIndex = -1;

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollTop = window.scrollY;
    const maxScrollTop = this.scrollHeight - window.innerHeight;
    const scrollFraction = scrollTop / maxScrollTop;
    const frameIndex = Math.min(this.frameCount - 1, Math.floor(scrollFraction * this.frameCount));

    if (frameIndex === this.lastFrameIndex || !this.images[frameIndex]) return;

    this.lastFrameIndex = frameIndex;

    requestAnimationFrame(() => {
      const canvas = this.canvasRef.nativeElement;
      this.context.clearRect(0, 0, canvas.width, canvas.height);
      this.context.drawImage(this.images[frameIndex], 0, 0, canvas.width, canvas.height);
    });
  }

  @HostListener('window:resize', [])
  onResize(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private currentFrame(index: number): string {
    return `assets/frames3/ezgif-frame-${String(index).padStart(3, '00')}.jpg`;
  }

  private preloadImages(): void {
    for (let i = 1; i <= this.frameCount; i++) {
      const img = new Image();
      img.src = this.currentFrame(i);
      this.images[i - 1] = img;
    }
  }
  
}
