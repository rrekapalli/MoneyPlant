import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Angular CDK modules
import { DragDropModule } from '@angular/cdk/drag-drop';

// PrimeNG modules for toolbar functionality
import { ButtonModule } from 'primeng/button';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

import { CriteriaBuilderComponent } from './criteria-builder';
import { AcCriteriaBuilderComponent } from './components/ac-criteria-builder.component';
import { CriteriaBuilderService } from './criteria-builder.service';

// Placeholder components for child components (will be implemented in later tasks)
import { 
  AcBuilderToolbarComponent,
  AcErrorBannerComponent,
  AcTokenQueryDisplayComponent,
  AcSqlPreviewComponent
} from './components/placeholders';

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
    // Angular CDK modules
    DragDropModule,
    // PrimeNG modules
    ButtonModule,
    ToggleButtonModule,
    DialogModule,
    InputTextModule,
    TooltipModule,
    CriteriaBuilderComponent // Import standalone component
  ],
  declarations: [
    AcCriteriaBuilderComponent,
    AcBuilderToolbarComponent,
    AcErrorBannerComponent,
    AcTokenQueryDisplayComponent,
    AcSqlPreviewComponent
  ],
  exports: [
    CriteriaBuilderComponent, // Export imported standalone component
    AcCriteriaBuilderComponent
  ],
  providers: [
    CriteriaBuilderService
  ]
})
export class CriteriaBuilderModule { }