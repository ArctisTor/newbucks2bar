// Month labels for the chart
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const monthKeys = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

// Chart instance
let budgetChart = null;

const currencies = [
  ["USD", "United States Dollar"],
  ["CAD", "Canadian Dollar"],
  ["EUR", "Euro"],
  ["GBP", "British Pound"],
  ["AUD", "Australian Dollar"],
  ["JPY", "Japanese Yen"],
  ["CNY", "Chinese Yuan"],
  ["INR", "Indian Rupee"],
  ["CHF", "Swiss Franc"],
  ["NZD", "New Zealand Dollar"],
  ["MXN", "Mexican Peso"],
  ["BRL", "Brazilian Real"],
  ["ZAR", "South African Rand"],
  ["SGD", "Singapore Dollar"],
  ["HKD", "Hong Kong Dollar"],
  ["KRW", "South Korean Won"],
  ["SEK", "Swedish Krona"],
  ["NOK", "Norwegian Krone"],
  ["DKK", "Danish Krone"],
  ["PLN", "Polish Zloty"],
  ["AED", "United Arab Emirates Dirham"],
];

function getSelectedCurrency() {
  const currencySelect = document.getElementById("currencySelect");
  const currency = currencySelect ? currencySelect.value.toUpperCase() : "USD";
  return currencies.some(([code]) => code === currency) ? currency : "USD";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: getSelectedCurrency(),
  }).format(value);
}

function updateCurrencyDisplay() {
  const currencySelect = document.getElementById("currencySelect");
  const currency = getSelectedCurrency();
  if (currencySelect && currencySelect.value !== currency) {
    currencySelect.value = currency;
  }
  const currencySymbol = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  })
    .formatToParts(0)
    .find((part) => part.type === "currency").value;
  const incomeCurrencyLabel = document.getElementById("incomeCurrencyLabel");
  const expenseCurrencyLabel = document.getElementById("expenseCurrencyLabel");

  if (incomeCurrencyLabel) {
    incomeCurrencyLabel.textContent = currencySymbol;
  }
  if (expenseCurrencyLabel) {
    expenseCurrencyLabel.textContent = currencySymbol;
  }
  if (budgetChart) {
    budgetChart.update();
  }
}

function initializeCurrencySearch() {
  const currencySelect = document.getElementById("currencySelect");
  const currencyOptions = document.getElementById("currencyOptions");
  if (!currencySelect || !currencyOptions) {
    return;
  }

  const currencySearch = currencySelect.parentElement;
  let activeOption = -1;
  let suppressNextFocus = false;

  function renderOptions(query = "") {
    const normalizedQuery = query.trim().toLowerCase();
    const matches = currencies.filter(([code, name]) =>
      `${code} ${name}`.toLowerCase().includes(normalizedQuery)
    );

    currencyOptions.replaceChildren();
    activeOption = -1;
    matches.forEach(([code, name]) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "currency-option";
      option.setAttribute("role", "option");
      option.dataset.currency = code;
      option.textContent = `${code} - ${name}`;
      currencyOptions.appendChild(option);
    });

    currencyOptions.classList.toggle("d-none", matches.length === 0);
    currencySelect.setAttribute(
      "aria-expanded",
      String(matches.length > 0)
    );
  }

  function chooseCurrency(code) {
    currencySelect.value = code;
    updateCurrencyDisplay();
    currencyOptions.classList.add("d-none");
    currencySelect.setAttribute("aria-expanded", "false");
    currencySelect.value = code;
  }

  function focusSearchWithoutOpening() {
    suppressNextFocus = true;
    currencySelect.focus();
    suppressNextFocus = false;
  }

  currencySelect.addEventListener("focus", () => {
    if (suppressNextFocus) {
      suppressNextFocus = false;
      return;
    }
    renderOptions(
      currencySelect.value === getSelectedCurrency() ? "" : currencySelect.value
    );
  });
  currencySelect.addEventListener("input", () =>
    renderOptions(currencySelect.value)
  );
  currencySelect.addEventListener("change", () => {
    updateCurrencyDisplay();
    currencyOptions.classList.add("d-none");
    currencySelect.setAttribute("aria-expanded", "false");
  });
  currencySelect.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      currencyOptions.classList.add("d-none");
      currencySelect.setAttribute("aria-expanded", "false");
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (currencyOptions.classList.contains("d-none")) {
        renderOptions(currencySelect.value);
      }
      const options = currencyOptions.querySelectorAll(".currency-option");
      const optionCount = options.length;
      if (optionCount > 0) {
        activeOption =
          event.key === "ArrowDown"
            ? (activeOption + 1) % optionCount
            : (activeOption - 1 + optionCount) % optionCount;
        options[activeOption].focus();
      }
    }
  });
  currencyOptions.addEventListener("click", (event) => {
    const option = event.target.closest("[data-currency]");
    if (option) {
      chooseCurrency(option.dataset.currency);
      focusSearchWithoutOpening();
    }
  });
  currencyOptions.addEventListener("keydown", (event) => {
    const options = Array.from(
      currencyOptions.querySelectorAll(".currency-option")
    );
    const currentOption = options.indexOf(document.activeElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      activeOption =
        event.key === "ArrowDown"
          ? (currentOption + 1) % options.length
          : (currentOption - 1 + options.length) % options.length;
      options[activeOption].focus();
    } else if (event.key === "Enter" && currentOption >= 0) {
      event.preventDefault();
      chooseCurrency(options[currentOption].dataset.currency);
      focusSearchWithoutOpening();
    } else if (event.key === "Escape") {
      currencyOptions.classList.add("d-none");
      currencySelect.setAttribute("aria-expanded", "false");
      currencySelect.focus();
    }
  });
  currencyOptions.addEventListener("mousedown", (event) => {
    event.preventDefault();
  });
  document.addEventListener("click", (event) => {
    if (!currencySearch.contains(event.target)) {
      currencyOptions.classList.add("d-none");
      currencySelect.setAttribute("aria-expanded", "false");
    }
  });
}

// Initialize the chart
function initChart() {
  const ctx = document.getElementById("budgetChart").getContext("2d");

  budgetChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: months,
      datasets: [
        {
          label: "Income",
          data: new Array(12).fill(0),
          backgroundColor: "rgba(40, 167, 69, 0.7)",
          borderColor: "rgba(40, 167, 69, 1)",
          borderWidth: 1,
        },
        {
          label: "Expenses",
          data: new Array(12).fill(0),
          backgroundColor: "rgba(220, 53, 69, 0.7)",
          borderColor: "rgba(220, 53, 69, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return formatCurrency(value);
            },
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              label += formatCurrency(context.parsed.y);
              return label;
            },
          },
        },
      },
    },
  });
}

// Update the chart with current input values
function updateChart() {
  const incomeData = [];
  const expenseData = [];

  monthKeys.forEach((month) => {
    const income =
      parseFloat(document.getElementById(`income-${month}`).value) || 0;
    const expense =
      parseFloat(document.getElementById(`expense-${month}`).value) || 0;

    incomeData.push(income);
    expenseData.push(expense);
  });

  budgetChart.data.datasets[0].data = incomeData;
  budgetChart.data.datasets[1].data = expenseData;
  budgetChart.update();
}

// Add event listeners to all inputs
function attachEventListeners() {
  const allInputs = document.querySelectorAll(".income-input, .expense-input");

  allInputs.forEach((input) => {
    input.addEventListener("input", updateChart);
  });
}

// Download chart as PNG
function downloadChart() {
  const link = document.createElement("a");
  link.download = "budget-chart.png";
  link.href = budgetChart.toBase64Image();
  link.click();
}

// Handle username form submission
function isValidUsername(username) {
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{5,}$/.test(username);
}

function updateUsernameSubmitState() {
  const usernameInput = document.getElementById("username");
  const submitButton = document.getElementById("submitUsername");
  const requirements = document.getElementById("usernameRequirements");
  const existingMessage = document.getElementById("usernameMessage");

  if (existingMessage) {
    existingMessage.remove();
  }

  if (usernameInput && submitButton) {
    const isValid = isValidUsername(usernameInput.value);
    submitButton.disabled = !isValid;

    if (requirements) {
      requirements.classList.toggle(
        "d-none",
        !usernameInput.value || isValid
      );
    }
  }
}

function clearUsernameInput() {
  const usernameInput = document.getElementById("username");
  if (!usernameInput) {
    return;
  }

  usernameInput.value = "";
  updateUsernameSubmitState();
  usernameInput.focus();
}

function handleUsernameSubmit(event) {
  event.preventDefault();

  const usernameInput = document.getElementById("username");
  const username = usernameInput.value;
  const isValid = isValidUsername(username);

  const existingMessage = document.getElementById("usernameMessage");
  if (existingMessage) {
    existingMessage.remove();
  }

  const messageDiv = document.createElement("div");
  messageDiv.id = "usernameMessage";
  messageDiv.className = "alert mt-3";

  if (isValid) {
    messageDiv.classList.add("alert-success");
    messageDiv.append(`✓ Username "${username}" is valid and has been accepted!`);
  } else {
    messageDiv.classList.add("alert-danger");
    messageDiv.append(`✗ Username "${username}" is invalid. Please ensure it contains at least 1 uppercase letter, 1 number, 1 special character, and is at least 5 characters long.`);
  }

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "username-message-close";
  closeButton.setAttribute("aria-label", "Close username message");
  closeButton.textContent = "×";
  closeButton.addEventListener("click", () => messageDiv.remove());
  messageDiv.appendChild(closeButton);

  const usernameForm = document.getElementById("usernameForm");
  usernameForm.parentNode.insertBefore(messageDiv, usernameForm.nextSibling);
}

// Initialize when page loads
window.onload = function () {
  initChart();
  attachEventListeners();
  updateChart(); // Load initial data from input fields

  // Add download button event listener
  const downloadBtn = document.getElementById("downloadChart");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", downloadChart);
  }

  // Add username form submit listener
  const usernameForm = document.getElementById("usernameForm");
  if (usernameForm) {
    const usernameInput = document.getElementById("username");
    usernameInput.addEventListener("input", updateUsernameSubmitState);
    updateUsernameSubmitState();
    usernameForm.addEventListener("submit", handleUsernameSubmit);

    const clearUsernameButton = document.getElementById("clearUsername");
    if (clearUsernameButton) {
      clearUsernameButton.addEventListener("click", clearUsernameInput);
    }
  }

  const currencySelect = document.getElementById("currencySelect");
  if (currencySelect) {
    initializeCurrencySearch();
    updateCurrencyDisplay();
  }
};

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    handleUsernameSubmit,
    isValidUsername,
    updateUsernameSubmitState,
    clearUsernameInput,
    formatCurrency,
    updateCurrencyDisplay,
    initializeCurrencySearch,
  };
}
