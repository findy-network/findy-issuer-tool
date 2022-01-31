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
      .assert.textContains("h6", "Issuer Tool")
      .end();
  });

  it("pairwise is done", function (browser) {
    browser
      .url(home)
      .waitForElementVisible("#dev-login-button")
      .click("#dev-login-button")
      .waitForElementVisible("#connect-link-item")
      .click("#connect-link-item")
      .end();
  });
});
