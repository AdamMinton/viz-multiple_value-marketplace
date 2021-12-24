import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
//import { ComparisonDataPoint } from './ComparisonDataPoint'
//import { forEach, sortedLastIndex } from 'lodash'
import { MainPoint } from './MainPoint'
import { DifferencePoint } from './DifferencePoint'
import { PercentagePoint } from './PercentagePoint'

const DataPointsWrapper = styled.div`
  font-family: "Google Sans", "Roboto", "Noto Sans JP", "Noto Sans", "Noto Sans CJK KR", Helvetica, Arial, sans-serif;
  display: flex;
  flex-direction: ${props => props.layout === 'horizontal' ? 'column' : 'row'};
  align-items: space-evenly;
  margin: 10px;
  height: 100%;
`

const DataPointGroupGroup = styled.div`
  display: flex;
  flex-direction: ${props => props.layout === 'horizontal' ? 'row' : 'column'};
  align-items: flex-start;
  width: 100%;
  height: 100%
`

const TileGroup = styled.div`
  margin: 10px;  
  text-align: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-shrink: auto;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  display: ${props => props.visibility ? 'flex' : 'none'};
`

const TileGroupTitle = styled.div`
  margin: 10px;  
  text-align: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-shrink: auto;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  display: ${props => props.visibility ? 'flex' : 'none'};
`
//BUG: Need to fix it's positioning to observe margins and color
const HoriztonalDivider = styled.hr`
  border-bottom-width: thick; 
  border-bottom-style: solid;
  width: 100%;
`

const Tile = styled.div`
  display: flex;
  flex-shrink: ${props => props.layout === 'horizontal' ? 'auto' : 0 };
  flex-direction: ${props => props.titlePlacement === 'above' ? 'column' : 'column-reverse'};
  flex: 1;
`

const BorderNone = {
  border: `none`,
}

const BorderTile = {
  border: `none`,
  borderRadius: `6px`,
  background: `rgb(255, 255, 255)`,
  boxShadow: `rgba(0, 0, 0, 0.11) 0px 2px 12px, rgba(0, 0, 0, 0.04) 0px 1px 4px`,
}

const TileTitle = styled.div`
  font-weight: 100;
  color: ${props => props.color};
  margin: 5px 0;
`

const TileArrangement = styled.div`
  display: flex;  
  flex-direction: ${props => props.direction === 'horizontal' ? 'row' : 'column'};
  justify-content: center;
`

const UpArrow = styled.div.attrs()`
  pos: ${props => props.pos}
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 10px solid ${(props) => (props.pos ? "red" : "green")};
  margin-right: 5px;
`;

const DownArrow = styled.div.attrs()`
  pos: ${props => props.pos}  
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 10px solid ${(props) => (props.pos ? "green" : "red")};
  margin-right: 5px;
`;

function checkURL(url) {
  url = url ?? ''
  return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

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

    data.forEach(function(element,index,array){
      visualSettings.forEach(function(setting) {
        array[index][`${setting}`] = config[`${setting}_${element.name}`]
      })
    })

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

    const dataSorted = sortArrayObjs(data,"group_number","group_item_number");
    const uniqueGroups = [...new Set(dataSorted.map((o) => o.group_number))];
    
    return ( 
      <DataPointsWrapper
        layout={this.getLayout()}
        font={config['grouping_font']}
        style={{fontSize: `${this.state.fontSize}em`}}
      >
      {uniqueGroups.map((group,i,{length}) => {
        let dataSortedSub = dataSorted.filter(dataPoint => dataPoint.group_number === group)
        return(
          <>
          <DataPointGroupGroup 
            layout={this.getLayout()}
            style={{fontSize: `${this.state.fontSize}em`}}
          >
          {dataSortedSub
            .map((dataPoint, index) => {
              const compDataPoint = dataPoint.comparisonPoint
              let number = index
              return (
                <>
                {/* This is for the group labels */}
                {number === 0 && config[`group_name_${dataPoint.name}`] ? 
                <TileGroupTitle 
                  style={{fontWeight:'bold'}}
                  visibility={true}> 
                  {checkURL(config[`group_name_${dataPoint.name}`]) ? <img src={config[`group_name_${dataPoint.name}`]} style={{width:config[`image_width_${dataPoint.name}`]+'px',height:config[`image_height_${dataPoint.name}`]+'px'}}></img> : <h2>{config[`group_name_${dataPoint.name}`]}</h2>}
                </TileGroupTitle>
                : '' }
                {/* This is for the datapoints */}
                {/* BUG: Unsure how to get align items stretch and center */}
                <TileGroup 
                  comparisonPlacement={compDataPoint && config[`comparison_label_placement_${compDataPoint.name}`]} 
                  key={`group_${dataPoint.name}`} 
                  layout={this.getLayout()}
                  style={length - 1 !== i && config.dividers && config.orientation === 'vertical' ? {borderRightColor:`${config.dividers_color}`,borderRightWidth: `thick`,borderRightStyle: `solid`} : {borderRight: ``} }
                  visibility={config[`show_${dataPoint.name}`]}
                > 
                  <Tile 
                    titlePlacement={config[`title_placement_${dataPoint.name}`]} 
                    style={config[`border_${dataPoint.name}`] === 'None' ? BorderNone : BorderTile}
                  >
                    {config[`show_title_${dataPoint.name}`] === false ? null : (
                      <TileTitle 
                      color={config[`style_${dataPoint.name}`]}
                      >
                        {config[`title_override_${dataPoint.name}`] || dataPoint.label}
                      </TileTitle>
                    )}
                    <TileArrangement
                      direction={config[`comparison_style_${dataPoint.name}`]}> 
                      {(<MainPoint 
                          config={config}
                          mainPoint={dataPoint}
                          order={config[`order_comparison_original_${dataPoint.name}`]}
                          handleClick={this.handleClick}
                        />)} 
                      {compDataPoint && config[`show_comparison_value_${dataPoint.name}`] ? 
                        (<MainPoint 
                          config={config}
                          mainPoint={compDataPoint}
                          order={config[`order_comparison_value_${dataPoint.name}`]}
                          handleClick={this.handleClick}
                        />)
                      : '' }
                      {compDataPoint && config[`show_comparison_difference_${dataPoint.name}`] ? 
                        (<DifferencePoint
                          config={config}
                          mainPoint={dataPoint}
                          order={config[`order_comparison_difference_${dataPoint.name}`]}
                          comparisonPoint={compDataPoint}
                        />)
                      : '' }
                      {compDataPoint && config[`show_comparison_difference_percentage_${dataPoint.name}`] ? 
                        (<PercentagePoint
                          config={config}
                          mainPoint={dataPoint}
                          order={config[`order_comparison_difference_${dataPoint.name}`]}
                          comparisonPoint={compDataPoint}
                        />)
                      : '' }
                     </TileArrangement>
                  </Tile>
                </TileGroup>
                </>
              )
            }) 
          }
          </DataPointGroupGroup>
          {length - 1 !== i && config.dividers && config.orientation === 'horizontal' ? <HoriztonalDivider style={{borderTopColor:`${config.dividers_color}`}} /> : ''}
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
