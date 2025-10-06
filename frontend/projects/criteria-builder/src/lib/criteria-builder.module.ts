import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { CriteriaBuilderComponent } from './criteria-builder';
import { CriteriaBuilderService } from './criteria-builder.service';

/**
 * Criteria Builder Module
 * Provides the main criteria builder component and related services
 */
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CriteriaBuilderComponent
  ],
  exports: [
    CriteriaBuilderComponent
  ],
  providers: [
    CriteriaBuilderService
  ]
})
export class CriteriaBuilderModule { }