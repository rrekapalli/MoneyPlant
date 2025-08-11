import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { QueryBuilderComponent } from './components/query-builder.component';
import { QueryRuleComponent } from './components/query-rule.component';
import { QueryRuleSetComponent } from './components/query-rule-set.component';
import { QueryBuilderService } from './services/query-builder.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    QueryBuilderComponent,
    QueryRuleComponent,
    QueryRuleSetComponent
  ],
  exports: [
    QueryBuilderComponent,
    QueryRuleComponent,
    QueryRuleSetComponent
  ],
  providers: [QueryBuilderService]
})
export class QueryBuilderModule { }
