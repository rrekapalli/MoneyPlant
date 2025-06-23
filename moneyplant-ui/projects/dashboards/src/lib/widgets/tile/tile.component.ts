import {Component, Input, EventEmitter} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IWidget} from '../../entities/IWidget';

@Component({
  selector: 'vis-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class TileComponent {
  @Input() widget!: IWidget;
  @Input() onDataLoad!: EventEmitter<any>;
  @Input() onUpdateFilter!: EventEmitter<any>;
}
