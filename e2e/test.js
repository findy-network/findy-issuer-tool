const home = "http://localhost:8081";

module.exports = {
  "Check app loads": (browser) => {
    const loginBtn = '//button[contains(.,"Dev login")]';
    browser.url(home).waitForElementVisible(loginBtn).end();
  },
};
