project_name: "viz-multiple_value-marketplace"

constant: VIS_LABEL {
  value: "Multiple Value2"
  export: override_optional
}

constant: VIS_ID {
  value: "multiple_value-marketplace"
  export:  override_optional
}

visualization: {
  id: "@{VIS_ID}"
  url: "https://cdn.jsdelivr.net/gh/AdamMinton/viz-multiple_value-marketplace@alm_testing_2/multiple_value.js"
  label: "@{VIS_LABEL}"
}