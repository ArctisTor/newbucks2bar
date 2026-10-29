const {
  handleUsernameSubmit,
  isValidUsername,
  updateUsernameSubmitState,
  clearUsernameInput,
  formatCurrency,
  updateCurrencyDisplay,
  initializeCurrencySearch,
} = require("./script.js");

describe("handleUsernameSubmit", () => {
  let usernameForm;
  let usernameInput;
  let mockEvent;

  beforeEach(() => {
    // Set up DOM structure
    document.body.innerHTML = `
      <form id="usernameForm">
        <input type="text" id="username" />
      </form>
    `;

    usernameForm = document.getElementById("usernameForm");
    usernameInput = document.getElementById("username");

    // Mock event object
    mockEvent = {
      preventDefault: jest.fn(),
    };
  });

  describe("currency selection", () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="currency-search">
          <input id="currencySelect" value="USD" />
          <div id="currencyOptions" class="d-none" role="listbox"></div>
        </div>
        <span id="incomeCurrencyLabel">$</span>
        <span id="expenseCurrencyLabel">$</span>
      `;
    });

    afterEach(() => {
      document.body.innerHTML = "";
    });

    test("formats values using USD by default", () => {
      expect(formatCurrency(1234.5)).toBe("$1,234.50");
    });

    test("updates both column labels and formatting when currency changes", () => {
      const currencySelect = document.getElementById("currencySelect");
      currencySelect.value = "EUR";

      updateCurrencyDisplay();

      expect(document.getElementById("incomeCurrencyLabel").textContent).toBe(
        "€"
      );
      expect(document.getElementById("expenseCurrencyLabel").textContent).toBe(
        "€"
      );
      expect(formatCurrency(1234.5)).toBe("€1,234.50");
    });

    test("ignores unsupported currency search text and returns to USD", () => {
      const currencySelect = document.getElementById("currencySelect");
      currencySelect.value = "not a currency";

      expect(formatCurrency(1234.5)).toBe("$1,234.50");
      updateCurrencyDisplay();

      expect(currencySelect.value).toBe("USD");
      expect(formatCurrency(1234.5)).toBe("$1,234.50");
    });

    test("shows filtered currency choices below the search field", () => {
      initializeCurrencySearch();

      const currencySelect = document.getElementById("currencySelect");
      const currencyOptions = document.getElementById("currencyOptions");
      expect(currencyOptions).toBe(currencySelect.nextElementSibling);

      currencySelect.focus();
      currencySelect.value = "Euro";
      currencySelect.dispatchEvent(new Event("input", { bubbles: true }));

      const options = currencyOptions.querySelectorAll(".currency-option");
      expect(options).toHaveLength(1);
      expect(options[0].dataset.currency).toBe("EUR");
    });

    test("selects a currency from the results dropdown", () => {
      initializeCurrencySearch();
      const currencySelect = document.getElementById("currencySelect");
      currencySelect.value = "Euro";
      currencySelect.dispatchEvent(new Event("input", { bubbles: true }));
      document
        .querySelector("#currencyOptions [data-currency='EUR']")
        .click();

      expect(currencySelect.value).toBe("EUR");
      expect(document.getElementById("incomeCurrencyLabel").textContent).toBe(
        "€"
      );
      expect(document.getElementById("expenseCurrencyLabel").textContent).toBe(
        "€"
      );
      expect(
        document.getElementById("currencyOptions").classList.contains("d-none")
      ).toBe(true);
    });
  });

  describe("username validation state", () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <form id="usernameForm">
          <input type="text" id="username" />
          <div id="usernameRequirements" class="d-none"></div>
          <button id="submitUsername" disabled>Submit</button>
        </form>
      `;
    });

    afterEach(() => {
      document.body.innerHTML = "";
    });

    test.each([
      ["Valid1!", true],
      ["Ab1@e", true],
      ["valid1!", false],
      ["Valid!", false],
      ["Valid1", false],
      ["Ab1!", false],
    ])("validates %s as %s", (username, expected) => {
      expect(isValidUsername(username)).toBe(expected);
    });

    test("enables submit only when the username is valid", () => {
      const usernameInput = document.getElementById("username");
      const submitButton = document.getElementById("submitUsername");

      usernameInput.value = "Invalid1";
      updateUsernameSubmitState();
      expect(submitButton.disabled).toBe(true);

      usernameInput.value = "Valid1!";
      updateUsernameSubmitState();
      expect(submitButton.disabled).toBe(false);

      usernameInput.value = "invalid";
      updateUsernameSubmitState();
      expect(submitButton.disabled).toBe(true);
    });

    test("shows requirements only for non-empty invalid usernames", () => {
      const usernameInput = document.getElementById("username");
      const requirements = document.getElementById("usernameRequirements");

      updateUsernameSubmitState();
      expect(requirements.classList.contains("d-none")).toBe(true);

      usernameInput.value = "invalid";
      updateUsernameSubmitState();
      expect(requirements.classList.contains("d-none")).toBe(false);

      usernameInput.value = "Valid1!";
      updateUsernameSubmitState();
      expect(requirements.classList.contains("d-none")).toBe(true);
    });

    test("removes submission feedback when the username changes", () => {
      const message = document.createElement("div");
      message.id = "usernameMessage";
      document.body.appendChild(message);

      usernameInput.addEventListener("input", updateUsernameSubmitState);
      usernameInput.value = "Another2@";
      usernameInput.dispatchEvent(new Event("input", { bubbles: true }));

      expect(document.getElementById("usernameMessage")).toBeNull();
    });

    test("clears the username and resets validation state and feedback", () => {
      const usernameInput = document.getElementById("username");
      const submitButton = document.getElementById("submitUsername");
      const requirements = document.getElementById("usernameRequirements");
      const message = document.createElement("div");
      message.id = "usernameMessage";
      document.body.appendChild(message);

      usernameInput.value = "Valid1!";
      updateUsernameSubmitState();
      expect(submitButton.disabled).toBe(false);

      clearUsernameInput();

      expect(usernameInput.value).toBe("");
      expect(submitButton.disabled).toBe(true);
      expect(requirements.classList.contains("d-none")).toBe(true);
      expect(document.getElementById("usernameMessage")).toBeNull();
    });
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("should call preventDefault on form submission", () => {
    usernameInput.value = "Valid1!";
    handleUsernameSubmit(mockEvent);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  test("should accept valid username with uppercase, number, and special character", () => {
    usernameInput.value = "Valid1!";
    handleUsernameSubmit(mockEvent);

    const message = document.getElementById("usernameMessage");
    expect(message).toBeTruthy();
    expect(message.classList.contains("alert-success")).toBe(true);
    expect(message.textContent).toContain(
      '✓ Username "Valid1!" is valid and has been accepted!'
    );
  });

  test("should accept username with minimum 5 characters meeting all criteria", () => {
    usernameInput.value = "Ab1@e";
    handleUsernameSubmit(mockEvent);

    const message = document.getElementById("usernameMessage");
    expect(message.classList.contains("alert-success")).toBe(true);
  });

  test("should reject username without uppercase letter", () => {
    usernameInput.value = "valid1!";
    handleUsernameSubmit(mockEvent);

    const message = document.getElementById("usernameMessage");
    expect(message.classList.contains("alert-danger")).toBe(true);
    expect(message.textContent).toContain('✗ Username "valid1!" is invalid');
  });

  test("should reject username without number", () => {
    usernameInput.value = "Valid!";
    handleUsernameSubmit(mockEvent);

    const message = document.getElementById("usernameMessage");
    expect(message.classList.contains("alert-danger")).toBe(true);
  });

  test("should reject username without special character", () => {
    usernameInput.value = "Valid1";
    handleUsernameSubmit(mockEvent);

    const message = document.getElementById("usernameMessage");
    expect(message.classList.contains("alert-danger")).toBe(true);
  });

  test("should reject username shorter than 5 characters", () => {
    usernameInput.value = "Ab1!";
    handleUsernameSubmit(mockEvent);

    const message = document.getElementById("usernameMessage");
    expect(message.classList.contains("alert-danger")).toBe(true);
  });

  test("should remove existing message before creating new one", () => {
    // First submission
    usernameInput.value = "Valid1!";
    handleUsernameSubmit(mockEvent);

    let message = document.getElementById("usernameMessage");
    expect(message).toBeTruthy();

    // Second submission
    usernameInput.value = "Another2@";
    handleUsernameSubmit(mockEvent);

    // Should only have one message
    const messages = document.querySelectorAll("#usernameMessage");
    expect(messages.length).toBe(1);
    expect(messages[0].textContent).toContain("Another2@");
  });

  test("should insert message after the form", () => {
    usernameInput.value = "Valid1!";
    handleUsernameSubmit(mockEvent);

    const message = document.getElementById("usernameMessage");
    expect(message.previousElementSibling).toBe(usernameForm);
  });

  test("should create message with correct classes", () => {
    usernameInput.value = "Valid1!";
    handleUsernameSubmit(mockEvent);

    const message = document.getElementById("usernameMessage");
    expect(message.id).toBe("usernameMessage");
    expect(message.classList.contains("alert")).toBe(true);
    expect(message.classList.contains("mt-3")).toBe(true);
  });

  test("should close the username message when its close button is clicked", () => {
    usernameInput.value = "Valid1!";
    handleUsernameSubmit(mockEvent);

    const closeButton = document.querySelector(
      "#usernameMessage .username-message-close"
    );
    expect(closeButton.getAttribute("aria-label")).toBe(
      "Close username message"
    );

    closeButton.click();

    expect(document.getElementById("usernameMessage")).toBeNull();
  });

  test("should accept various special characters", () => {
    const validUsernames = [
      "Valid1!",
      "Test2@",
      "User3#",
      "Pass4$",
      "Name5%",
      "Code6^",
      "Data7&",
      "Key8*",
    ];

    validUsernames.forEach((username) => {
      usernameInput.value = username;
      handleUsernameSubmit(mockEvent);

      const message = document.getElementById("usernameMessage");
      expect(message.classList.contains("alert-success")).toBe(true);

      // Clean up for next iteration
      message.remove();
    });
  });

  test("should display error message with requirements details", () => {
    usernameInput.value = "invalid";
    handleUsernameSubmit(mockEvent);

    const message = document.getElementById("usernameMessage");
    expect(message.textContent).toContain("at least 1 uppercase letter");
    expect(message.textContent).toContain("1 number");
    expect(message.textContent).toContain("1 special character");
    expect(message.textContent).toContain("at least 5 characters long");
  });
});
