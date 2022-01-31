describe("Issuer Tool", function () {
  const home = "http://localhost:8081";

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
      .end();
  });
});
