import React from 'react'
import ReactDOM from 'react-dom'
import isEqual from 'lodash/isEqual'
import MultipleValue from './multiple_value'
import SSF from "ssf";

function checkURL(url) {
  url = url ?? ''
  return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
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
    default: 'auto',
    order: 0,
    display_size: 'half'
  },
  dividers: {
    type: 'boolean',
    label: `Dividers between values?`,
    default: false,
    section: 'Style',
    order: 1,
  },
  dividers_color: {
    type: 'string',
    label: `Dividers Color`,
    display: `color`,
    default: 'black',
    section: 'Style',
    order: 2,
  },
  font_size_main: {
    label: "Font Size",
    type: 'string',
    section: 'Style',
    default: "",
    order: 3,
    display_size: 'full',
    placeholder: "16px",
  },
  large_number: {
    label: "Large Number",
    type: 'boolean',
    section: 'Style',
    default: "false",
    order: 3,
    display_size: 'full',
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

    const measures = [].concat(
      queryResponse.fields.dimensions,
      queryResponse.fields.measures,
      queryResponse.fields.table_calculations
    )

    if(data.length < 1) {
      this.addError({title: "No Results"})
      done();
    }

    if (measures.length == 0) {
      this.addError({title: "No Measures", message: "This chart requires measures"});
      return;
    }

    if (queryResponse.fields.pivots.length) {
      this.addError({title: "Pivoting not allowed", message: "This visualization does not allow pivoting"});
      return;
    }
    
    if (measures.length > 30) {
      this.addError({title: "Maximum number of data points", message: "This visualization does not allow more than 30 data points to be selected"});
      return;
    }

    let firstRow = data[0];

    const dataPoints = measures.map(measure => {
      return ({
        name: measure.name,
        label: measure.label_short || measure.label,
        value: firstRow[measure.name].value,
        link: firstRow[measure.name].links,
        valueFormat: config[`value_format`],
        formattedValue: config[`value_format_${measure.name}`] === "" || config[`value_format_${measure.name}`] === undefined ? LookerCharts.Utils.textForCell(firstRow[measure.name]) : SSF.format(config[`value_format_${measure.name}`], firstRow[measure.name].value),
      })
    });

    const fields_to_select = measures.map(measure => {
      const b = {}
      b[measure.label] = measure.name
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
          order: 100 * (index + 1) + 4,
        }
        options[`style_${dataPoint.name}`] = {
          type: `string`,
          label: `${dataPoint.label} - Color`,
          display: `color`,
          default: '#3A4245',
          section: 'Style',
          order: 100 * (index + 1) + 5,
        }
        options[`show_title_${dataPoint.name}`] = {
          type: 'boolean',
          label: `${dataPoint.label} - Show Title`,
          default: true,
          section: 'Style',
          order: 100 * (index + 1) + 6,
        }
        options[`title_override_${dataPoint.name}`] = {
          type: 'string',
          label: `${dataPoint.label} - Title`,
          section: 'Style',
          placeholder: dataPoint.label,
          order: 100 * (index + 1) + 7,
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
          order: 100 * (index + 1) + 8,
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
            {'None': 'None'},
          ],
          label: `${dataPoint.label} - Border`,
          section: 'Style',
          default: "None",
          order: 100 * (index + 1) + 10
        }
        options[`group_number_${dataPoint.name}`] = {
          type: 'number',
          label: `Group #`,
          section: 'Grouping',
          default: null,
          order: 100 * (index + 1) + 9,
          display_size: 'half'
        }
        options[`group_item_number_${dataPoint.name}`] = {
          type: 'number',
          label: `Item #`,
          section: 'Grouping',
          default: null,
          order: 100 * (index + 1) + 9,
          display_size: 'half'
        }
        //BUG: Consider moving group names to the bottom and have them been unique on the group names set
        options[`group_name_${dataPoint.name}`] = {
          type: 'string',
          label: `${dataPoint.label} - Group Name`,
          section: 'Grouping',
          default: null,
          order: 100 * (index + 1) + 7
        }
        if (checkURL(config[`group_name_${dataPoint.name}`])) {
          options[`image_height_${dataPoint.name}`] = {
            type: `number`,
            label: `Image Height`,
            section: `Grouping`,
            default: null,
            order: 100 * (index + 1) + 8,
            display_size: 'half'
          }
          options[`image_width_${dataPoint.name}`] = {
            type: `number`,
            label: `Image Width`,
            section: `Grouping`,
            default: null,
            order: 100 * (index + 1) + 8,
            display_size: 'half'
          }
        }
      //}
      // Comparison
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
          order: 100 * (index + 1) + 1,
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
              {'Display Only': 'no_calculation'},
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
              {'Display Only': 'no_calculation'},
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
            order: 100 * (index + 1) + 7,
          }
        }
        if (config[`show_comparison_difference_${dataPoint.name}`] === true) {
          options[`style_comparison_difference_${dataPoint.name}`] = {
            type: 'string',
            display: 'select',
            label: `Difference # - Style`,
            values: [
              {'Show as Value': 'value'},
              {'Show as Value with Icon': 'icon'},
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
            order: 100 * (index + 1) + 7,
          }
        }
        if (config[`show_comparison_difference_percentage_${dataPoint.name}`] === true) {
          options[`style_comparison_difference_percentage_${dataPoint.name}`] = {
            type: 'string',
            display: 'select',
            label: `Difference % - Style`,
            values: [
              {'Show as Value': 'value'},
              {'Show as Value with Icon': 'icon'},
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
          order: 100 * (index + 1) + 10,
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
            {'Stack Horizontally': 'horizontal'},
          ],
          section: 'Comparison',
          default: 'vertical',
          order: 100 * (index + 1) + 14,
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
    })
  
    if (
      !isEqual(currentOptions, options) ||
      !isEqual(currentConfig, config)
    ) {
      this.trigger('registerOptions', options)
      currentOptions = Object.assign({}, options)
      currentConfig = Object.assign({}, config)
    }

    // let valuesToComparisonsMap = {}
    // let lastDataPointIndex = -1
    //INFO: The code here was removing and determining the value to compare, going to change this
    // const fullValues = dataPoints.filter((dataPoint, index) => {
    //   if (config[`show_comparison_${dataPoint.name}`] !== true) {
    //     lastDataPointIndex++
    //     return true
    //   } else {
    //     valuesToComparisonsMap[lastDataPointIndex] = index
    //   }
    //   return false
    // }).map((fullValue, index) => {
    //   const comparisonIndex = valuesToComparisonsMap[index]
    //   if (comparisonIndex) {
    //     fullValue.comparison = dataPoints[comparisonIndex]
    //   }
    //   return fullValue;
    // })

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
      return dataPoint
    })

    //console.log(dataPoints);

    this.chart = ReactDOM.render(
      <MultipleValue
        config={config}
        data={fullValues}
      />,
      element
    );
    done()
  }
});
