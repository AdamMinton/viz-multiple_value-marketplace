import React, { PureComponent, useState } from "react";
import styled from "styled-components";

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

const Label = styled.div`
  font-size: 0.8em;
  font-weight: 90;
  text-align: center;
`;

export const DataPoint: React.FC<{
  config: any;
  data: any;
  order: any;
  label: any;
  handleClick: (i: any, j: any) => {};
}> = ({ config, data, order, label, handleClick }) => {
  return (
    <Point order={order}>
      <Main
        color={config[`style_${data.name}`]}
        onClick={() => {
          handleClick(data, event);
        }}
        visibility={config[`show_comparison_original_${data.name}`] ?? true}
      >
        {data.formattedValue}
      </Main>
      <Label>
        {label}
        {/* {config[`comparison_value_label_${data.name}`]} */}
      </Label>
    </Point>
  );
};
