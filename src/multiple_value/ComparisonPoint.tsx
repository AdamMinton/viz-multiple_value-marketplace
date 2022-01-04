import React, { PureComponent, useState } from "react";
import styled from "styled-components";
import SSF from "ssf";
import { AnyStyledComponent } from "styled-components";

const Percentage = styled.div.attrs({
  visibility: (props: any) => props.visibility,
})`
  font-weight: 90;
  color: ${(props) => props.color};
  align-items: center;
  justify-content: center;
  display: ${(props) => (props.visibility ? "flex" : "none")};
`;

const Difference = styled.div.attrs({
  visibility: (props: any) => props.visibility,
})`
  font-weight: 90;
  color: ${(props) => props.color};
  align-items: center;
  justify-content: center;
  display: ${(props) => (props.visibility ? "flex" : "none")};
`;

const Comparison = styled.div.attrs({
  order: (props: any) => props.order,
  visibility: (props: any) => props.visibility,
})`
  order: ${(props) => props.order};
  align-items: center;
  justify-content: center;
  flex-direction: column;
  display: ${(props) => (props.visibility ? "flex" : "none")};
  line-height: 1.5em;
  padding: 0.3em;
`;

function Color(
  color_neg: string,
  color_zero: string,
  color_pos: string,
  pos_is_bad: boolean,
  comparison_number: number
) {
  let color = color_zero;
  if (pos_is_bad) {
    if (comparison_number < 0) {
      color = color_pos;
    } else if ((comparison_number = 0)) {
      color = color_zero;
    } else {
      color = color_neg;
    }
  } else {
    if (comparison_number < 0) {
      color = color_neg;
    } else if ((comparison_number = 0)) {
      color = color_zero;
    } else {
      color = color_pos;
    }
  }
  return color;
}

export const ComparisonPoint: React.FC<{
  config: any;
  order: any;
  mainPoint: any;
  comparisonPoint: any;
}> = ({ config, order, mainPoint, comparisonPoint }) => {
  // Difference
  let diff;
  if (config[`difference_comparison_style_${mainPoint.name}`] === "original") {
    //BUG: Need to add formatting or somehow figure the formatting from the formatted values
    diff = Math.round(mainPoint.value - comparisonPoint.value);
  } else {
    //BUG: Same as above
    diff = Math.round(comparisonPoint.value - mainPoint.value);
  }

  // Percentage
  let progressPerc;
  let percentage;
  if (
    config[`difference_percentage_comparison_style_${mainPoint.name}`] ===
    "original"
  ) {
    progressPerc = Math.round((mainPoint.value / comparisonPoint.value) * 100);
    percentage = progressPerc - 100;
  } else {
    progressPerc = Math.round(
      (mainPoint.value / comparisonPoint.value - 1) * 100
    );
    percentage = progressPerc - 100;
  }

  return (
    <Comparison
      order={config[`order_comparison_difference_${mainPoint.name}`]}
      visibility={
        (config[`show_comparison_difference_${mainPoint.name}`] ||
          config[`show_comparison_difference_percentage_${mainPoint.name}`]) ??
        true
      }
    >
      <Difference
        color={Color(
          config[`color_negative`],
          config[`color_zero`],
          config[`color_positive`],
          config[`pos_is_bad_${mainPoint.name}`],
          diff
        )}
        visibility={
          config[`show_comparison_difference_${mainPoint.name}`] ?? true
        }
      >
        {config[`style_comparison_difference_${mainPoint.name}`] === "icon"
          ? diff < 0
            ? `${config.symbol_negative}`
            : diff === 0
            ? `${config.symbol_zero}`
            : diff > 0
            ? `${config.symbol_positive}`
            : ""
          : ""}
        {diff}
      </Difference>
      <Percentage
        color={Color(
          config[`color_negative`],
          config[`color_zero`],
          config[`color_positive`],
          config[`pos_is_bad_${mainPoint.name}`],
          percentage
        )}
        visibility={
          config[`show_comparison_difference_percentage_${mainPoint.name}`] ??
          true
        }
      >
        {config[`style_comparison_difference_percentage_${mainPoint.name}`] ===
        "icon"
          ? percentage < 0
            ? `${config.symbol_negative}`
            : percentage === 0
            ? `${config.symbol_zero}`
            : percentage > 0
            ? `${config.symbol_positive}`
            : ""
          : ""}
        {percentage}%
      </Percentage>
    </Comparison>
  );
};
