import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { TabViewModule } from 'primeng/tabview';
import { FeatureFlagDirective } from '../../core/directives';

// Tab Components
import { OverallComponent } from './overall/overall.component';
import { TodayComponent } from './today/today.component';
import { ThisWeekComponent } from './this-week/this-week.component';
import { ThisMonthComponent } from './this-month/this-month.component';
import { ThisYearComponent } from './this-year/this-year.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    MessageModule,
    TooltipModule,
    TabViewModule,
    FeatureFlagDirective,
    // Tab Components
    OverallComponent,
    TodayComponent,
    ThisWeekComponent,
    ThisMonthComponent,
    ThisYearComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  activeTabIndex: number = 0;

  constructor() {}
} 
