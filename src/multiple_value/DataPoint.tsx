import React, { PureComponent, useState } from "react";
import styled from "styled-components";
import SSF from "ssf";
import numeral from "numeral";

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

function formatSpreadsheet(
  formatString: string,
  value: number,
  defaultString: string
) {
  try {
    console.log(SSF.format(formatString, value));
    return SSF.format(formatString, value);
  } catch (err) {
    return defaultString;
  }
}

function formatNumeral(
  formatString: string,
  value: number,
  defaultString: string
) {
  try {
    return numeral(value).format(formatString);
  } catch (err) {
    return defaultString;
  }
  // return numeral(value).format("0.0a");
}

export const DataPoint: React.FC<{
  config: any;
  data: any;
  order: any;
  label: any;
  handleClick: (i: any, j: any) => {};
}> = ({ config, data, order, label, handleClick }) => {
  //value formatting
  let formattedValue = "";
  if (config[`value_format_${data.name}`] != "") {
    if (config[`format_type_${data.name}`] == "ssf") {
      formattedValue = formatSpreadsheet(
        config[`value_format_${data.name}`],
        data.value,
        data.formattedValue
      );
    } else if (config[`format_type_${data.name}`] == "numeral") {
      formattedValue = formatNumeral(
        config[`value_format_${data.name}`],
        data.value,
        data.formattedValue
      );
    } else {
      formattedValue = data.formattedValue;
    }
  } else {
    formattedValue = data.formattedValue;
  }

  return (
    <Point order={order}>
      <Main
        color={config[`style_${data.name}`]}
        onClick={() => {
          handleClick(data, event);
        }}
        visibility={config[`show_comparison_original_${data.name}`] ?? true}
      >
        {formattedValue}
      </Main>
      <Label>
        {label}
        {/* {config[`comparison_value_label_${data.name}`]} */}
      </Label>
    </Point>
  );
};
