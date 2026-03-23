/**
 * AccessibilityWidgetModule — Angular Module
 *
 * Import this in your AppModule (or any feature module) to make the
 * AccessibilityWidgetService available across the app.
 *
 * Example:
 *   // app.module.ts
 *   import { AccessibilityWidgetModule } from './accessibility-widget/accessibility-widget.module';
 *
 *   @NgModule({
 *     imports: [AccessibilityWidgetModule],
 *     ...
 *   })
 *   export class AppModule {}
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessibilityWidgetService } from './accessibility-widget.service';

@NgModule({
  imports: [CommonModule],
  providers: [AccessibilityWidgetService],
})
export class AccessibilityWidgetModule {}
