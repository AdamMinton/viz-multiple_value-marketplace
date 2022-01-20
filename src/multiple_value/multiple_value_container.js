import React from 'react'
import ReactDOM from 'react-dom'
import isEqual from 'lodash/isEqual'
import MultipleValue from './multiple_value'
import SSF from "ssf";

function checkURL(url) {

  try {
    url = new URL(url);
    return true
  } catch (_) {
    return false;  
  }

  // url = url ?? ''
  // return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

const baseOptions = {
  //Style -- apply to all
  orientation: {
    label: "Orientation",
    type: 'string',
    section: 'Style',
    display: 'select',
    values: [
      {'Vertical': 'vertical'},
      {'Horizontal': 'horizontal'}
    ],
    default: 'horizontal',
    order: 0,
    display_size: 'half'
  },
  dividers: {
    type: 'boolean',
    label: `Dividers between values?`,
    default: false,
    section: 'Style',
    order: 1
  },
  dividers_color: {
    type: 'string',
    label: `Dividers Color`,
    display: `color`,
    default: 'black',
    section: 'Style',
    order: 2
  },
  font_size_main: {
    label: "Font Size",
    type: 'string',
    section: 'Style',
    default: "",
    order: 3,
    display_size: 'full',
    placeholder: "16px"
  },
  large_number: {
    label: "Large Number",
    type: 'boolean',
    section: 'Style',
    default: "false",
    order: 3,
    display_size: 'full'
  },
  symbol_negative: {
    label: "Symbol - Neg",
    type: 'string',
    section: 'Style',
    default: "▼",
    order: 4,
    display_size: 'third'
  },
  symbol_zero: {
    label: "Symbol - Zero",
    type: 'string',
    section: 'Style',
    default: "―",
    order: 5,
    display_size: 'third'
  },
  symbol_positive: {
    label: "Symbol - Pos",
    type: 'string',
    section: 'Style',
    default: "▲",
    order: 6,
    display_size: 'third'
  },
  color_negative: {
    label: "Color - Neg",
    type: 'string',
    display: `color`,
    default: "Red",
    section: 'Style',
    order: 7,
    display_size: 'third'
  },
  color_zero: {
    label: "Color - Zero",
    type: 'string',
    display: `color`,
    default: "Black",
    section: 'Style',
    order: 8,
    display_size: 'third'
  },
  color_positive: {
    label: "Color - Pos",
    type: 'string',
    display: `color`,
    default: 'Green',
    section: 'Style',
    order: 9,
    display_size: 'third'
  },
}

const sortArrayObjs = function(arr,prop1,prop2) {
  let sort1 = [...arr].sort((a,b) => {
    if (a[prop1] === b[prop1]) {
      if (a[prop2] === b[prop2]) return 0;
      return (a[prop2] < b[prop2]) ? -1 : 1;
    } else {
      return (a[prop1] < b[prop1]) ? -1 : 1;
    }
  });
  return sort1;
};

let currentOptions = {}
let currentConfig = {}

looker.plugins.visualizations.add({
  id: "multiple_value",
  label: "Multiple Value",
  options: baseOptions,
  create: function(element, config) {
    this.chart = ReactDOM.render(
      <MultipleValue
        config={{}}
        data={[]}
      />,
      element
    );

  },
  updateAsync: function(data, element, config, queryResponse, details, done) {
    this.clearErrors();
    let dataAugmented = data;
    
    const newDimensions = [].concat(queryResponse.fields.dimension_like)
    const newMeasures = [].concat(queryResponse.fields.measure_like).concat(queryResponse.fields.supermeasure_like)

    let newRow = {}

    if (queryResponse.totals_data) {
      newRow = {}
      newDimensions.forEach(function(dimension) {
        newRow[dimension.name] = {"value": "Totals"}
        newMeasures.forEach(function(measure) {
          newRow[measure.name] = queryResponse.totals_data[measure.name]
        })
      })
      dataAugmented.push(newRow)
    }
    
    let rows = []
    let rowObj = []
    let rowDimensions = []
    let rowDimensionsObj = []

    let dataPoints = dataAugmented.map((row,index) => {
      newMeasures.forEach(function(measure,measureIndex) {
        rowObj = []
        rowDimensionsObj = []
        rowObj.push(measure.name)
        rowDimensionsObj.push(measure.label_short ?? measure.label)
        newDimensions.forEach(function(dimension) {
          rowObj.push(row[dimension.name].value)
          rowDimensionsObj.push(row[dimension.name].value)
        })
        rowDimensions.push(rowDimensionsObj)
        rows.push({
          name: rowObj.join("-"),
          label: rowDimensionsObj.join("-"),
          value: row[measure.name].value,
          link: row[measure.name].links,
          valueFormat: config[`value_format`],
          formattedValue: config[`value_format_${measure.name}`] === "" || config[`value_format_${measure.name}`] === undefined ? LookerCharts.Utils.textForCell(row[measure.name]) : SSF.format(config[`value_format_${measure.name}`], row[measure.name].value),
          row_number: index,
          column_number: measureIndex
        })
      })
    });
    dataPoints = rows

    if(dataAugmented.length < 1) {
      this.addError({title: "No Results"})
      done();
    }

    if (newMeasures.length == 0) {
      this.addError({title: "No Measures", message: "This chart requires measures"});
      return;
    }

    // if (queryResponse.fields.pivots.length) {
    //   this.addError({title: "Pivoting not allowed", message: "This visualization does not allow pivoting"});
    //   return;
    // }
    
    if (newMeasures.length > 30) {
      this.addError({title: "Maximum number of measures", message: "This visualization does not allow more than 30 measures to be selected"});
      return;
    }

    // let firstRow = data[0];

    // const dataPoints = measures.map(measure => {
    //   return ({
    //     name: measure.name,
    //     label: measure.label_short || measure.label,
    //     value: firstRow[measure.name].value,
    //     link: firstRow[measure.name].links,
    //     valueFormat: config[`value_format`],
    //     formattedValue: config[`value_format_${measure.name}`] === "" || config[`value_format_${measure.name}`] === undefined ? LookerCharts.Utils.textForCell(firstRow[measure.name]) : SSF.format(config[`value_format_${measure.name}`], firstRow[measure.name].value),
    //   })
    // });

    const fields_to_select = dataPoints.map(dataPoint => {
      const b = {}
      b[dataPoint.label] = dataPoint.name
      return b
    })

    const options = Object.assign({}, baseOptions)
    dataPoints.forEach((dataPoint, index) => {
      //if (config[`show_comparison_${dataPoint.name}`] !== true) {
        options[`show_${dataPoint.name}`] = {
          type: `boolean`,
          label: `${dataPoint.label} - Show Tile`,
          default: true,
          section: 'Style',
          order: 100 * (index + 1) + 4
        }
        options[`style_${dataPoint.name}`] = {
          type: `string`,
          label: `${dataPoint.label} - Color`,
          display: `color`,
          default: '#3A4245',
          section: 'Style',
          order: 100 * (index + 1) + 5
        }
        options[`title_override_${dataPoint.name}`] = {
          type: 'string',
          label: `${dataPoint.label} - Title`,
          section: 'Style',
          placeholder: dataPoint.label,
          order: 100 * (index + 1) + 7
        }
        options[`title_placement_${dataPoint.name}`] = {
          type: 'string',
          label: `${dataPoint.label} - Title Placement`,
          section: 'Style',
          display: 'select',
          values: [
            {'Above number': 'above'},
            {'Below number': 'below'},
          ],
          default: 'above',
          order: 100 * (index + 1) + 8
        }
        options[`value_format_${dataPoint.name}`] = {
          type: 'string',
          label: `${dataPoint.label} - Value Format`,
          section: 'Style',
          default: "",
          order: 100 * (index + 1) + 9
        }
        options[`border_${dataPoint.name}`] = {
          type: 'string',
          display: 'select',
          values: [
            {'Individual Tiles': 'Tile'},
            {'None': 'None'}
          ],
          label: `${dataPoint.label} - Border`,
          section: 'Style',
          default: "None",
          order: 100 * (index + 1) + 10
        }
        if (config[`show_${dataPoint.name}`] === true) {
          options[`row_number_${dataPoint.name}`] = {
            type: 'number',
            label: `${dataPoint.label} - Row #`,
            section: 'Organization',
            default: dataPoint.row_number,
            order: 100 * (index + 1) + 9
          }
          options[`column_number_${dataPoint.name}`] = {
            type: 'number',
            label: `${dataPoint.label} - Column #`,
            section: 'Organization',
            default: dataPoint.column_number,
            order: 100 * (index + 1) + 9
          }
        }
      // Comparison
      if (config[`show_${dataPoint.name}`] === true) {
        options[`show_comparison_${dataPoint.name}`] = {
          type: 'boolean',
          label: `${dataPoint.label} - Show a comparison`,
          section: 'Comparison',
          default: false,
          order: 100 * (index + 1),
        }
        if (config[`show_comparison_${dataPoint.name}`] === true) {
          options[`field_to_compare_${dataPoint.name}`] = {
            type: 'string',
            display: 'select',
            label: `Compare To`,
            values: fields_to_select,
            section: 'Comparison',
            order: 100 * (index + 1) + 1
          }
          options[`show_comparison_original_${dataPoint.name}`] = {
            type: 'boolean',
            label: `Original`,
            section: 'Comparison',
            default: true,
            order: 100 * (index + 1) + 2,
            display_size: 'half'
          }
          options[`show_comparison_value_${dataPoint.name}`] = {
            type: 'boolean',
            label: `Comparison`,
            section: 'Comparison',
            default: true,
            order: 100 * (index + 1) + 3,
            display_size: 'half'
          }
          options[`show_comparison_difference_${dataPoint.name}`] = {
            type: 'boolean',
            label: `Difference #`,
            section: 'Comparison',
            default: false,
            order: 100 * (index + 1) + 4,
            display_size: 'half'
          }
          options[`show_comparison_difference_percentage_${dataPoint.name}`] = {
            type: 'boolean',
            label: `Difference %`,
            section: 'Comparison',
            default: false,
            order: 100 * (index + 1) + 5,
            display_size: 'half'
          }
          if (config[`show_comparison_difference_${dataPoint.name}`] === true) {
            options[`difference_comparison_style_${dataPoint.name}`] = {
              type: 'string',
              display: 'select',
              label: `Difference # - Calc`,
              values: [
                {'Original - Comparison': 'original'},
                {'Comparison - Original': 'comparison'},
                {'Display Only': 'no_calculation'}
              ],
              section: 'Comparison',
              default: 'original',
              order: 100 * (index + 1) + 6,
              display_size: 'half'
            }
          }
          if (config[`show_comparison_difference_percentage_${dataPoint.name}`] === true) {
            options[`difference_percentage_comparison_style_${dataPoint.name}`] = {
              type: 'string',
              display: 'select',
              label: `Difference % - Calc`,
              values: [
                {'Percent Change from Original': 'change'},
                {'Percent of Comparison': 'original'},
                {'Display Only': 'no_calculation'}
              ],
              section: 'Comparison',
              default: 'change',
              order: 100 * (index + 1) + 6,
              display_size: 'half'
            }
          }
          if (config[`difference_comparison_style_${dataPoint.name}`] === 'no_calculation') {
            options[`difference_comparison_display_${dataPoint.name}`] = {
              type: 'string',
              display: 'select',
              label: `Difference # - Display`,
              values: fields_to_select,
              section: 'Comparison',
              order: 100 * (index + 1) + 7
            }
          }
          if (config[`show_comparison_difference_${dataPoint.name}`] === true) {
            options[`style_comparison_difference_${dataPoint.name}`] = {
              type: 'string',
              display: 'select',
              label: `Difference # - Style`,
              values: [
                {'Show as Value': 'value'},
                {'Show as Value with Icon': 'icon'}
              ],
              section: 'Comparison',
              default: 'value',
              order: 100 * (index + 1) + 8,
              display_size: 'half'
            }
          }
          if (config[`difference_percentage_comparison_style_${dataPoint.name}`] === 'no_calculation') {
            options[`difference_percentage_comparison_display_${dataPoint.name}`] = {
              type: 'string',
              display: 'select',
              label: `Difference % - Display`,
              values: fields_to_select,
              section: 'Comparison',
              order: 100 * (index + 1) + 7
            }
          }
          if (config[`show_comparison_difference_percentage_${dataPoint.name}`] === true) {
            options[`style_comparison_difference_percentage_${dataPoint.name}`] = {
              type: 'string',
              display: 'select',
              label: `Difference % - Style`,
              values: [
                {'Show as Value': 'value'},
                {'Show as Value with Icon': 'icon'}
              ],
              section: 'Comparison',
              default: 'value',
              order: 100 * (index + 1) + 8,
              display_size: 'half'
            }
          }
          options[`pos_is_bad_${dataPoint.name}`] = {
            type: 'boolean',
            label: `Positive Values are Bad`,
            section: 'Comparison',
            default: false,
            order: 100 * (index + 1) + 10
          }
          options[`comparison_value_label_${dataPoint.name}`] = {
            type: 'string',
            label: `Original - Label`,
            placeholder: dataPoint.label,
            section: 'Comparison',
            order: 100 * (index + 1) + 11,
            display_size: 'half'
          }
          options[`comparison_difference_label_${dataPoint.name}`] = {
            type: 'string',
            label: `Comparison - Label`,
            placeholder: dataPoint.label,
            section: 'Comparison',
            order: 100 * (index + 1) + 12,
            display_size: 'half'
          }
          options[`comparison_style_${dataPoint.name}`] = {
            type: 'string',
            display: 'select',
            label: `Stacking`,
            values: [
              {'Stack Vertically': 'vertical'},
              {'Stack Horizontally': 'horizontal'}
            ],
            section: 'Comparison',
            default: 'vertical',
            order: 100 * (index + 1) + 14
          }
          if (config[`show_comparison_original_${dataPoint.name}`] === true) {
            options[`order_comparison_original_${dataPoint.name}`] = {
              type: 'number',
              label: `Order - Original`,
              section: 'Comparison',
              default: 1,
              order: 100 * (index + 1) + 15,
              display_size: 'third'
            }
          }
          if (config[`show_comparison_value_${dataPoint.name}`] === true) {
            options[`order_comparison_value_${dataPoint.name}`] = {
              type: 'number',
              label: `Order - Comparison`,
              section: 'Comparison',
              default: 2,
              order: 100 * (index + 1) + 16,
              display_size: 'third'
            }
          }
          if (config[`show_comparison_difference_${dataPoint.name}`] === true || config[`show_comparison_difference_percentage_${dataPoint.name}`] === true) {
            options[`order_comparison_difference_${dataPoint.name}`] = {
              type: 'number',
              label: `Order - Difference`,
              section: 'Comparison',
              default: 3,
              order: 100 * (index + 1) + 17,
              display_size: 'third'
            }
          }
        }
      }
    })
  
    // Looping through the row_number properties and getting a unique list
    let rowNumbers = []
    for (const property in config) {
      if(property.includes("row_number_")) {
        rowNumbers.push(`${config[property]}`);
      }
    }
    rowNumbers = [...new Set(rowNumbers)];

    // Looping through the column_number properties and getting a unique list
    let columnNumbers = []
    for (const property in config) {
      if(property.includes("column_number_")) {
        columnNumbers.push(`${config[property]}`);
      }
    }
    columnNumbers = [...new Set(columnNumbers)];

    const optionsNew = Object.assign({},options) 
    rowNumbers.forEach((rowNumber,index) => {
      optionsNew[`row_name_${rowNumber}`] = {
        type: 'string',
        label: `${rowNumber} - Row Name`,
        section: 'Organization',
        default: null,
        order: index
      }
      if (checkURL(config[`row_name_${rowNumber}`])) {
        optionsNew[`row_image_height_${rowNumber}`] = {
          type: `number`,
          label: `Image Height`,
          section: `Organization`,
          default: null,
          order: index + .1,
          display_size: 'half'
        }
        optionsNew[`row_image_width_${rowNumber}`] = {
          type: `number`,
          label: `Image Width`,
          section: `Organization`,
          default: null,
          order: index + .2,
          display_size: 'half'
        }
      }
    })
  
    const optionsNewNew = Object.assign({},optionsNew) 
    columnNumbers.forEach((columnNumber,index) => {
      optionsNewNew[`column_name_${columnNumber}`] = {
        type: 'string',
        label: `${columnNumber} - Column Name`,
        section: 'Organization',
        default: null,
        order: 10 * (index + 1)
      }
      if (checkURL(config[`column_name_${columnNumber}`])) {
        optionsNewNew[`column_image_height_${columnNumber}`] = {
          type: `number`,
          label: `Image Height`,
          section: `Organization`,
          default: null,
          order: 10 * (index + 1) + .1,
          display_size: 'half'
        }
        optionsNewNew[`column_image_width_${columnNumber}`] = {
          type: `number`,
          label: `Image Width`,
          section: `Organization`,
          default: null,
          order: 10 * (index + 1) + .2,
          display_size: 'half'
        }
      }
    })

    if (
      !isEqual(currentOptions, optionsNewNew) ||
      !isEqual(currentConfig, config)
    ) {
      this.trigger('registerOptions', optionsNewNew)
      currentOptions = Object.assign({}, optionsNewNew)
      currentConfig = Object.assign({}, config)
    }

    //Adds the comparisonPoint for when comparison has been enabled
    const fullValues = dataPoints.map((dataPoint,index) => {
      if (config[`show_comparison_${dataPoint.name}`] == true) {
        let found = false
        for (let i = 0 ; i < dataPoints.length && !found; i++) {
          if (dataPoints[i].name == config[`field_to_compare_${dataPoint.name}`]) {
            dataPoint.comparisonPoint = dataPoints[i]
            found = true
          }
        }
      }
      if (config[`difference_comparison_display_${dataPoint.name}`]) {
        let found = false
        for (let i = 0 ; i < dataPoints.length && !found; i++) {
          if (dataPoints[i].name == config[`difference_comparison_display_${dataPoint.name}`]) {
            dataPoint.differencePoint = dataPoints[i]
            found = true
          }
        }
      }
      if (config[`difference_percentage_comparison_display_${dataPoint.name}`]) {
        let found = false
        for (let i = 0 ; i < dataPoints.length && !found; i++) {
          if (dataPoints[i].name == config[`difference_percentage_comparison_display_${dataPoint.name}`]) {
            dataPoint.differencePercentagePoint = dataPoints[i]
            found = true
          }
        }
      }
      //adding row_number and column_number
      dataPoint.row_number = config[`row_number_${dataPoint.name}`]
      dataPoint.column_number = config[`column_number_${dataPoint.name}`]
      dataPoint.show = config[`show_${dataPoint.name}`]
      return dataPoint
    })

    let fullValuesFiltered = fullValues.filter(dataPoint => dataPoint.show === true) 

    fullValuesFiltered = sortArrayObjs(fullValuesFiltered,"row_number","column_number");

    this.chart = ReactDOM.render(
      <MultipleValue
        config={config}
        data={fullValuesFiltered}
      />,
      element
    );
    done()
  }
});
