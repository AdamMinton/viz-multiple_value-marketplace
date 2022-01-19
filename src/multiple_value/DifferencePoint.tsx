import React, { PureComponent, useState } from "react";
import styled from "styled-components";
import SSF from "ssf";
import numeral from "numeral";

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

function largeNumber(value: number) {
  return numeral(value).format("0.0a");
}

export const DifferencePoint: React.FC<{
  config: any;
  order: any;
  data: any;
  comparison: any;
}> = ({ config, order, data, comparison }) => {
  // Difference
  let diff;
  let diffFormatted;
  if (data.differencePoint) {
    diff = data.differencePoint.value;
    diffFormatted = data.differencePoint.formattedValue;
  } else {
    if (config[`difference_comparison_style_${data.name}`] === "original") {
      diff = data.value - comparison.value;
    } else {
      diff = comparison.value - data.value;
    }
    diffFormatted = tryFormatting("#,##0;-#,##0;0", diff, "N/A");
  }

  // Percentage
  let progressPerc;
  let percentage;
  let percentageFormatted;
  if (data.differencePercentagePoint) {
    percentage = data.differencePercentagePoint.value;
    percentageFormatted = data.differencePercentagePoint.formattedValue;
  } else {
    if (
      config[`difference_percentage_comparison_style_${data.name}`] ===
      "original"
    ) {
      percentage = data.value / comparison.value;
      progressPerc = percentage - 1;
    } else {
      progressPerc = data.value / comparison.value - 1;
      percentage = progressPerc;
    }
    percentageFormatted = tryFormatting("#,##0%", percentage, "N/A");
  }

  return (
    <Comparison
      order={config[`order_comparison_difference_${data.name}`]}
      visibility={
        (config[`show_comparison_difference_${data.name}`] ||
          config[`show_comparison_difference_percentage_${data.name}`]) ??
        true
      }
    >
      <Difference
        color={Color(
          config[`color_negative`],
          config[`color_zero`],
          config[`color_positive`],
          config[`pos_is_bad_${data.name}`],
          diff
        )}
        visibility={config[`show_comparison_difference_${data.name}`] ?? true}
      >
        {config[`style_comparison_difference_${data.name}`] === "icon"
          ? diff < 0
            ? `${config.symbol_negative}`
            : diff === 0
            ? `${config.symbol_zero}`
            : diff > 0
            ? `${config.symbol_positive}`
            : ""
          : ""}
        {config.large_number ? largeNumber(diff) : diffFormatted}
      </Difference>
      <Percentage
        color={Color(
          config[`color_negative`],
          config[`color_zero`],
          config[`color_positive`],
          config[`pos_is_bad_${data.name}`],
          percentage
        )}
        visibility={
          config[`show_comparison_difference_percentage_${data.name}`] ?? true
        }
      >
        {config[`style_comparison_difference_percentage_${data.name}`] ===
        "icon"
          ? progressPerc < 0
            ? `${config.symbol_negative}`
            : progressPerc === 0
            ? `${config.symbol_zero}`
            : progressPerc > 0
            ? `${config.symbol_positive}`
            : ""
          : ""}
        {percentageFormatted}
      </Percentage>
    </Comparison>
  );
};
