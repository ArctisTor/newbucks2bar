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
              return "$" + value.toLocaleString();
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
              label += "$" + context.parsed.y.toLocaleString();
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
function handleUsernameSubmit(event) {
  event.preventDefault();

  const usernameInput = document.getElementById("username");
  const username = usernameInput.value;

  const pattern =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{5,}$/;

  const existingMessage = document.getElementById("usernameMessage");
  if (existingMessage) {
    existingMessage.remove();
  }

  const messageDiv = document.createElement("div");
  messageDiv.id = "usernameMessage";
  messageDiv.className = "alert mt-3";

  if (pattern.test(username)) {
    messageDiv.classList.add("alert-success");
    messageDiv.textContent = `✓ Username "${username}" is valid and has been accepted!`;
  } else {
    messageDiv.classList.add("alert-danger");
    messageDiv.textContent = `✗ Username "${username}" is invalid. Please ensure it contains at least 1 uppercase letter, 1 number, 1 special character, and is at least 5 characters long.`;
  }

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
    usernameForm.addEventListener("submit", handleUsernameSubmit);
  }
};

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = { handleUsernameSubmit };
}
