import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { DataPoint } from './DataPoint'
import { DifferencePoint } from './DifferencePoint'

const Wrapper = styled.div`
  font-family: "Google Sans", "Roboto", "Noto Sans JP", "Noto Sans", "Noto Sans CJK KR", Helvetica, Arial, sans-serif;
  display: flex;
  flex-direction: ${props => props.layout === 'horizontal' ? 'column' : 'row'};
  align-items: space-evenly;
  height: calc(100% + 25px);
`

const Row = styled.div`
  display: flex;
  flex-direction: ${props => props.layout === 'horizontal' ? 'row' : 'column'};
  align-items: flex-start;
  width: 100%;
  height: 100%;
`

const TileWrapper = styled.div`
  border: .6250em;  
  box-sizing: border-box
  text-align: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-shrink: auto;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  display: ${props => props.visibility ? 'flex' : 'none'};
  order: ${(props) => props.order};
`

const TileGroupTitle = styled.div`
  box-sizing: border-box
  text-align: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-shrink: auto;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  display: ${props => props.visibility ? 'flex' : 'none'};
  order: ${(props) => props.order};
`

const Tile = styled.div`
  display: flex;
  flex-shrink: ${props => props.layout === 'horizontal' ? 'auto' : 0 };
  flex-direction: ${props => props.titlePlacement === 'above' ? 'column' : 'column-reverse'};
  flex: 1;
  margin: 5px;
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
  box-sizing: border-box;
  text-align: center;
  font-size: 0.9em;
  color: ${props => props.color};
  margin: 5px 0;
`

const TileArrangement = styled.div`
  display: flex;  
  flex-direction: ${props => props.direction === 'horizontal' ? 'row' : 'column'};
  justify-content: center;
`

function checkURL(url) {
  url = url ?? ''
  return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

class MultipleValue extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {}
    this.state.groupingLayout = 'horizontal';
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

  handleClick = (cell, event) => {
    cell.link !== undefined ? LookerCharts.Utils.openDrillMenu({
         links: cell.link,
         event: event
    }) : LookerCharts.Utils.openDrillMenu({
         links: [],
         event: event
    });
  }

  render() {
    const {config, data} = this.props;

    let groupItems = []
    for (const property in config) {
      if(property.includes("group_item_name_") && config[property]) {
        let groupItemObject = {}
        groupItemObject['config'] = `${property}`
        groupItemObject['number'] = property.replace(/\D/g, '');
        groupItemObject['value'] = `${config[property]}`
        groupItems.push(groupItemObject); 
      }
    }

    let groupNames = []
    for (const property in config) {
      if(property.includes("group_name_") && config[property] ) {
        groupNames.push(`${config[property]}`);
      }
    }
    groupNames = [...new Set(groupNames)];
    groupNames.length > 0 && groupItems.length > 0 ? groupItems.unshift({config: 0, number: 0, value: ""}) : null;
    const uniqueGroups = [...new Set(data.map((o) => o.group_number))];

    return ( 
      <Wrapper
        layout={this.getLayout()}
        font={config['grouping_font']}
        style={ config.font_size_main == "" ? {fontSize: "larger"} : {fontSize: `${config.font_size_main}`}}
      >
      { groupItems.length > 0 ?
      <Row 
        layout={this.getLayout()}
      >
        {groupItems.map((groupItem,i) => {
          return(
          <TileGroupTitle 
          style={{fontWeight:'bold'}}
          order={groupItem.number}
          visibility={true}> 
          {checkURL(groupItem['value']) ? <img src={groupItem['value']} style={{width:config[`item_image_width_${groupItem['number']}`]+'px',height:config[`item_image_height_${groupItem['number']}`]+'px'}}></img> : <h2>{groupItem['value']}</h2>}
        </TileGroupTitle>
          )
        })} 
        </Row>
        : null }
      {uniqueGroups.map((group,i,{length}) => {
        let dataSub = data.filter(dataPoint => dataPoint.group_number === group)
        return(
          <>
          <Row 
            layout={this.getLayout()}
            style={length - 1 !== i && config.dividers && config.orientation === 'vertical' ? {borderRightColor:`${config.dividers_color}`,borderRightWidth: `thick`,borderRightStyle: `solid`} : length - 1 !== i && config.dividers && config.orientation === 'horizontal' ? {borderBottomColor:`${config.dividers_color}`,borderBottomWidth: `thick`,borderBottomStyle: `solid`}: {borderBottomStyle: ``} }
          >
          {dataSub
            .map((dataPoint, index) => {
              const compDataPoint = dataPoint.comparisonPoint
              let number = index
              return (
                <>
                {/* This is for the group labels */}
                {number === 0 && config[`group_name_${dataPoint.group_number}`] ? 
                <TileGroupTitle 
                  style={{fontWeight:'bold'}}
                  visibility={true}> 
                  {checkURL(config[`group_name_${dataPoint.group_number}`]) ? <img src={config[`group_name_${dataPoint.group_number}`]} style={{width:config[`image_width_${dataPoint.group_number}`]+'px',height:config[`image_height_${dataPoint.group_number}`]+'px'}}></img> : <h2>{config[`group_name_${dataPoint.group_number}`]}</h2>}
                </TileGroupTitle>
                : '' }
                <TileWrapper 
                  comparisonPlacement={compDataPoint && config[`comparison_label_placement_${compDataPoint.name}`]} 
                  key={`group_${dataPoint.name}`} 
                  layout={this.getLayout()}
                  visibility={config[`show_${dataPoint.name}`]}
                  order={config[`group_item_number_${dataPoint.name}`]}
                > 
                  <Tile 
                    titlePlacement={config[`title_placement_${dataPoint.name}`]} 
                    style={config[`border_${dataPoint.name}`] === 'None' ? BorderNone : BorderTile}
                  >
                    {config[`title_override_${dataPoint.name}`] ? (
                      <TileTitle 
                      color={config[`style_${dataPoint.name}`]}
                      >
                        {config[`title_override_${dataPoint.name}`] || dataPoint.label}
                      </TileTitle>
                    ) : null }
                    <TileArrangement
                      direction={config[`comparison_style_${dataPoint.name}`]}> 
                      {(<DataPoint 
                          config={config}
                          data={dataPoint}
                          order={config[`order_comparison_original_${dataPoint.name}`]}
                          label={config[`comparison_value_label_${dataPoint.name}`]}
                          handleClick={this.handleClick}
                        />)} 
                      {compDataPoint && config[`show_comparison_value_${dataPoint.name}`] ? 
                        (<DataPoint 
                          config={config}
                          data={compDataPoint}
                          order={config[`order_comparison_value_${dataPoint.name}`]}
                          label={config[`comparison_difference_label_${dataPoint.name}`]}
                          handleClick={this.handleClick}
                        />)
                      : '' }
                      {compDataPoint && (config[`show_comparison_difference_${dataPoint.name}`]
                      || config[`show_comparison_difference_percentage_${dataPoint.name}`]) ? 
                        (<DifferencePoint
                          config={config}
                          data={dataPoint}
                          comparison={compDataPoint}
                          order={config[`order_comparison_difference_${dataPoint.name}`]}
                        />)
                      : '' }
                     </TileArrangement>
                  </Tile>
                </TileWrapper>
                </>
              )
            }) 
          }
          </Row>
          </>
        )
      })
      }
      </Wrapper>
    )

  }
}

MultipleValue.propTypes = {
  config: PropTypes.object,
  data: PropTypes.array,
};

export default MultipleValue;
