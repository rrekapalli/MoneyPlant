// Event Interfaces for Criteria Builder Library

// Criteria Change Event Interface
export interface CriteriaChangeEvent {
  dsl: CriteriaDSL;
  isValid: boolean;
  sqlPreview: string;
  changeType: 'add' | 'remove' | 'modify' | 'reorder';
  affectedBadgeId?: string;
}

// Badge Action Event Interface
export interface BadgeActionEvent {
  action: 'select' | 'edit' | 'delete' | 'drag' | 'drop' | 'toggle';
  badgeId: string;
  badgeType: string;
  data?: any;
}

// Import necessary types
import { CriteriaDSL } from './criteria.models';
