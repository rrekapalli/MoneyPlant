import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {IWidget} from '../../entities/IWidget';

declare global {
  interface Window {
    MyReactComponent: any;
  }
}

@Component({
  selector: 'app-react-component-wrapper',
  template: `
    <div>
      <my-react-component [widget]="widget"></my-react-component>
    </div>
  `, // Note the template now has a local reference `reactRoot`
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true,
})
export class ReactComponentWrapperComponent implements OnInit, OnDestroy {
  @Input() widget!: IWidget;
  @Input() onDataLoad!: EventEmitter<IWidget>;
  @Input() onUpdateFilter!: EventEmitter<any>;
  @ViewChild('react') reactElement: any;

  constructor(private elementRef: ElementRef) {
  }

  ngOnInit(): void {
    // this.renderReactComponent()
  }

  ngOnDestroy(): void {
  }
}
