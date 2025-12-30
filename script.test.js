const { handleUsernameSubmit } = require("./script.js");

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
