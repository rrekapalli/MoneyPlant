import {Component, Input, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IWidget} from '../../entities/IWidget';

@Component({
  selector: 'vis-markdown-cell',
  templateUrl: './markdown-cell.component.html',
  styleUrls: ['./markdown-cell.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class MarkdownCellComponent {
  @Input() widget!: IWidget;
  @Input() onDataLoad!: EventEmitter<any>;
  @Input() onUpdateFilter!: EventEmitter<any>;
}
