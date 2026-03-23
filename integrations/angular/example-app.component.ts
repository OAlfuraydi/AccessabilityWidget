/**
 * Angular Integration — Full Example
 *
 * Shows how to initialize the widget from AppComponent
 * and how to use the service in any child component.
 */

// ─── app.component.ts ────────────────────────────────────────────────────────
import { Component, OnInit } from '@angular/core';
import { AccessibilityWidgetService } from './accessibility-widget.service';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <!-- The widget's floating button is injected by the service, not here -->
  `,
})
export class AppComponent implements OnInit {
  constructor(private widget: AccessibilityWidgetService) {}

  ngOnInit(): void {
    // Initialize once at app root — widget appears on every page automatically
    this.widget.init({
      lang: 'auto',          // auto-detect from <html lang>
      position: 'bottom-right',
      primaryColor: '#2563EB',
      showProfiles: true,
      showTTS: true,
    });
  }
}


// ─── Any child component — using the service ─────────────────────────────────
import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  template: `
    <header>
      <nav>
        <a routerLink="/">Home</a>

        <!-- Custom trigger button (optional — widget has its own floating button) -->
        <button (click)="openWidget()" class="a11y-btn" aria-label="Accessibility settings">
          ♿ Accessibility
        </button>

        <!-- Profile shortcuts -->
        <button (click)="applyDyslexiaProfile()">Dyslexia Mode</button>
        <button (click)="resetWidget()">Reset</button>
      </nav>
    </header>
  `,
})
export class HeaderComponent {
  constructor(private widget: AccessibilityWidgetService) {}

  openWidget()           { this.widget.open(); }
  applyDyslexiaProfile() { this.widget.applyProfile('dyslexia'); }
  resetWidget()          { this.widget.resetAll(); }
}


// ─── Standalone component (Angular 15+) ──────────────────────────────────────
/*
import { Component, OnInit } from '@angular/core';
import { AccessibilityWidgetService } from './accessibility-widget.service';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<router-outlet />`,
})
export class AppComponent implements OnInit {
  constructor(private widget: AccessibilityWidgetService) {}

  ngOnInit() {
    this.widget.init({ lang: 'auto', primaryColor: '#2563EB' });
  }
}
*/
