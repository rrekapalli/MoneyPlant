import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IWidget } from '../../entities/IWidget';
import * as d3 from 'd3';

interface PieData {
  value: number;
  name: string;
  color?: string;
}

interface PieArcDatum extends d3.PieArcDatum<PieData> {
  data: PieData;
}

@Component({
  selector: 'd3-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #chartContainer class="d3-chart-container" [id]="widget.id">
      <!-- Chart will be rendered here -->
    </div>
  `,
  styles: [`
    .d3-chart-container {
      width: 100%;
      height: 100%;
      min-height: 200px;
      position: relative;
    }
  `]
})
export class D3ChartComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() widget!: IWidget;
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef<HTMLElement>;

  private chartInstance: any = null;
  private resizeObserver: ResizeObserver | null = null;

  ngOnInit(): void {
    // Component initialization
  }

  ngAfterViewInit(): void {
    this.renderChart();
    this.setupResizeObserver();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * Render the D3.js chart based on widget configuration
   */
  private renderChart(): void {
    if (!this.widget || !this.chartContainer) return;

    const container = this.chartContainer.nativeElement;
    const options = this.widget.config.options as any;
    const data = this.widget.data;
    const chartType = options?.chartType;

    if (!chartType || !data) return;

    // Clear existing chart
    this.cleanup();

    // Render chart based on type
    switch (chartType) {
      case 'd3-pie':
        this.renderPieChart(container, data, options);
        break;
      // Add more chart types here as they are implemented
      default:
        console.warn('Unsupported D3 chart type:', chartType);
    }
  }

  /**
   * Render D3.js pie chart
   */
  private renderPieChart(container: HTMLElement, data: PieData[], options: any): void {
    const width = options.width || 400;
    const height = options.height || 400;
    const margin = options.margin || { top: 20, right: 20, bottom: 20, left: 20 };
    const colors = options.colors || ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'];

    const chartWidth = width - (margin.left || 0) - (margin.right || 0);
    const chartHeight = height - (margin.top || 0) - (margin.bottom || 0);
    const radius = Math.min(chartWidth, chartHeight) / 2;

    // Create SVG
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block');
    
    // Create chart group
    const g = svg
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Create color scale
    const color = d3.scaleOrdinal<string, string>().range(colors);

    // Create pie generator
    const pie = d3.pie<PieData>()
      .value(d => d.value);

    // Create arc generator
    const arc = d3.arc<PieArcDatum>()
      .innerRadius(options.series?.innerRadius || 0)
      .outerRadius(options.series?.radius || radius)
      .padAngle(options.series?.padAngle || 0)
      .cornerRadius(options.series?.cornerRadius || 0);

    // Create tooltip
    let tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined> | null = null;
    if (options.tooltip?.show) {
      tooltip = d3.select('body')
        .append('div')
        .attr('class', 'd3-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('opacity', 0) as unknown as d3.Selection<HTMLDivElement, unknown, null, undefined>;
    }

    // Create pie chart
    const pieGroup = g.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    // Add paths
    const paths = pieGroup
      .append('path')
      .attr('d', arc)
      .attr('fill', (d: PieArcDatum, i: number) => d.data.color || color(i.toString()))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Add animations
    if (options.animation?.enabled) {
      paths
        .transition()
        .duration(options.animation.duration || 750)
        .attrTween('d', function(d: PieArcDatum) {
          const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
          return function(t: number) {
            return arc(interpolate(t)) || '';
          };
        });
    }

    // Add tooltip events
    if (tooltip && options.tooltip?.show) {
      paths
        .on('mouseover', (event: MouseEvent, d: PieArcDatum) => {
          tooltip!.style('opacity', 1);
          const formatter = options.tooltip?.formatter || ((d: PieArcDatum) => `${d.data.name}: ${d.data.value}`);
          tooltip!.html(formatter(d))
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', () => {
          tooltip!.style('opacity', 0);
        });
    }

    // Add labels
    const labels = pieGroup
      .append('text')
      .attr('transform', (d: PieArcDatum) => `translate(${arc.centroid(d)})`)
      .attr('dy', '0.35em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#fff')
      .style('font-weight', 'bold')
      .text((d: PieArcDatum) => {
        const percentage = ((d.endAngle - d.startAngle) / (2 * Math.PI) * 100).toFixed(1);
        return percentage + '%';
      });

    // Add legend
    if (options.legend?.show) {
      this.renderLegend(g, data, color, options);
    }

    // Store chart instance for updates
    this.chartInstance = {
      svg,
      pie,
      arc,
      color,
      tooltip,
      container,
      options,
      updateData: (newData: PieData[]) => this.updatePieChart(newData, options),
    };

    // Set chart instance in widget
    if (this.widget) {
      this.widget.chartInstance = this.chartInstance;
    }
  }

  /**
   * Update pie chart with new data
   */
  private updatePieChart(data: PieData[], options: any): void {
    if (!this.chartInstance || !this.chartInstance.svg) return;

    const { pie, arc, color, tooltip } = this.chartInstance;

    // Update pie data
    const pieData = pie(data);

    // Update paths
    const paths = this.chartInstance.svg.selectAll('.arc path')
      .data(pieData);

    // Remove old paths
    paths.exit().remove();

    // Add new paths
    const newPaths = paths.enter()
      .append('path')
      .attr('fill', (d: PieArcDatum, i: number) => d.data.color || color(i.toString()))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer');

    // Merge and update all paths
    const allPaths = newPaths.merge(paths as any)
      .attr('d', arc)
      .attr('fill', (d: PieArcDatum, i: number) => d.data.color || color(i.toString()));

    // Add animations
    if (options.animation?.enabled) {
      allPaths
        .transition()
        .duration(options.animation.duration || 750)
        .attrTween('d', function(d: PieArcDatum) {
          const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
          return function(t: number) {
            return arc(interpolate(t)) || '';
          };
        });
    }

    // Update tooltip events
    if (tooltip && options.tooltip?.show) {
      allPaths
        .on('mouseover', (event: MouseEvent, d: PieArcDatum) => {
          tooltip.style('opacity', 1);
          const formatter = options.tooltip?.formatter || ((d: PieArcDatum) => `${d.data.name}: ${d.data.value}`);
          tooltip.html(formatter(d))
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', () => {
          tooltip.style('opacity', 0);
        });
    }

    // Update labels
    const labels = this.chartInstance.svg.selectAll('.arc text')
      .data(pieData);

    labels.exit().remove();

    const newLabels = labels.enter()
      .append('text')
      .attr('dy', '0.35em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#fff')
      .style('font-weight', 'bold');

    newLabels.merge(labels as any)
      .attr('transform', (d: PieArcDatum) => `translate(${arc.centroid(d)})`)
      .text((d: PieArcDatum) => {
        const percentage = ((d.endAngle - d.startAngle) / (2 * Math.PI) * 100).toFixed(1);
        return percentage + '%';
      });

    // Update legend
    if (options.legend?.show) {
      this.updateLegend(data, color, options);
    }
  }

  /**
   * Render legend
   */
  private renderLegend(g: d3.Selection<SVGGElement, unknown, null, undefined>, data: PieData[], color: d3.ScaleOrdinal<string, string, never>, options: any): void {
    const legendGroup = g.append('g')
      .attr('class', 'legend')
      .attr('transform', 'translate(200, -150)');

    const legendItems = legendGroup.selectAll('.legend-item')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d: PieData, i: number) => `translate(0, ${i * 20})`);

    legendItems.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', (d: PieData, i: number) => d.color || color(i.toString()));

    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 9)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .text((d: PieData) => d.name);
  }

  /**
   * Update legend
   */
  private updateLegend(data: PieData[], color: d3.ScaleOrdinal<string, string, never>, options: any): void {
    if (!this.chartInstance || !this.chartInstance.svg) return;

    const legendGroup = this.chartInstance.svg.select('.legend');
    if (legendGroup.empty()) return;

    const legendItems = legendGroup.selectAll('.legend-item')
      .data(data);

    legendItems.exit().remove();

    const newLegendItems = legendItems.enter()
      .append('g')
      .attr('class', 'legend-item');

    newLegendItems.append('rect')
      .attr('width', 12)
      .attr('height', 12);

    newLegendItems.append('text')
      .attr('x', 20)
      .attr('y', 9)
      .attr('dy', '0.35em')
      .style('font-size', '12px');

    const allLegendItems = newLegendItems.merge(legendItems as any)
      .attr('transform', (d: PieData, i: number) => `translate(0, ${i * 20})`);

    allLegendItems.select('rect')
      .attr('fill', (d: PieData, i: number) => d.color || color(i.toString()));

    allLegendItems.select('text')
      .text((d: PieData) => d.name);
  }

  /**
   * Setup resize observer for responsive charts
   */
  private setupResizeObserver(): void {
    if (this.chartContainer && 'ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        // Re-render chart on resize
        setTimeout(() => this.renderChart(), 100);
      });
      this.resizeObserver.observe(this.chartContainer.nativeElement);
    }
  }

  /**
   * Clean up chart resources
   */
  private cleanup(): void {
    if (this.chartInstance) {
      if (this.chartInstance.svg) {
        this.chartInstance.svg.remove();
      }
      if (this.chartInstance.tooltip) {
        this.chartInstance.tooltip.remove();
      }
      this.chartInstance = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }
} 