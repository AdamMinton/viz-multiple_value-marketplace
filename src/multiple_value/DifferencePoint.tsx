import React, { PureComponent, useState } from "react";
import styled from "styled-components";
import SSF from "ssf";

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
  comparison_number: number,
  evaluation_number: number
) {
  let color = color_zero;
  if (comparison_number < evaluation_number) {
    color = pos_is_bad ? color_pos : color_neg;
  } else if (comparison_number === evaluation_number) {
    color = color_zero;
  } else {
    color = pos_is_bad ? color_neg : color_pos;
  }
  return color;
}

function Icon(
  icon_neg: string,
  icon_zero: string,
  icon_pos: string,
  comparison_number: number,
  evaluation_number: number
) {
  let icon = icon_zero;
  if (comparison_number < evaluation_number) {
    icon = icon_neg;
  } else if (comparison_number === evaluation_number) {
    icon = icon_zero;
  } else {
    icon = icon_pos;
  }
  return icon;
}

function EvaluationPercentageNumber(type: string, evaluation: number) {
  let evaluation_number = 0;
  if (type === "original") {
    evaluation_number = 1;
  } else if (type === "change") {
    evaluation_number = 0;
  } else {
    evaluation_number = evaluation;
  }
  return evaluation_number;
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

export const DifferencePoint: React.FC<{
  config: any;
  order: any;
  data: any;
  comparison: any;
}> = ({ config, order, data, comparison }) => {
  // Difference
  let diff;
  let diffFormatted;
  let diffColor;
  let diffIcon;

  if (config[`difference_comparison_style_${data.name}`] === "original") {
    diff = data.value - comparison.value;
    diffFormatted = tryFormatting("#,##0;-#,##0;0", diff, "N/A");
  } else if (
    config[`difference_comparison_style_${data.name}`] === "comparison"
  ) {
    diff = comparison.value - data.value;
    diffFormatted = tryFormatting("#,##0;-#,##0;0", diff, "N/A");
  } else if (data.differencePoint) {
    diff = data.differencePoint.value;
    diffFormatted = data.differencePoint.formattedValue;
  }

  diffColor = Color(
    config[`color_negative`],
    config[`color_zero`],
    config[`color_positive`],
    config[`pos_is_bad_${data.name}`],
    diff,
    0
  );

  diffIcon = Icon(
    config[`symbol_negative`],
    config[`symbol_zero`],
    config[`symbol_positive`],
    diff,
    0
  );

  // Percentage
  let percentage;
  let percentageFormatted;
  let evaluationNumber;
  let color;
  let icon;

  if (
    config[`difference_percentage_comparison_style_${data.name}`] === "original"
  ) {
    percentage = data.value / comparison.value;
    percentageFormatted = tryFormatting("#,##0%", percentage, "N/A");
  } else if (
    config[`difference_percentage_comparison_style_${data.name}`] === "change"
  ) {
    percentage = data.value / comparison.value - 1;
    percentageFormatted = tryFormatting("#,##0%", percentage, "N/A");
  } else if (data.differencePercentagePoint) {
    percentage = data.differencePercentagePoint.value;
    percentageFormatted = data.differencePercentagePoint.formattedValue;
  }

  evaluationNumber = EvaluationPercentageNumber(
    config[`difference_percentage_comparison_style_${data.name}`],
    config[`difference_percentage_comparison_evaluation_${data.name}`]
  );

  if (!isFinite(percentage)) {
    percentage = evaluationNumber;
    percentageFormatted = "0%";
  }

  color = Color(
    config[`color_negative`],
    config[`color_zero`],
    config[`color_positive`],
    config[`pos_is_bad_${data.name}`],
    percentage,
    evaluationNumber
  );

  icon = Icon(
    config[`symbol_negative`],
    config[`symbol_zero`],
    config[`symbol_positive`],
    percentage,
    evaluationNumber
  );

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
        color={diffColor}
        visibility={config[`show_comparison_difference_${data.name}`] ?? true}
      >
        {config[`style_comparison_difference_${data.name}`] === "icon"
          ? diffIcon
          : ""}
        {diffFormatted}
      </Difference>
      <Percentage
        color={color}
        visibility={
          config[`show_comparison_difference_percentage_${data.name}`] ?? true
        }
      >
        {config[`style_comparison_difference_percentage_${data.name}`] ===
        "icon"
          ? icon
          : ""}
        {percentageFormatted}
      </Percentage>
    </Comparison>
  );
};
