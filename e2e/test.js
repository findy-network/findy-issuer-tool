describe("Issuer Tool", function () {
  const home = "http://localhost:8081";
  const walletHome = "http://localhost:3000";
  const user = require("./e2e.user.json");
  const userCmd = `window.localStorage.token = "${user.jwt}"`;

  it("app loads", function (browser) {
    browser
      .url(home)
      .waitForElementVisible("#dev-login-button")
      .click("#dev-login-button")
      .waitForElementVisible("#events-link-item")
      .assert.textContains("h6", "Issuer Tool")
      .end();
  });

  it("pairwise is done", function (browser) {
    const addConBtn = '//button[contains(.,"Add connection")]';
    const confirmBtn = '//button[contains(.,"Confirm")]';
    const invitationInput = 'input[placeholder="Enter invitation code"]';
    const label = '//p[contains(.,"issuer-tool")]';
    browser
      // Generate invitation with issuer tool
      .url(home)
      .waitForElementVisible("#dev-login-button")
      .click("#dev-login-button")
      .waitForElementVisible("#connect-link-item")
      .click("#connect-link-item")
      .waitForElementVisible("#invitation-raw")
      .getText("#invitation-raw", function (result) {
        const rawInvitation = result.value;
        // Read invitation with wallet app
        browser
          .url(walletHome)
          .execute(userCmd)
          .url(walletHome)
          .useXpath()
          .waitForElementVisible(addConBtn)
          .click(addConBtn)
          .useCss()
          .waitForElementVisible(invitationInput)
          .setValue(invitationInput, rawInvitation)
          .useXpath()
          .waitForElementVisible(confirmBtn)
          .click(confirmBtn)
          .waitForElementVisible(label)
          .end();
      });
  });

  it("schema & cred def is created", function (browser) {
    browser
      // Generate invitation with issuer tool
      .url(home)
      .useCss()
      .waitForElementVisible("#dev-login-button")
      .click("#dev-login-button")
      .waitForElementVisible("#tools-link-item")
      .click("#tools-link-item")
      .waitForElementVisible("#add-attribute-button")
      .click("#add-attribute-button")
      .setValue("#schema-name", "Email")
      .setValue("#schema-version", "1.0")
      .setValue("#schema-0-attribute", "email")
      .click("#schema-save-button")
      .end();
  });
});
