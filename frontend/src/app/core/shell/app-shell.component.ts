import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { AppHeaderComponent } from '../header/app-header.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FeatureFlagDirective } from '../../core/directives';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToastService } from '../../services/toast.service';
import { Subscription } from 'rxjs';
import {IndicesComponent} from "../../features/indices/indices.component";

@Component({
  selector: 'app-shell',
  standalone: true,
    imports: [
        CommonModule,
        RouterOutlet,
        AppHeaderComponent,
        ProgressSpinnerModule,
        FeatureFlagDirective,
        ToastModule,
        IndicesComponent
    ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  providers: [MessageService]
})
export class AppShellComponent implements OnInit, OnDestroy {
  loading = false; // This will be used to control the loading spinner visibility
  private toastSubscription: Subscription | undefined;

  constructor(
    private messageService: MessageService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('AppShellComponent: ngOnInit called');
    this.toastSubscription = this.toastService.toast$.subscribe(toast => {
      this.messageService.add(toast);
    });
  }

  ngOnDestroy(): void {
    console.log('AppShellComponent: ngOnDestroy called');
    if (this.toastSubscription) {
      this.toastSubscription.unsubscribe();
    }
  }

  onRouterOutletActivate(component: any): void {
    console.log('Router outlet activated:', component.constructor.name);
    console.log('Current URL:', this.router.url);
    
    // Force cleanup of any lingering components
    this.cleanupLingeringComponents(component.constructor.name);
  }
  
  private cleanupLingeringComponents(activeComponentName: string): void {
    setTimeout(() => {
      // Find the main router outlet (the one in app-shell)
      const mainRouterOutlet = document.querySelector('.column-right router-outlet');
      if (mainRouterOutlet && mainRouterOutlet.parentElement) {
        const siblings = Array.from(mainRouterOutlet.parentElement.children)
          .filter(el => el.tagName !== 'ROUTER-OUTLET' && !el.classList.contains('loading-container'));
        
        console.log(`Found ${siblings.length} sibling components`);
        
        // Convert component name to expected tag name
        // e.g., "_ScreenersComponent" -> "app-screeners"
        let componentName = activeComponentName.toLowerCase();
        // Remove leading underscore if present
        if (componentName.startsWith('_')) {
          componentName = componentName.substring(1);
        }
        // Remove 'component' suffix
        componentName = componentName.replace('component', '');
        const expectedTagName = 'app-' + componentName;
        console.log(`Looking for active component with tag: ${expectedTagName}`);
        
        // Only remove components if there are more than 1 sibling
        if (siblings.length > 1) {
          siblings.forEach((sibling, index) => {
            const siblingTagName = sibling.tagName.toLowerCase();
            const isActiveComponent = siblingTagName === expectedTagName;
            
            if (!isActiveComponent) {
              console.log(`Removing lingering component: ${sibling.tagName}`);
              sibling.remove();
            } else {
              console.log(`Keeping active component: ${sibling.tagName}`);
            }
          });
        } else {
          console.log('Only one component found, keeping it');
        }
      }
    }, 50);
  }

  onRouterOutletDeactivate(component: any): void {
    console.log('Router outlet deactivated:', component.constructor.name);
    console.log('Current URL after deactivation:', this.router.url);
    
    // Don't do aggressive cleanup on deactivation - let the activation cleanup handle it
    // This prevents removing components too early
  }
}
