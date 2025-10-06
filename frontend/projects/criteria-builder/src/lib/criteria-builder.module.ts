import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

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
    HttpClientModule,
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