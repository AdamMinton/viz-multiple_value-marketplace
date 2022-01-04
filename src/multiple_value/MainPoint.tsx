import React, { PureComponent, useState } from "react";
import styled from "styled-components";
import SSF from "ssf";
import { AnyStyledComponent } from "styled-components";

const Point = styled.div.attrs({
  order: (props: any) => props.order,
})`
  display: flex;
  flex-direction: column;
  order: ${(props) => props.order};
  color: grey;
  padding: 0.3em;
  justify-content: center;
`;

// color: (props: any) => props.color, why is this not needed
const Main = styled.div.attrs({
  visibility: (props: any) => props.visibility,
})`
  font-weight: 100;
  color: ${(props) => props.color};
  align-items: center;
  justify-content: center;
  line-height: 1.5em;
  display: ${(props) => (props.visibility ? "flex" : "none")};
  a.drillable-link {
    color: ${(props) => props.color};
    text-decoration: none;
  }
  :hover {
    text-decoration: underline;
  }
`;

const MainLabel = styled.div`
  font-size: 0.8em;
  font-weight: 90;
  text-align: center;
`;

function tryFormatting(
  formatString: string,
  value: number,
  defaultString: string
) {
  try {
    return SSF.format(formatString, value);
  } catch (err) {
    return defaultString;
  }
}

export const MainPoint: React.FC<{
  config: any;
  mainPoint: any;
  order: any;
  label: any;
  handleClick: (i: any, j: any) => {};
}> = ({ config, mainPoint, order, label, handleClick }) => {
  return (
    <Point order={order}>
      <Main
        color={config[`style_${mainPoint.name}`]}
        onClick={() => {
          handleClick(mainPoint, event);
        }}
        visibility={
          config[`show_comparison_original_${mainPoint.name}`] ?? true
        }
      >
        {config[`value_format_${mainPoint.name}`] == ""
          ? mainPoint.formattedValue
          : tryFormatting(
              config[`value_format_${mainPoint.name}`],
              mainPoint.value,
              mainPoint.formattedValue
            )}
      </Main>
      <MainLabel>
        {label}
        {/* {config[`comparison_value_label_${mainPoint.name}`]} */}
      </MainLabel>
    </Point>
  );
};
