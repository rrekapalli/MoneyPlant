import { DensityMapBuilder, DensityMapData } from './density-map-builder';

/**
 * Example data for Hong Kong population density
 */
export const hongKongDensityData: DensityMapData[] = [
  { name: 'Hong Kong Island', value: 100 },
  { name: 'Kowloon', value: 80 },
  { name: 'New Territories', value: 60 },
  { name: 'Lantau Island', value: 30 },
  { name: 'Lamma Island', value: 20 },
];

/**
 * Example data for US population density
 */
export const usDensityData: DensityMapData[] = [
  { name: 'California', value: 95 },
  { name: 'Texas', value: 85 },
  { name: 'Florida', value: 75 },
  { name: 'New York', value: 90 },
  { name: 'Illinois', value: 70 },
];

/**
 * Example data for China population density
 */
export const chinaDensityData: DensityMapData[] = [
  { name: 'Guangdong', value: 100 },
  { name: 'Shandong', value: 85 },
  { name: 'Henan', value: 80 },
  { name: 'Sichuan', value: 75 },
  { name: 'Jiangsu', value: 90 },
];

/**
 * Basic Hong Kong density map example
 */
export function createBasicHongKongMap() {
  return DensityMapBuilder.create()
    .setData(hongKongDensityData)
    .setMap('HK')
    .setHeader('Hong Kong Population Density')
    .setPosition({ x: 0, y: 0, cols: 6, rows: 4 })
    .build();
}

/**
 * Advanced Hong Kong density map with custom styling
 */
export function createAdvancedHongKongMap() {
  return DensityMapBuilder.create()
    .setData(hongKongDensityData)
    .setMap('HK')
    .setTitle('Hong Kong Population Density', '2023 Data')
    .setVisualMap(0, 100, ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8'])
    .setRoam(true)
    .setZoom(1.2)
    .setCenter([114.1694, 22.3193])
    .setLabelShow(true, 'inside', '{b}\n{c}')
    .setAreaColor('#f5f5f5')
    .setBorderColor('#999', 0.5)
    .setEmphasisColor('#b8e186')
    .setShadow(15, 'rgba(0, 0, 0, 0.4)')
    .setTooltip('item', '{b}: {c} people/km²')
    .setHeader('Population Density Map')
    .setPosition({ x: 0, y: 0, cols: 8, rows: 6 })
    .build();
}

/**
 * US density map example
 */
export function createUSMap() {
  return DensityMapBuilder.create()
    .setData(usDensityData)
    .setMap('US')
    .setTitle('US Population Density', 'State-wise distribution')
    .setVisualMap(0, 100, ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15'])
    .setRoam(true)
    .setZoom(1.0)
    .setCenter([-98.5795, 39.8283])
    .setLabelShow(true, 'inside', '{b}')
    .setTooltip('item', '{b}: {c}%')
    .setHeader('US Population Density')
    .setPosition({ x: 0, y: 0, cols: 8, rows: 6 })
    .build();
}

/**
 * China density map example
 */
export function createChinaMap() {
  return DensityMapBuilder.create()
    .setData(chinaDensityData)
    .setMap('CN')
    .setTitle('China Population Density', 'Province-wise distribution')
    .setVisualMap(0, 100, ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476'])
    .setRoam(true)
    .setZoom(1.1)
    .setCenter([104.1954, 35.8617])
    .setLabelShow(true, 'inside', '{b}')
    .setTooltip('item', '{b}: {c}%')
    .setHeader('China Population Density')
    .setPosition({ x: 0, y: 0, cols: 8, rows: 6 })
    .build();
}

/**
 * Interactive density map with custom visual map
 */
export function createInteractiveDensityMap() {
  return DensityMapBuilder.create()
    .setData(hongKongDensityData)
    .setMap('HK')
    .setTitle('Interactive Population Density', 'Hover for details')
    .setVisualMap(0, 100, ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8'])
    .setRoam(true)
    .setZoom(1.5)
    .setCenter([114.1694, 22.3193])
    .setLabelShow(true, 'inside', '{b}')
    .setAreaColor('#f8f9fa')
    .setBorderColor('#dee2e6', 1)
    .setEmphasisColor('#28a745')
    .setShadow(20, 'rgba(0, 0, 0, 0.5)')
    .setTooltip('item', (params: any) => {
      return `${params.name}<br/>Density: ${params.value} people/km²`;
    })
    .setVisualMapOptions({
      calculable: true,
      left: 'left',
      top: 'bottom',
      text: ['High Density', 'Low Density'],
      textStyle: {
        color: '#333',
        fontSize: 12,
      },
    })
    .setHeader('Interactive Density Map')
    .setPosition({ x: 0, y: 0, cols: 10, rows: 8 })
    .build();
}

/**
 * Minimal density map for small widgets
 */
export function createMinimalDensityMap() {
  return DensityMapBuilder.create()
    .setData(hongKongDensityData.slice(0, 3))
    .setMap('HK')
    .setVisualMap(0, 100, ['#313695', '#74add1', '#e0f3f8'])
    .setRoam(false)
    .setZoom(1.0)
    .setLabelShow(false)
    .setTooltip('item', '{b}: {c}')
    .setHeader('Density Overview')
    .setPosition({ x: 0, y: 0, cols: 4, rows: 3 })
    .build();
}

/**
 * Example of updating density map data
 */
export function updateDensityMapData(widget: any, newData: DensityMapData[]) {
  DensityMapBuilder.updateData(widget, newData);
}

/**
 * Example of checking if a widget is a density map
 */
export function isDensityMapWidget(widget: any): boolean {
  return DensityMapBuilder.isDensityMap(widget);
} 