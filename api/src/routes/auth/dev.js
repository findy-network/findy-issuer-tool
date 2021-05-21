export default (createToken, config) => {
  const devLogin = async (req, res) => {
    if (config.devMode) {
      const token = await createToken('dev', 'dev@localhost');
      return res.redirect(
        `${config.auth.apps['findy-issuer-app'].redirectUrl}?token=${token}`,
      );
    }
    return res.status(404);
  };

  return { devLogin };
};
