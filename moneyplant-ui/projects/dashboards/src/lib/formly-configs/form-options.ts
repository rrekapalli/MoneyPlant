export const formOptions = [
  {
    type: 'tabs',
    fieldGroup: [
      {
        props: {
          label: 'Position',
        },
        fieldGroup: [
          {
            key: 'position.x',
            type: 'number',
            templateOptions: {
              label: 'X-axis',
              required: true,
              attributes: {
                style: 'display:grid; width: 100%; margin-bottom:1rem',
              },
            },
          },
          {
            key: 'position.y',
            type: 'number',
            templateOptions: {
              label: 'Y-axis',
              required: true,
              attributes: {
                style: 'display:grid; width: 100%; margin-bottom:1rem',
              },
            },
          },
          {
            key: 'position.cols',
            type: 'number',
            templateOptions: {
              label: 'Columns',
              required: true,
              attributes: {
                style: 'display:grid; width: 100%; margin-bottom:1rem',
              },
            },
          },
          {
            key: 'position.rows',
            type: 'number',
            templateOptions: {
              label: 'Rows',
              required: true,
              attributes: {
                style: 'display:grid; width: 100%; margin-bottom:1rem',
              },
            },
          },
        ],
      },
      {
        props: {
          label: 'Config',
        },
        fieldGroup: [
          {
            key: 'config.component',
            type: 'select',
            templateOptions: {
              label: 'Component',
              options: [
                {label: 'ScatterChartVisual', value: 'ScatterChartVisual'},
                {label: 'PieChartVisual', value: 'PieChartVisual'},
                {label: 'BarChartVisual', value: 'BarChartVisual'},
                {label: 'EChart', value: 'echart'},
                {label: 'NoteBook', value: 'react'}
              ],
              attributes: {
                style: 'display:grid; width: 100%; margin-bottom:1rem',
                appendTo: 'body',
              },
            },
          },
          {
            key: 'config.header',
            type: 'accordion',
            templateOptions: {
              label: 'Header Options',
            },
            fieldGroup: [
              {
                key: 'title',
                type: 'input',
                templateOptions: {
                  type: 'text',
                  label: 'Title',
                  placeholder: 'Enter the title',
                  attributes: {
                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                  },
                },
              },
              {
                key: 'options',
                type: 'input',
                templateOptions: {
                  label: 'Options',
                  attributes: {
                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                  },
                },
              },
            ],
          },
          {
            key: 'config.options',
            type: 'accordion',
            templateOptions: {
              label: 'Input Fields',
            },
            fieldGroup: [
              {
                key: 'xAxis',
                type: 'accordion',
                templateOptions: {
                  label: 'XAxis Options',
                },
                fieldGroup: [
                  {
                    key: 'type',
                    type: 'select',
                    templateOptions: {
                      label: 'XAxis Type',
                      placeholder: '',
                      options: [
                        {label: 'value', value: 'value'},
                        {label: 'category', value: 'category'},
                        {label: 'time', value: 'time'},
                        {label: 'log', value: 'log'},
                      ],
                      attributes: {
                        style: 'display:grid; width: 100%; margin-bottom:1rem',
                      },
                    },
                  },
                  {
                    key: 'data',
                    type: 'input',
                    templateOptions: {
                      label: 'Data',
                      placeholder: '[]',
                      attributes: {
                        style: 'display:grid; width: 100%; margin-bottom:1rem',
                      },
                    },
                  },
                ],
              },
              {
                key: 'yAxis',
                type: 'accordion',
                templateOptions: {
                  label: 'YAxis Options',
                },
                fieldGroup: [
                  {
                    key: 'type',
                    type: 'select',
                    templateOptions: {
                      label: 'Y Axis Type',
                      placeholder: '',
                      options: [
                        {label: 'value', value: 'value'},
                        {label: 'category', value: 'category'},
                        {label: 'time', value: 'time'},
                        {label: 'log', value: 'log'},
                      ],
                      attributes: {
                        style: 'display:grid; width: 100%; margin-bottom:1rem',
                      },
                    },
                  },
                  {
                    key: 'data',
                    type: 'input',
                    templateOptions: {
                      label: 'Data',
                      placeholder: '[]',
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
                  key: 'data',
                  type: 'input',
                  templateOptions: {
                    label: 'Data',
                    placeholder: '[]',
                    attributes: {
                      style: 'display:grid; width: 100%; margin-bottom:1rem',
                    },
                  },
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
                          style:
                            'display:grid; width: 100%; margin-bottom:1rem',
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
                          style:
                            'display:grid; width: 100%; margin-bottom:1rem',
                        },
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
      {
        props: {
          label: 'Code'
        },
        fieldGroup: [
          {
            key: 'code',
            type: 'textarea',
            templateOptions: {
              label: 'Code',
              required: true,
              rows: 10,
              attributes: {
                style: 'display:grid; width: 100%; height:30rem; margin-bottom:1rem',
              },
            },
          },
        ]
      },
    ],
  },
];
