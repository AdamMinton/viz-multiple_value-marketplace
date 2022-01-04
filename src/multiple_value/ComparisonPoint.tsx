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

export const ComparisonPoint: React.FC<{
  config: any;
  order: any;
  mainPoint: any;
  comparisonPoint: any;
}> = ({ config, order, mainPoint, comparisonPoint }) => {
  // Difference
  let diff;
  let diffFormatted;
  if (mainPoint.differencePoint) {
    diff = mainPoint.differencePoint.value;
    diffFormatted = mainPoint.differencePoint.formattedValue;
  } else {
    if (
      config[`difference_comparison_style_${mainPoint.name}`] === "original"
    ) {
      diff = mainPoint.value - comparisonPoint.value;
    } else {
      diff = comparisonPoint.value - mainPoint.value;
    }
    diffFormatted = tryFormatting("#,##0;-#,##0;0", diff, "N/A");
  }

  // Percentage
  let progressPerc;
  let percentage;
  let percentageFormatted;
  if (mainPoint.differencePercentagePoint) {
    percentage = mainPoint.differencePercentagePoint.value;
    percentageFormatted = mainPoint.differencePercentagePoint.formattedValue;
  } else {
    if (
      config[`difference_percentage_comparison_style_${mainPoint.name}`] ===
      "original"
    ) {
      progressPerc = mainPoint.value / comparisonPoint.value;
      percentage = progressPerc - 100;
    } else {
      progressPerc = mainPoint.value / comparisonPoint.value - 1;
      percentage = progressPerc - 100;
    }
    percentageFormatted = tryFormatting("#,##0%", percentage, "N/A");
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
        {diffFormatted}
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
        {percentageFormatted}
      </Percentage>
    </Comparison>
  );
};
