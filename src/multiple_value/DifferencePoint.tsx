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
`;

export const DifferencePoint: React.FC<{
  config: any;
  mainPoint: any;
  order: any;
  diff: any;
}> = ({ config, mainPoint, order, diff }) => {
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
