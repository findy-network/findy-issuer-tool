describe("Issuer Tool", function () {
  const home = "http://localhost:8081";
  const walletHome = "http://localhost:3000";
  const user = require("./e2e.user.json");
  const userCmd = `window.localStorage.token = "${user.jwt}"`;
  const issuerToolLabel = '//p[contains(.,"issuer-tool")]';

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
          .waitForElementVisible(issuerToolLabel)
          .end();
      });
  });

  it("schema & cred def is created", function (browser) {
    browser
      // create schema
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
      .waitForElementVisible("#Schema-item-0")
      .getText("#Schema-item-0", function (result) {
        const option = `//option[contains(.,"${result.value}")]`;
        // create cred def
        browser
          .click("#cred-def-schema-selection")
          .useXpath()
          .waitForElementVisible(option)
          .click(option)
          .useCss()
          .setValue("#cred-def-tag", "issuer-tool")
          .click("#cred-def-save-button")
          // .verify.elementPresent("cred-def-item-0") TODO: verify cred def exists!
          .end();
      });
  });

  it("cred is sent", function (browser) {
    const acceptBtn = '//button[contains(.,"Accept")]';
    const walletLink = '//a[contains(.,"Wallet")]';
    const credIcon = "svg[aria-label=Certificate]";
    browser
      // send cred
      .url(home)
      .waitForElementVisible("#dev-login-button")
      .click("#dev-login-button")
      .waitForElementVisible("#issue-link-item")
      .click("#issue-link-item")
      .waitForElementVisible("#connection-selection")
      .click("#connection-selection")
      .waitForElementVisible("#connection-selection>option:nth-of-type(2)")
      .click("#connection-selection>option:nth-of-type(2)") // just select the first one
      .waitForElementVisible("#cred-def-selection")
      .click("#cred-def-selection")
      .waitForElementVisible("#cred-def-selection>option:nth-of-type(2)")
      .click("#cred-def-selection>option:nth-of-type(2)") // just select the first one
      .waitForElementVisible("#add-attribute-button")
      .click("#add-attribute-button")
      .waitForElementVisible("#attribute-0-name")
      .setValue("#attribute-0-name", "email")
      .setValue("#attribute-0-value", "test@example.com")
      .click("#send-cred-save-button")
      .assert.textContains("div", "Credential sent successfully")

      // Receive cred
      .url(walletHome)
      .execute(userCmd)
      .url(walletHome)
      .useXpath()
      .waitForElementVisible(issuerToolLabel)
      .click(issuerToolLabel)
      .waitForElementVisible(acceptBtn)
      .click(acceptBtn)
      .click(walletLink)
      .useCss()
      .waitForElementVisible(credIcon)
      .end();
  });
});
