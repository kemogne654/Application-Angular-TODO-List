// header.component.ts
import {
  Component,
  HostListener,
  OnInit,
  OnDestroy,
  Renderer2,
  Inject,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    RouterModule,
  ],
  template: `
    <mat-toolbar class="app-header" [class.mobile]="isMobile">
      <span class="app-title" (click)="navigateToHome()">
        Gestionnaire de Tâches
      </span>

      <!-- Desktop Navigation -->
      <div class="navigation-tabs" *ngIf="!isMobile">
        <nav mat-tab-nav-bar>
          <a
            mat-tab-link
            routerLink="/todos"
            routerLinkActive="active-link"
            class="nav-link"
            [class.current-page]="isActiveRoute('/todos')"
          >
            Tâches
          </a>
          <a
            mat-tab-link
            routerLink="/persons"
            routerLinkActive="active-link"
            class="nav-link"
            [class.current-page]="isActiveRoute('/persons')"
          >
            Personnes
          </a>
        </nav>
      </div>

      <!-- Mobile Navigation -->
      <div class="mobile-nav" *ngIf="isMobile">
        <button
          mat-icon-button
          [matMenuTriggerFor]="mobileMenu"
          class="hamburger-button"
          aria-label="Menu"
        >
          <mat-icon>menu</mat-icon>
        </button>

        <mat-menu #mobileMenu="matMenu" class="mobile-menu">
          <button
            mat-menu-item
            (click)="navigateToTodos()"
            [class.active-menu-item]="isActiveRoute('/todos')"
          >
            <mat-icon>task_alt</mat-icon>
            <span>Tâches</span>
          </button>
          <button
            mat-menu-item
            (click)="navigateToPersons()"
            [class.active-menu-item]="isActiveRoute('/persons')"
          >
            <mat-icon>people</mat-icon>
            <span>Personnes</span>
          </button>
        </mat-menu>
      </div>
    </mat-toolbar>
  `,
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMobile = false;
  currentRoute = '';
  private destroy$ = new Subject<void>();

  // Background gradients for different pages
  private pageBackgrounds: { [key: string]: string } = {
    '/todos': 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
    '/persons': 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
    '/': 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', // default
  };

  constructor(
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();

    // Listen to route changes
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
        this.updatePageBackground();
      });

    // Set initial route and background
    this.currentRoute = this.router.url;
    this.updatePageBackground();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  private updatePageBackground(): void {
    // Remove existing background classes
    const body = this.document.body;
    body.classList.remove('todos-page', 'persons-page', 'home-page');

    // Determine which background to apply
    let backgroundClass = 'home-page';
    let backgroundStyle = this.pageBackgrounds['/'];

    if (this.currentRoute.includes('/todos')) {
      backgroundClass = 'todos-page';
      backgroundStyle = this.pageBackgrounds['/todos'];
    } else if (this.currentRoute.includes('/persons')) {
      backgroundClass = 'persons-page';
      backgroundStyle = this.pageBackgrounds['/persons'];
    }

    // Apply background class and style
    body.classList.add(backgroundClass);
    this.renderer.setStyle(body, 'background', backgroundStyle);
    this.renderer.setStyle(body, 'background-attachment', 'fixed');
    this.renderer.setStyle(body, 'transition', 'background 0.5s ease');
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  navigateToTodos(): void {
    this.router.navigate(['/todos']);
  }

  navigateToPersons(): void {
    this.router.navigate(['/persons']);
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute.includes(route);
  }
}
