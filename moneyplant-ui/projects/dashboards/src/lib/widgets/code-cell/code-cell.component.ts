import {Component, Input, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IWidget} from '../../entities/IWidget';

@Component({
  selector: 'vis-code-cell',
  templateUrl: './code-cell.component.html',
  styleUrls: ['./code-cell.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class CodeCellComponent {
  @Input() widget!: IWidget;
  @Input() onDataLoad!: EventEmitter<any>;
  @Input() onUpdateFilter!: EventEmitter<any>;
}
