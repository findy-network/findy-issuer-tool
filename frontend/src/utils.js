export const walletURL = CONFIG.wallets.findy.url.substring(
  0,
  CONFIG.wallets.findy.url.lastIndexOf('/', CONFIG.wallets.findy.url.length - 2)
);

export default {};
