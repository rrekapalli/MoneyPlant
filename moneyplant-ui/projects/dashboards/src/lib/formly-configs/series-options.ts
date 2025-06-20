export const dataOptions = [
  {
    key: 'series',
    type: 'series-accordion',
    templateOptions: {
      label: 'Series',
    },
    fieldArray: {
      fieldGroup: [
        {
          key: 'type',
          type: 'select',
          templateOptions: {
            label: 'Chart Type',
            placeholder: '',
            options: [
              {label: 'bar', value: 'bar'},
              {label: 'pie', value: 'pie'},
              {label: 'scatter', value: 'scatter'},
            ],
            attributes: {
              style: 'display:grid; width: 100%; margin-bottom:1rem',
            },
          },
        },
        {
          key: 'id',
          type: 'input',
          templateOptions: {
            label: 'Id',
            placeholder: '',
            attributes: {
              style: 'display:grid; width: 100%; margin-bottom:1rem',
            },
          },
        },
        {
          key: 'name',
          type: 'input',
          templateOptions: {
            label: 'Name',
            placeholder: '',
            attributes: {
              style: 'display:grid; width: 100%; margin-bottom:1rem',
            },
          },
        },
        {
          key: 'colorBy',
          type: 'select',
          templateOptions: {
            label: 'Color By',
            placeholder: '',
            options: [
              {label: 'Series', value: 'series'},
              {label: 'Data', value: 'data'},
            ],
            attributes: {
              style: 'display:grid; width: 100%; margin-bottom:1rem',
            },
          },
        },
        {
          key: 'legendHoverLink',
          type: 'radio',
          templateOptions: {
            label: 'Legend Hover',
            options: [
              {label: 'True', value: true},
              {label: 'False', value: false},
            ],
            attributes: {
              style: 'display:grid; width: 100%; margin-bottom:1rem',
            },
          },
        },
        {
          key: 'coordinateSystem',
          type: 'select',
          templateOptions: {
            label: 'Co-Ordinate System',
            options: [
              {label: 'cartesian2d', value: 'cartesian2d'},
              {label: 'polar', value: 'polar'},
            ],
            attributes: {
              style: 'display:grid; width: 100%; margin-bottom:1rem',
            },
          },
        },
        {
          key: 'roundedCap',
          type: 'radio',
          templateOptions: {
            label: 'Rounded Cap',
            options: [
              {label: 'True', value: true},
              {label: 'False', value: false},
            ],
            attributes: {
              style: 'display:grid; width: 100%; margin-bottom:1rem',
            },
          },
        },
        {
          key: 'realtimeSort',
          type: 'radio',
          templateOptions: {
            label: 'Real-Time Sort',
            options: [
              {label: 'True', value: true},
              {label: 'False', value: false},
            ],
            attributes: {
              style: 'display:grid; width: 100%; margin-bottom:1rem',
            },
          },
        },
        {
          key: 'showBackground',
          type: 'radio',
          templateOptions: {
            label: 'Show Background',
            options: [
              {label: 'True', value: true},
              {label: 'False', value: false},
            ],
            attributes: {
              style: 'display:grid; width: 100%; margin-bottom:1rem',
            },
          },
        },
        {
          key: 'backgroundStyle',
          type: 'accordion',
          templateOptions: {
            label: 'Background Style',
          },
          fieldGroup: [
            {
              key: 'color',
              type: 'input',
              templateOptions: {
                label: 'Color',
                placeHhlder: '#fff',
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'borderColor',
              type: 'input',
              templateOptions: {
                label: 'Border Color',
                placeholder: '#fff',
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'borderWidth',
              type: 'input',
              templateOptions: {
                label: 'Border Width',
                placeHolder: '',
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'borderType',
              type: 'select',
              templateOptions: {
                label: 'Border Type',
                options: [
                  {label: 'Solid', value: 'solid'},
                  {label: 'Dashed', value: 'dashed'},
                  {label: 'Dotted', value: 'dotted'},
                ],
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'borderRadius',
              type: 'input',
              templateOptions: {
                label: 'Border Radius',
                placeholder: '',
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'opacity',
              type: 'input',
              templateOptions: {
                label: 'Opacity',
                placeholder: '',
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
          ],
        },
        {
          key: 'label',
          type: 'accordion',
          templateOptions: {
            label: 'Label',
          },
          fieldGroup: [
            {
              key: 'show',
              type: 'radio',
              templateOptions: {
                label: 'Show Label',
                options: [
                  {label: 'True', value: true},
                  {label: 'False', value: false},
                ],
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'formatter',
              type: 'input',
              templateOptions: {
                label: 'formatter',
                placeholder: '{ }',
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'color',
              type: 'input',
              templateOptions: {
                label: 'Color',
                placeholder: '#fff',
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'fontStyle',
              type: 'select',
              templateOptions: {
                label: 'Font Style',
                options: [
                  {label: 'normal', value: 'normal'},
                  {label: 'italic', value: 'italic'},
                  {label: 'oblique', value: 'oblique'},
                ],
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'fontWeight',
              type: 'select',
              templateOptions: {
                label: 'Font Weight',
                options: [
                  {label: 'normal', value: 'normal'},
                  {label: 'bold', value: 'bold'},
                  {label: 'lighter', value: 'lighter'},
                ],
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'fontSize',
              type: 'input',
              templateOptions: {
                label: 'Font Size',
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'align',
              type: 'select',
              templateOptions: {
                label: 'Align',
                options: [
                  {label: 'left', value: 'left'},
                  {label: 'center', value: 'center'},
                  {label: 'right', value: 'right'},
                ],
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'verticalAlign',
              type: 'select',
              templateOptions: {
                label: 'Vertical Align',
                options: [
                  {label: 'top', value: 'top'},
                  {label: 'middle', value: 'middle'},
                  {label: 'bottom', value: 'bottom'},
                ],
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'backgroundColor',
              type: 'input',
              templateOptions: {
                label: 'Background Color',
                placeholder: '#fff',
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'borderColor',
              type: 'input',
              templateOptions: {
                label: 'Border Color',
                placeholder: '#fff',
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'borderWidth',
              type: 'input',
              templateOptions: {
                label: 'Border Width',
                placeholder: '',
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'borderType',
              type: 'select',
              templateOptions: {
                label: 'Border Type',
                options: [
                  {label: 'Solid', value: 'solid'},
                  {label: 'Dashed', value: 'dashed'},
                  {label: 'Dotted', value: 'dotted'},
                ],
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'borderRadius',
              type: 'input',
              templateOptions: {
                label: 'Border Radius',
                placeholder: '',
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'padding',
              type: 'input',
              templateOptions: {
                label: 'Padding',
                placeholder: '',
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'overFlow',
              type: 'select',
              templateOptions: {
                label: 'OverFlow',
                options: [
                  {label: 'Truncate', value: 'truncate'},
                  {label: 'Break', value: 'break'},
                  {label: 'BreakAll', value: 'breakAll'},
                ],
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'position',
              type: 'select',
              templateOptions: {
                label: 'Label Position',
                placeholder: '',
                options: [
                  {label: 'top', value: 'top'},
                  {label: 'left', value: 'left'},
                  {label: 'right', value: 'right'},
                  {label: 'bottom', value: 'bottom'},
                  {label: 'inside', value: 'inside'},
                  {label: 'insideLeft', value: 'insideLeft'},
                  {label: 'insideRight', value: 'insideRight'},
                  {label: 'insideTop', value: 'insideTop'},
                  {label: 'insideBottom', value: 'insideBottom'},
                  {label: 'insideTopLeft', value: 'insideTopLeft'},
                  {label: 'insideBottomLeft', value: 'insideBottomLeft'},
                  {label: 'insideTopRight', value: 'insideTopRight'},
                  {label: 'insideBottomRight', value: 'insideBottomRight'},
                ],
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
          ],
        },
        {
          key: 'labelLine',
          type: 'accordion',
          templateOptions: {
            label: 'Label Line',
          },
          fieldGroup: [
            {
              key: 'show',
              type: 'radio',
              templateOptions: {
                label: 'Show Label',
                options: [
                  {label: 'True', value: true},
                  {label: 'False', value: false},
                ],
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'lineStyle',
              type: 'accordion',
              templateOptions: {
                label: 'Line Style',
              },
              fieldGroup: [
                {
                  key: 'color',
                  type: 'input',
                  templateOptions: {
                    label: 'Color',
                    placeholder: '#fff',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'width',
                  type: 'input',
                  templateOptions: {
                    label: 'Width',
                    placeholder: '',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'type',
                  type: 'select',
                  templateOptions: {
                    label: 'Type',
                    options: [
                      {label: 'Solid', value: 'solid'},
                      {label: 'Dashed', value: 'dashed'},
                      {label: 'Dotted', value: 'dotted'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'cap',
                  type: 'select',
                  templateOptions: {
                    label: 'Cap',
                    options: [
                      {label: 'butt', value: 'butt'},
                      {label: 'round', value: 'round'},
                      {label: 'square', value: 'square'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'join',
                  type: 'select',
                  templateOptions: {
                    label: 'Join',
                    options: [
                      {label: 'bevel', value: 'bevel'},
                      {label: 'round', value: 'round'},
                      {label: 'miter', value: 'miter'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          key: 'itemStyle',
          type: 'accordion',
          templateOptions: {
            label: 'Item Style',
          },
          fieldGroup: [
            {
              key: 'color',
              type: 'input',
              templateOptions: {
                label: 'Color',
                placeHhlder: '#fff',
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'borderColor',
              type: 'input',
              templateOptions: {
                label: 'Border Color',
                placeholder: '#fff',
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'borderWidth',
              type: 'input',
              templateOptions: {
                label: 'Border Width',
                placeHolder: '',
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'borderType',
              type: 'select',
              templateOptions: {
                label: 'Border Type',
                options: [
                  {label: 'Solid', value: 'solid'},
                  {label: 'Dashed', value: 'dashed'},
                  {label: 'Dotted', value: 'dotted'},
                ],
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'borderRadius',
              type: 'input',
              templateOptions: {
                label: 'Border Radius',
                placeholder: '',
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'opacity',
              type: 'input',
              templateOptions: {
                label: 'Opacity',
                placeholder: '',
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
          ],
        },
        {
          key: 'labelLayout',
          type: 'accordion',
          templateOptions: {
            label: 'labelLayout',
          },
          fieldGroup: [],
        },
        {
          key: 'emphasis',
          type: 'accordion',
          templateOptions: {
            label: 'Emphasis',
          },
          fieldGroup: [
            {
              key: 'disabled',
              type: 'radio',
              templateOptions: {
                label: 'Disabled',
                options: [
                  {label: 'True', value: true},
                  {label: 'False', value: false},
                ],
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'focus',
              type: 'select',
              templateOptions: {
                label: 'Focus',
                options: [
                  {label: 'none', value: 'none'},
                  {label: 'self', value: 'self'},
                  {label: 'series', value: 'series'},
                ],
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'blurScope',
              type: 'select',
              templateOptions: {
                label: 'Blur Scope',
                options: [
                  {label: 'coordinateSystem', value: 'coordinateSystem'},
                  {label: 'series', value: 'series'},
                  {label: 'global', value: 'global'},
                ],
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'label',
              type: 'accordion',
              templateOptions: {
                label: 'Label',
              },
              fieldGroup: [
                {
                  key: 'show',
                  type: 'radio',
                  templateOptions: {
                    label: 'Show Label',
                    options: [
                      {label: 'True', value: true},
                      {label: 'False', value: false},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'formatter',
                  type: 'input',
                  templateOptions: {
                    label: 'formatter',
                    placeholder: '{ }',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'color',
                  type: 'input',
                  templateOptions: {
                    label: 'Color',
                    placeholder: '#fff',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'fontStyle',
                  type: 'select',
                  templateOptions: {
                    label: 'Font Style',
                    options: [
                      {label: 'normal', value: 'normal'},
                      {label: 'italic', value: 'italic'},
                      {label: 'oblique', value: 'oblique'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'fontWeight',
                  type: 'select',
                  templateOptions: {
                    label: 'Font Weight',
                    options: [
                      {label: 'normal', value: 'normal'},
                      {label: 'bold', value: 'bold'},
                      {label: 'lighter', value: 'lighter'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'fontSize',
                  type: 'input',
                  templateOptions: {
                    label: 'Font Size',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'align',
                  type: 'select',
                  templateOptions: {
                    label: 'Align',
                    options: [
                      {label: 'left', value: 'left'},
                      {label: 'center', value: 'center'},
                      {label: 'right', value: 'right'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'verticalAlign',
                  type: 'select',
                  templateOptions: {
                    label: 'Vertical Align',
                    options: [
                      {label: 'top', value: 'top'},
                      {label: 'middle', value: 'middle'},
                      {label: 'bottom', value: 'bottom'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'backgroundColor',
                  type: 'input',
                  templateOptions: {
                    label: 'Background Color',
                    placeholder: '#fff',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderColor',
                  type: 'input',
                  templateOptions: {
                    label: 'Border Color',
                    placeholder: '#fff',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderWidth',
                  type: 'input',
                  templateOptions: {
                    label: 'Border Width',
                    placeholder: '',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderType',
                  type: 'select',
                  templateOptions: {
                    label: 'Border Type',
                    options: [
                      {label: 'Solid', value: 'solid'},
                      {label: 'Dashed', value: 'dashed'},
                      {label: 'Dotted', value: 'dotted'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderRadius',
                  type: 'input',
                  templateOptions: {
                    label: 'Border Radius',
                    placeholder: '',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'padding',
                  type: 'input',
                  templateOptions: {
                    label: 'Padding',
                    placeholder: '',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'overFlow',
                  type: 'select',
                  templateOptions: {
                    label: 'OverFlow',
                    options: [
                      {label: 'Truncate', value: 'truncate'},
                      {label: 'Break', value: 'break'},
                      {label: 'BreakAll', value: 'breakAll'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'position',
                  type: 'select',
                  templateOptions: {
                    label: 'Label Position',
                    placeholder: '',
                    options: [
                      {label: 'top', value: 'top'},
                      {label: 'left', value: 'left'},
                      {label: 'right', value: 'right'},
                      {label: 'bottom', value: 'bottom'},
                      {label: 'inside', value: 'inside'},
                      {label: 'insideLeft', value: 'insideLeft'},
                      {label: 'insideRight', value: 'insideRight'},
                      {label: 'insideTop', value: 'insideTop'},
                      {label: 'insideBottom', value: 'insideBottom'},
                      {label: 'insideTopLeft', value: 'insideTopLeft'},
                      {label: 'insideBottomLeft', value: 'insideBottomLeft'},
                      {label: 'insideTopRight', value: 'insideTopRight'},
                      {
                        label: 'insideBottomRight',
                        value: 'insideBottomRight',
                      },
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
              ],
            },
            {
              key: 'labelLine',
              type: 'accordion',
              templateOptions: {
                label: 'Label Line',
              },
              fieldGroup: [
                {
                  key: 'show',
                  type: 'radio',
                  templateOptions: {
                    label: 'Show Label',
                    options: [
                      {label: 'True', value: true},
                      {label: 'False', value: false},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'lineStyle',
                  type: 'accordion',
                  templateOptions: {
                    label: 'Line Style',
                  },
                  fieldGroup: [
                    {
                      key: 'color',
                      type: 'input',
                      templateOptions: {
                        label: 'Color',
                        placeholder: '#fff',
                        attributes: {
                          style:
                            'display:grid; width: 100%; margin-bottom:1rem',
                        },
                      },
                    },
                    {
                      key: 'width',
                      type: 'input',
                      templateOptions: {
                        label: 'Width',
                        placeholder: '',
                        attributes: {
                          style:
                            'display:grid; width: 100%; margin-bottom:1rem',
                        },
                      },
                    },
                    {
                      key: 'type',
                      type: 'select',
                      templateOptions: {
                        label: 'Type',
                        options: [
                          {label: 'Solid', value: 'solid'},
                          {label: 'Dashed', value: 'dashed'},
                          {label: 'Dotted', value: 'dotted'},
                        ],
                        attributes: {
                          style:
                            'display:grid; width: 100%; margin-bottom:1rem',
                        },
                      },
                    },
                    {
                      key: 'cap',
                      type: 'select',
                      templateOptions: {
                        label: 'Cap',
                        options: [
                          {label: 'butt', value: 'butt'},
                          {label: 'round', value: 'round'},
                          {label: 'square', value: 'square'},
                        ],
                        attributes: {
                          style:
                            'display:grid; width: 100%; margin-bottom:1rem',
                        },
                      },
                    },
                    {
                      key: 'join',
                      type: 'select',
                      templateOptions: {
                        label: 'Join',
                        options: [
                          {label: 'bevel', value: 'bevel'},
                          {label: 'round', value: 'round'},
                          {label: 'miter', value: 'miter'},
                        ],
                        attributes: {
                          style:
                            'display:grid; width: 100%; margin-bottom:1rem',
                        },
                      },
                    },
                  ],
                },
              ],
            },
            {
              key: 'itemStyle',
              type: 'accordion',
              templateOptions: {
                label: 'Item Style',
              },
              fieldGroup: [
                {
                  key: 'color',
                  type: 'input',
                  templateOptions: {
                    label: 'Color',
                    placeHhlder: '#fff',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderColor',
                  type: 'input',
                  templateOptions: {
                    label: 'Border Color',
                    placeholder: '#fff',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderWidth',
                  type: 'input',
                  templateOptions: {
                    label: 'Border Width',
                    placeHolder: '',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderType',
                  type: 'select',
                  templateOptions: {
                    label: 'Border Type',
                    options: [
                      {label: 'Solid', value: 'solid'},
                      {label: 'Dashed', value: 'dashed'},
                      {label: 'Dotted', value: 'dotted'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderRadius',
                  type: 'input',
                  templateOptions: {
                    label: 'Border Radius',
                    placeholder: '',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'opacity',
                  type: 'input',
                  templateOptions: {
                    label: 'Opacity',
                    placeholder: '',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          key: 'blur',
          type: 'accordion',
          templateOptions: {
            label: 'Blur',
          },
          fieldGroup: [
            {
              key: 'label',
              type: 'accordion',
              templateOptions: {
                label: 'Label',
              },
              fieldGroup: [
                {
                  key: 'show',
                  type: 'radio',
                  templateOptions: {
                    label: 'Show Label',
                    options: [
                      {label: 'True', value: true},
                      {label: 'False', value: false},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'formatter',
                  type: 'input',
                  templateOptions: {
                    label: 'formatter',
                    placeholder: '{ }',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'color',
                  type: 'input',
                  templateOptions: {
                    label: 'Color',
                    placeholder: '#fff',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'fontStyle',
                  type: 'select',
                  templateOptions: {
                    label: 'Font Style',
                    options: [
                      {label: 'normal', value: 'normal'},
                      {label: 'italic', value: 'italic'},
                      {label: 'oblique', value: 'oblique'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'fontWeight',
                  type: 'select',
                  templateOptions: {
                    label: 'Font Weight',
                    options: [
                      {label: 'normal', value: 'normal'},
                      {label: 'bold', value: 'bold'},
                      {label: 'lighter', value: 'lighter'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'fontSize',
                  type: 'input',
                  templateOptions: {
                    label: 'Font Size',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'align',
                  type: 'select',
                  templateOptions: {
                    label: 'Align',
                    options: [
                      {label: 'left', value: 'left'},
                      {label: 'center', value: 'center'},
                      {label: 'right', value: 'right'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'verticalAlign',
                  type: 'select',
                  templateOptions: {
                    label: 'Vertical Align',
                    options: [
                      {label: 'top', value: 'top'},
                      {label: 'middle', value: 'middle'},
                      {label: 'bottom', value: 'bottom'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'backgroundColor',
                  type: 'input',
                  templateOptions: {
                    label: 'Background Color',
                    placeholder: '#fff',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderColor',
                  type: 'input',
                  templateOptions: {
                    label: 'Border Color',
                    placeholder: '#fff',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderWidth',
                  type: 'input',
                  templateOptions: {
                    label: 'Border Width',
                    placeholder: '',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderType',
                  type: 'select',
                  templateOptions: {
                    label: 'Border Type',
                    options: [
                      {label: 'Solid', value: 'solid'},
                      {label: 'Dashed', value: 'dashed'},
                      {label: 'Dotted', value: 'dotted'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderRadius',
                  type: 'input',
                  templateOptions: {
                    label: 'Border Radius',
                    placeholder: '',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'padding',
                  type: 'input',
                  templateOptions: {
                    label: 'Padding',
                    placeholder: '',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'overFlow',
                  type: 'select',
                  templateOptions: {
                    label: 'OverFlow',
                    options: [
                      {label: 'Truncate', value: 'truncate'},
                      {label: 'Break', value: 'break'},
                      {label: 'BreakAll', value: 'breakAll'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'position',
                  type: 'select',
                  templateOptions: {
                    label: 'Label Position',
                    placeholder: '',
                    options: [
                      {label: 'top', value: 'top'},
                      {label: 'left', value: 'left'},
                      {label: 'right', value: 'right'},
                      {label: 'bottom', value: 'bottom'},
                      {label: 'inside', value: 'inside'},
                      {label: 'insideLeft', value: 'insideLeft'},
                      {label: 'insideRight', value: 'insideRight'},
                      {label: 'insideTop', value: 'insideTop'},
                      {label: 'insideBottom', value: 'insideBottom'},
                      {label: 'insideTopLeft', value: 'insideTopLeft'},
                      {label: 'insideBottomLeft', value: 'insideBottomLeft'},
                      {label: 'insideTopRight', value: 'insideTopRight'},
                      {
                        label: 'insideBottomRight',
                        value: 'insideBottomRight',
                      },
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
              ],
            },
            {
              key: 'labelLine',
              type: 'accordion',
              templateOptions: {
                label: 'Label Line',
              },
              fieldGroup: [
                {
                  key: 'show',
                  type: 'radio',
                  templateOptions: {
                    label: 'Show Label',
                    options: [
                      {label: 'True', value: true},
                      {label: 'False', value: false},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'lineStyle',
                  type: 'accordion',
                  templateOptions: {
                    label: 'Line Style',
                  },
                  fieldGroup: [
                    {
                      key: 'color',
                      type: 'input',
                      templateOptions: {
                        label: 'Color',
                        placeholder: '#fff',
                        attributes: {
                          style:
                            'display:grid; width: 100%; margin-bottom:1rem',
                        },
                      },
                    },
                    {
                      key: 'width',
                      type: 'input',
                      templateOptions: {
                        label: 'Width',
                        placeholder: '',
                        attributes: {
                          style:
                            'display:grid; width: 100%; margin-bottom:1rem',
                        },
                      },
                    },
                    {
                      key: 'type',
                      type: 'select',
                      templateOptions: {
                        label: 'Type',
                        options: [
                          {label: 'Solid', value: 'solid'},
                          {label: 'Dashed', value: 'dashed'},
                          {label: 'Dotted', value: 'dotted'},
                        ],
                        attributes: {
                          style:
                            'display:grid; width: 100%; margin-bottom:1rem',
                        },
                      },
                    },
                    {
                      key: 'cap',
                      type: 'select',
                      templateOptions: {
                        label: 'Cap',
                        options: [
                          {label: 'butt', value: 'butt'},
                          {label: 'round', value: 'round'},
                          {label: 'square', value: 'square'},
                        ],
                        attributes: {
                          style:
                            'display:grid; width: 100%; margin-bottom:1rem',
                        },
                      },
                    },
                    {
                      key: 'join',
                      type: 'select',
                      templateOptions: {
                        label: 'Join',
                        options: [
                          {label: 'bevel', value: 'bevel'},
                          {label: 'round', value: 'round'},
                          {label: 'miter', value: 'miter'},
                        ],
                        attributes: {
                          style:
                            'display:grid; width: 100%; margin-bottom:1rem',
                        },
                      },
                    },
                  ],
                },
              ],
            },
            {
              key: 'itemStyle',
              type: 'accordion',
              templateOptions: {
                label: 'Item Style',
              },
              fieldGroup: [
                {
                  key: 'color',
                  type: 'input',
                  templateOptions: {
                    label: 'Color',
                    placeHhlder: '#fff',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderColor',
                  type: 'input',
                  templateOptions: {
                    label: 'Border Color',
                    placeholder: '#fff',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderWidth',
                  type: 'input',
                  templateOptions: {
                    label: 'Border Width',
                    placeHolder: '',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderType',
                  type: 'select',
                  templateOptions: {
                    label: 'Border Type',
                    options: [
                      {label: 'Solid', value: 'solid'},
                      {label: 'Dashed', value: 'dashed'},
                      {label: 'Dotted', value: 'dotted'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderRadius',
                  type: 'input',
                  templateOptions: {
                    label: 'Border Radius',
                    placeholder: '',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'opacity',
                  type: 'input',
                  templateOptions: {
                    label: 'Opacity',
                    placeholder: '',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          key: 'select',
          type: 'accordion',
          templateOptions: {
            label: 'Select',
          },
          fieldGroup: [
            {
              key: 'disabled',
              type: 'radio',
              templateOptions: {
                label: 'Disabled',
                options: [
                  {label: 'True', value: true},
                  {label: 'False', value: false},
                ],
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'label',
              type: 'accordion',
              templateOptions: {
                label: 'Label',
              },
              fieldGroup: [
                {
                  key: 'show',
                  type: 'radio',
                  templateOptions: {
                    label: 'Show Label',
                    options: [
                      {label: 'True', value: true},
                      {label: 'False', value: false},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'formatter',
                  type: 'input',
                  templateOptions: {
                    label: 'formatter',
                    placeholder: '{ }',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'color',
                  type: 'input',
                  templateOptions: {
                    label: 'Color',
                    placeholder: '#fff',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'fontStyle',
                  type: 'select',
                  templateOptions: {
                    label: 'Font Style',
                    options: [
                      {label: 'normal', value: 'normal'},
                      {label: 'italic', value: 'italic'},
                      {label: 'oblique', value: 'oblique'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'fontWeight',
                  type: 'select',
                  templateOptions: {
                    label: 'Font Weight',
                    options: [
                      {label: 'normal', value: 'normal'},
                      {label: 'bold', value: 'bold'},
                      {label: 'lighter', value: 'lighter'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'fontSize',
                  type: 'input',
                  templateOptions: {
                    label: 'Font Size',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'align',
                  type: 'select',
                  templateOptions: {
                    label: 'Align',
                    options: [
                      {label: 'left', value: 'left'},
                      {label: 'center', value: 'center'},
                      {label: 'right', value: 'right'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'verticalAlign',
                  type: 'select',
                  templateOptions: {
                    label: 'Vertical Align',
                    options: [
                      {label: 'top', value: 'top'},
                      {label: 'middle', value: 'middle'},
                      {label: 'bottom', value: 'bottom'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'backgroundColor',
                  type: 'input',
                  templateOptions: {
                    label: 'Background Color',
                    placeholder: '#fff',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderColor',
                  type: 'input',
                  templateOptions: {
                    label: 'Border Color',
                    placeholder: '#fff',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderWidth',
                  type: 'input',
                  templateOptions: {
                    label: 'Border Width',
                    placeholder: '',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderType',
                  type: 'select',
                  templateOptions: {
                    label: 'Border Type',
                    options: [
                      {label: 'Solid', value: 'solid'},
                      {label: 'Dashed', value: 'dashed'},
                      {label: 'Dotted', value: 'dotted'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderRadius',
                  type: 'input',
                  templateOptions: {
                    label: 'Border Radius',
                    placeholder: '',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'padding',
                  type: 'input',
                  templateOptions: {
                    label: 'Padding',
                    placeholder: '',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'overFlow',
                  type: 'select',
                  templateOptions: {
                    label: 'OverFlow',
                    options: [
                      {label: 'Truncate', value: 'truncate'},
                      {label: 'Break', value: 'break'},
                      {label: 'BreakAll', value: 'breakAll'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'position',
                  type: 'select',
                  templateOptions: {
                    label: 'Label Position',
                    placeholder: '',
                    options: [
                      {label: 'top', value: 'top'},
                      {label: 'left', value: 'left'},
                      {label: 'right', value: 'right'},
                      {label: 'bottom', value: 'bottom'},
                      {label: 'inside', value: 'inside'},
                      {label: 'insideLeft', value: 'insideLeft'},
                      {label: 'insideRight', value: 'insideRight'},
                      {label: 'insideTop', value: 'insideTop'},
                      {label: 'insideBottom', value: 'insideBottom'},
                      {label: 'insideTopLeft', value: 'insideTopLeft'},
                      {label: 'insideBottomLeft', value: 'insideBottomLeft'},
                      {label: 'insideTopRight', value: 'insideTopRight'},
                      {
                        label: 'insideBottomRight',
                        value: 'insideBottomRight',
                      },
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
              ],
            },
            {
              key: 'labelLine',
              type: 'accordion',
              templateOptions: {
                label: 'Label Line',
              },
              fieldGroup: [
                {
                  key: 'show',
                  type: 'radio',
                  templateOptions: {
                    label: 'Show Label',
                    options: [
                      {label: 'True', value: true},
                      {label: 'False', value: false},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'lineStyle',
                  type: 'accordion',
                  templateOptions: {
                    label: 'Line Style',
                  },
                  fieldGroup: [
                    {
                      key: 'color',
                      type: 'input',
                      templateOptions: {
                        label: 'Color',
                        placeholder: '#fff',
                        attributes: {
                          style:
                            'display:grid; width: 100%; margin-bottom:1rem',
                        },
                      },
                    },
                    {
                      key: 'width',
                      type: 'input',
                      templateOptions: {
                        label: 'Width',
                        placeholder: '',
                        attributes: {
                          style:
                            'display:grid; width: 100%; margin-bottom:1rem',
                        },
                      },
                    },
                    {
                      key: 'type',
                      type: 'select',
                      templateOptions: {
                        label: 'Type',
                        options: [
                          {label: 'Solid', value: 'solid'},
                          {label: 'Dashed', value: 'dashed'},
                          {label: 'Dotted', value: 'dotted'},
                        ],
                        attributes: {
                          style:
                            'display:grid; width: 100%; margin-bottom:1rem',
                        },
                      },
                    },
                    {
                      key: 'cap',
                      type: 'select',
                      templateOptions: {
                        label: 'Cap',
                        options: [
                          {label: 'butt', value: 'butt'},
                          {label: 'round', value: 'round'},
                          {label: 'square', value: 'square'},
                        ],
                        attributes: {
                          style:
                            'display:grid; width: 100%; margin-bottom:1rem',
                        },
                      },
                    },
                    {
                      key: 'join',
                      type: 'select',
                      templateOptions: {
                        label: 'Join',
                        options: [
                          {label: 'bevel', value: 'bevel'},
                          {label: 'round', value: 'round'},
                          {label: 'miter', value: 'miter'},
                        ],
                        attributes: {
                          style:
                            'display:grid; width: 100%; margin-bottom:1rem',
                        },
                      },
                    },
                  ],
                },
              ],
            },
            {
              key: 'itemStyle',
              type: 'accordion',
              templateOptions: {
                label: 'Item Style',
              },
              fieldGroup: [
                {
                  key: 'color',
                  type: 'input',
                  templateOptions: {
                    label: 'Color',
                    placeHhlder: '#fff',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderColor',
                  type: 'input',
                  templateOptions: {
                    label: 'Border Color',
                    placeholder: '#fff',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderWidth',
                  type: 'input',
                  templateOptions: {
                    label: 'Border Width',
                    placeHolder: '',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderType',
                  type: 'select',
                  templateOptions: {
                    label: 'Border Type',
                    options: [
                      {label: 'Solid', value: 'solid'},
                      {label: 'Dashed', value: 'dashed'},
                      {label: 'Dotted', value: 'dotted'},
                    ],
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'borderRadius',
                  type: 'input',
                  templateOptions: {
                    label: 'Border Radius',
                    placeholder: '',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
                {
                  key: 'opacity',
                  type: 'input',
                  templateOptions: {
                    label: 'Opacity',
                    placeholder: '',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
                },
              ],
            },
          ],
        },
        {
          key: 'encode',
          type: 'accordion',
          templateOptions: {
            label: 'Encode',
          },
          fieldGroup: [
            {
              key: 'x',
              type: 'series-encode',
              templateOptions: {
                label: 'Encode X',
                placeholder: '',
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
            {
              key: 'y',
              type: 'series-encode',
              templateOptions: {
                label: 'Encode Y',
                placeholder: '',
                attributes: {
                  style: 'display:grid; width: 100%; margin-bottom:1rem',
                },
              },
            },
          ],
        },
      ],
    },
  },
];
