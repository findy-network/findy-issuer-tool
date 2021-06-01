export default (createToken, config) => {
  const devLogin = async (req, res) => {
    if (config.devMode) {
      const token = await createToken('dev', 'dev@localhost', 123);
      return res.redirect(
        `${config.auth.apps['findy-issuer-app'].redirectUrl}?token=${token}`,
      );
    }
    return res.status(404);
  };

  const getUrl = () => '/auth/dev';

  return { devLogin, getUrl };
};
