import React, { PureComponent, useState } from "react";
import styled from "styled-components";
import SSF from "ssf";
import { AnyStyledComponent } from "styled-components";

const Difference = styled.div.attrs({
  order: (props: any) => props.order,
  visibility: (props: any) => props.visibility,
})`
  font-size: 2em;
  font-weight: 90;
  color: ${(props) => props.color};
  order: ${(props) => props.order};
  align-items: center;
  justify-content: center;
  display: ${(props) => (props.visibility ? "flex" : "none")};
  padding: 1em;
`;

export const DifferencePoint: React.FC<{
  config: any;
  mainPoint: any;
  order: any;
  comparisonPoint: any;
}> = ({ config, mainPoint, order, comparisonPoint }) => {
  let diff;
  if (config[`difference_comparison_style_${mainPoint.name}`] === "original") {
    //BUG: Need to add formatting or somehow figure the formatting from the formatted values
    diff = Math.round(mainPoint.value - comparisonPoint.value);
  } else {
    //BUG: Same as above
    diff = Math.round(comparisonPoint.value - mainPoint.value);
  }

  return (
    <Difference
      order={order}
      color={config[`style_${mainPoint.name}`]}
      visibility={
        config[`show_comparison_difference_${mainPoint.name}`] ?? true
      }
    >
      {diff}
      {config[`style_comparison_difference_${mainPoint.name}`] === "icon"
        ? diff < 0
          ? config[`pos_is_bad_${mainPoint.name}`]
            ? `${config.symbol_positive}`
            : `${config.symbol_negative}`
          : diff === 0
          ? `${config.symbol_zero}`
          : config[`pos_is_bad_${mainPoint.name}`]
          ? `${config.symbol_negative}`
          : `${config.symbol_positive}`
        : ""}
    </Difference>
  );
};
