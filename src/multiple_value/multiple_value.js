import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { ComparisonDataPoint } from './ComparisonDataPoint'
import { forEach } from 'lodash'

const DataPointsWrapper = styled.div`
  font-family: "Google Sans", "Roboto", "Noto Sans JP", "Noto Sans", "Noto Sans CJK KR", Helvetica, Arial, sans-serif;
  display: flex;
  // flex-direction: ${props => props.layout === 'horizontal' ? 'row' : 'column'};
  flex-direction: column;
  align-items: space-evenly;
  margin: 10px;
  height: 100%;
`

const DataPointGroupGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`

const dataPointGroupDirectionDict = {
  'below': 'column',
  'above': 'column-reverse',
  'left': 'row-reverse',
  'right': 'row'
}

const DataPointGroup = styled.div`
  margin: 20px 5px;
  text-align: center;
  width: 100%;
  display: flex;
  flex-shrink: ${props => props.layout === 'horizontal' ? 'auto' : 0 };
  //flex-direction: ${props => props.comparisonPlacement ? dataPointGroupDirectionDict[props.comparisonPlacement] : 'column'};
  flex-direction: row;
  align-items: center;
  justify-content: center;
`
const Divider = styled.div`
  background-color: #282828;
  height: 35vh;
  width: 1px;
`

const DataPoint = styled.div`
  display: flex;
  flex-shrink: ${props => props.layout === 'horizontal' ? 'auto' : 0 };
  flex-direction: ${props => props.titlePlacement === 'above' ? 'column' : 'column-reverse'};
  flex: 1;
`

const DataPointTitle = styled.div`
  font-weight: 100;
  color: ${props => props.color};
  margin: 5px 0;
`

const DataPointValue = styled.div`
  font-size: 3em;
  font-weight: 100;
  color: ${props => props.color};

  a.drillable-link {
    color: ${props => props.color};
    text-decoration: none;
  }
  :hover {
    text-decoration: underline;
  }
`

class MultipleValue extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {}
    this.state.groupingLayout = 'horizontal';
    this.state.fontSize = this.calculateFontSize();
  }

  componentDidMount() {
    window.addEventListener('resize', this.recalculateSizing);
  }

  componentDidUpdate() {
    this.recalculateSizing();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.recalculateSizing);
  }

  getLayout = () => {
    let CONFIG = this.props.config
    if(
      CONFIG['orientation'] === 'auto' ||
      typeof CONFIG['orientation'] === 'undefined'
      ) { 
        return this.state.groupingLayout 
      } 
    return CONFIG['orientation']
  }

  getWindowSize = () => {
    return Math.max(window.innerWidth, window.innerHeight);
  }

  calculateFontSize = () => {
    const multiplier = this.state.groupingLayout === 'horizontal' ? 0.015 : 0.02;
    return Math.round(this.getWindowSize() * multiplier);
  }

  handleClick = (cell, event) => {
    cell.link !== undefined ? LookerCharts.Utils.openDrillMenu({
         links: cell.link,
         event: event
    }) : LookerCharts.Utils.openDrillMenu({
         links: [],
         event: event
    });
  }

  recalculateSizing = () => {
    const EM = 16;
    const groupingLayout = window.innerWidth >= 768 ? 'horizontal' : 'vertical';

    let CONFIG = this.props.config;
    
    
    var font_check = CONFIG.font_size_main
    var font_size = (font_check !== "" && typeof font_check !== 'undefined' ? CONFIG.font_size_main : this.calculateFontSize());
    font_size = font_size / EM;


    this.setState({
      fontSize: font_size,
      groupingLayout
    })
  }

  render() {
    const {config, data} = this.props;

    const visualSettings = ['group_number','group_item_number'];
    console.log("Config Information");
    console.log(typeof(config));
    console.log(config);

    data.forEach(function(element,index,array){
      visualSettings.forEach(function(setting) {
        array[index][`${setting}`] = config[`${setting}_${element.name}`]
      })
    })

    console.log("Data Information");
    console.log(typeof(data));
    console.log(data);

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

    const dataSorted = sortArrayObjs(data,"group_number","group_item_number")

    console.log("Data Sorted Information");
    console.log(typeof(dataSorted));
    console.log(dataSorted);

    const minGroup = dataSorted.reduce((min, p) => p.group_number < min ? p.group_number : min, data[0].group_number);
    const maxGroup = data.reduce((max, p) => p.group_number > max ? p.group_number : max, data[0].group_number);
    console.log(minGroup);
    console.log(maxGroup);

    const uniqueGroups = [...new Set(dataSorted.map((o) => o.group_number))];
    const uniqueGroupsCount = uniqueGroups.length ?? 1;
    console.log(uniqueGroups);
    console.log(uniqueGroupsCount);
    //data.forEach(element => );
    
    return ( 
      <DataPointsWrapper
        layout={this.getLayout()}
        font={config['grouping_font']}
        style={{fontSize: `${this.state.fontSize}em`}}
      >
      {uniqueGroups.map((group, index) => {
        let dataSortedSub = dataSorted.filter(dataPoint => dataPoint.group_number === group)
        return(
          <>
          <DataPointGroupGroup 
            layout={this.getLayout()}
            style={{fontSize: `${this.state.fontSize}em`}}
          >
          {dataSortedSub
            .map((dataPoint, index) => {
              const compDataPoint = dataPoint.comparison
              let progressPerc
              let percChange
              if (compDataPoint) {
                progressPerc = Math.round((dataPoint.value / compDataPoint.value) * 100)
                percChange = progressPerc - 100
              }
              return (
                <>
                <DataPointGroup 
                  comparisonPlacement={compDataPoint && config[`comparison_label_placement_${compDataPoint.name}`]} 
                  key={`group_${dataPoint.name}`} 
                  layout={this.getLayout()}
                >
                  <DataPoint titlePlacement={config[`title_placement_${dataPoint.name}`]}>
                    {config[`show_title_${dataPoint.name}`] === false ? null : (
                      <DataPointTitle color={config[`style_${dataPoint.name}`]}>
                        {config[`title_override_${dataPoint.name}`] || dataPoint.label}
                      </DataPointTitle>
                    )}
                    <DataPointValue 
                      color={config[`style_${dataPoint.name}`]}
                      onClick={() => { this.handleClick(dataPoint, event) }}
                      layout={this.getLayout()}
                    >
                      {dataPoint.formattedValue}
                    </DataPointValue>
                  </DataPoint>
                  {!compDataPoint ? null : (
                  <ComparisonDataPoint 
                    config={config}
                    compDataPoint={compDataPoint}
                    dataPoint={dataPoint}
                    percChange={percChange}
                    progressPerc={progressPerc}
                    handleClick={this.handleClick}
                  />)}
                </DataPointGroup>
                {config.dividers && config.orientation === 'horizontal' && index < (data.length - 1) &&
                <Divider />
                }
                </>
              )
            }) 
          }
          </DataPointGroupGroup>
          </>
        )
      })
      }
      </DataPointsWrapper>
    )

  }
}

MultipleValue.propTypes = {
  config: PropTypes.object,
  data: PropTypes.array,
};

export default MultipleValue;
