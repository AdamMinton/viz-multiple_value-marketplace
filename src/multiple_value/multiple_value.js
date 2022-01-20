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

const TileRowTitle = styled.div`
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
  try {
    url = new URL(url);
    return true
  } catch (_) {
    return false;  
  }
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

    let columns = []
    for (const property in config) {
      if(property.includes("column_name_") && config[property]) {
        let columnObject = {}
        columnObject['config'] = `${property}`
        columnObject['number'] = property.replace(/\D/g, '');
        columnObject['value'] = `${config[property]}`
        columns.push(columnObject); 
      }
    }

    let rows = []
    for (const property in config) {
      if(property.includes("row_name_") && config[property] ) {
        rows.push(`${config[property]}`);
      }
    }
    rows = [...new Set(rows)];
    rows.length > 0 && columns.length > 0 ? columns.unshift({config: 0, number: 0, value: ""}) : null;
    const uniqueRows = [...new Set(data.map((o) => o.row_number))];

    return ( 
      <Wrapper
        layout={this.getLayout()}
        font={config['grouping_font']}
        style={ config.font_size_main == "" ? {fontSize: "larger"} : {fontSize: `${config.font_size_main}`}}
      >
      { columns.length > 0 ?
      <Row 
        layout={this.getLayout()}
      >
        {columns.map((column,i) => {
          return(
          <TileRowTitle 
          style={{fontWeight:'bold'}}
          order={column.number}
          visibility={true}> 
          {checkURL(column['value']) ? <img src={column['value']} style={{width:config[`column_image_width_${column['number']}`]+'px',height:config[`column_image_height_${column['number']}`]+'px'}}></img> : <h2>{column['value']}</h2>}
        </TileRowTitle>
          )
        })} 
        </Row>
        : null }
      {uniqueRows.map((row,i,{length}) => {
        let dataSub = data.filter(dataPoint => dataPoint.row_number === row)
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
                {/* This is for the row labels */}
                {number === 0 && config[`row_name_${dataPoint.row_number}`] ? 
                <TileRowTitle 
                  style={{fontWeight:'bold'}}
                  visibility={true}> 
                  {checkURL(config[`row_name_${dataPoint.row_number}`]) ? <img src={config[`row_name_${dataPoint.row_number}`]} style={{width:config[`row_image_width_${dataPoint.row_number}`]+'px',height:config[`row_image_height_${dataPoint.row_number}`]+'px'}}></img> : <h2>{config[`row_name_${dataPoint.row_number}`]}</h2>}
                </TileRowTitle>
                : '' }
                <TileWrapper 
                  comparisonPlacement={compDataPoint && config[`comparison_label_placement_${compDataPoint.name}`]} 
                  key={`row_${dataPoint.name}`} 
                  layout={this.getLayout()}
                  visibility={config[`show_${dataPoint.name}`]}
                  order={config[`column_number_${dataPoint.name}`]}
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
