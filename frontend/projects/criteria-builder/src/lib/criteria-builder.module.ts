import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

// Components
import { MpCriteriaBuilderComponent } from './components/mp-criteria-builder.component';
import { FieldBadgeComponent } from './components/badges/field-badge.component';
import { OperatorBadgeComponent } from './components/badges/operator-badge.component';
import { ValueBadgeComponent } from './components/badges/value-badge.component';
import { FunctionBadgeComponent } from './components/badges/function-badge.component';
import { GroupBadgeComponent } from './components/badges/group-badge.component';

// Services
import { CriteriaSerializerService } from './services/criteria-serializer.service';
import { CriteriaValidationService } from './services/criteria-validation.service';

@NgModule({
  declarations: [
    MpCriteriaBuilderComponent,
    FieldBadgeComponent,
    OperatorBadgeComponent,
    ValueBadgeComponent,
    FunctionBadgeComponent,
    GroupBadgeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule
  ],
  providers: [
    CriteriaSerializerService,
    CriteriaValidationService
  ],
  exports: [
    MpCriteriaBuilderComponent,
    FieldBadgeComponent,
    OperatorBadgeComponent,
    ValueBadgeComponent,
    FunctionBadgeComponent,
    GroupBadgeComponent
  ]
})
export class MpCriteriaBuilderModule { }
