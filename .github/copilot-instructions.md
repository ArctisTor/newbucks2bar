# Bucks2Bar - Budget Tracker

## Project overview

Bucks2Bar is a single-page budget tracker built with vanilla JavaScript. Users enter monthly income and expenses, see them reflected in a Chart.js bar chart, and can download the chart as a PNG. Bootstrap provides the page layout and tab UI.

## Project structure

- `index.html` contains the data-entry form, chart tab, and CDN references for Bootstrap 5.3.2 and Chart.js 4.4.0.
- `script.js` initializes the chart, synchronizes it with form inputs, handles chart downloads, and contains optional username-form validation.
- `style.scss` and `variables.scss` contain styling and pink color tokens. Check the existing stylesheet setup before assuming SCSS is compiled or changing how styles are loaded.
- `script.test.js` tests username validation with Jest and jsdom.

## Conventions and behavior

- Keep the app lightweight and browser-based; use vanilla JavaScript and existing CDN dependencies unless the task calls for a deliberate architectural change.
- Buttons should have a pink background by default. When a task explicitly requests another color, use a matching variable from `variables.scss` and preserve appropriate hover/focus styling.
- Before using a CSS hex color, check `variables.scss` for an existing color variable and reuse it when appropriate. If no suitable variable exists, define a named color variable in `variables.scss` and reference it from the stylesheet instead of hard-coding the hex value.
- The canonical month order is defined by the parallel `months` and `monthKeys` arrays in `script.js`. Keep them synchronized with the 12 monthly input rows in `index.html`.
- Monthly input IDs follow `income-{monthKey}` and `expense-{monthKey}`, using lowercase three-letter month keys. Keep the `income-input` and `expense-input` classes because chart event listeners depend on them.
- Income and expense input events call `updateChart()`. Preserve the two datasets, dataset order (income first, expenses second), and chart refresh behavior when changing this flow.
- The chart is a bar chart with green income bars and red expense bars. Keep currency formatting consistent in axis ticks and tooltips.
- Preserve accessible labels, tab relationships, and Bootstrap behavior when changing the HTML.
- The username form appears above the tabs in `index.html`. Its submit button stays disabled until the input meets the username requirements; keep its validation and submit feedback covered by tests.

## Validation

- Run `npm test` for the Jest test suite when changing JavaScript behavior.
- There is no build script in `package.json`. Do not claim a build or SCSS compilation has been run unless a corresponding tool is configured.
- For browser-facing changes, verify the relevant page behavior when practical; the app references its UI libraries through CDNs.
