import React, { PureComponent, useState } from "react";
import styled from "styled-components";
import SSF from "ssf";
import { AnyStyledComponent } from "styled-components";

const Percentage = styled.div.attrs({
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

export const PercentagePoint: React.FC<{
  config: any;
  mainPoint: any;
  order: any;
  percentage: any;
}> = ({ config, mainPoint, order, percentage }) => {
  return (
    <Percentage
      order={config[`order_comparison_difference_percentage_${mainPoint.name}`]}
      color={config[`style_${mainPoint.name}`]}
      visibility={
        config[`show_comparison_difference_percentage_${mainPoint.name}`] ??
        true
      }
    >
      {percentage}%
    </Percentage>
  );
};
