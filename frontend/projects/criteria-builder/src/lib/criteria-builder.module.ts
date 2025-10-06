import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Angular CDK modules
import { DragDropModule } from '@angular/cdk/drag-drop';

// PrimeNG modules
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PanelModule } from 'primeng/panel';

// Standalone component is exported separately
import { AcCriteriaBuilderComponent } from './components/ac-criteria-builder.component';
import { AcTokenRendererComponent } from './components/ac-token-renderer.component';
import { CriteriaBuilderService } from './criteria-builder.service';

// Overlay components
import { InteractionOverlayManagerComponent } from './components/interaction-overlay-manager.component';
import { DropdownContentComponent } from './components/dropdown-content.component';
import { FunctionDialogContentComponent } from './components/function-dialog-content.component';
import { ValueInputContentComponent } from './components/value-input-content.component';
import { ContextMenuComponent } from './components/context-menu.component';

// Placeholder components for child components (will be implemented in later tasks)
import { 
  AcBuilderToolbarComponent,
  AcErrorBannerComponent,
  AcTokenQueryDisplayComponent
} from './components/placeholders';

// Implemented components
import { AcSqlPreviewComponent } from './components/ac-sql-preview.component';

/**
 * Criteria Builder Module
 * Provides the main criteria builder component and related services
 */
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    DragDropModule,
    ButtonModule,
    DialogModule,
    PanelModule,
    // Standalone overlay components
    InteractionOverlayManagerComponent,
    DropdownContentComponent,
    FunctionDialogContentComponent,
    ValueInputContentComponent,
    ContextMenuComponent
  ],
  declarations: [
    AcCriteriaBuilderComponent,
    AcBuilderToolbarComponent,
    AcErrorBannerComponent,
    AcTokenQueryDisplayComponent,
    AcSqlPreviewComponent
  ],
  exports: [
    AcCriteriaBuilderComponent,
    // Overlay components
    InteractionOverlayManagerComponent,
    DropdownContentComponent,
    FunctionDialogContentComponent,
    ValueInputContentComponent,
    ContextMenuComponent
  ],
  providers: [
    CriteriaBuilderService
  ]
})
export class CriteriaBuilderModule { }