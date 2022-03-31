import log from '../log';
import isb from './auth/isb';

export default async (ftnService, config) => {
  const isbAuth = await isb(ftnService.authReady, config, (res, ok) =>
    res.send('ok'),
  );

  const start = async (req, res) => {
    try {
      const invitation = await ftnService.start();

      res.json({ url: invitation.url, id: invitation.id });
    } catch (err) {
      log.error(`Invitation creation failed: ${err}`);
      res.status(500).json({
        err,
        msg: 'Invitation creation failed.',
        code: 500,
      });
    }
  };

  const getStatus = async (req, res) => {
    try {
      const status = await ftnService.status(req.query.id);

      res.json({ status });
    } catch (err) {
      log.error(`Status fetching failed: ${err}`);
      res.status(500).json({
        err,
        payload: req.query,
        msg: 'Status fetching failed.',
        code: 500,
      });
    }
  };

  const doAuth = async (req, res) => {
    const nonce = isbAuth.newNonce();
    const url = await isbAuth.getUrlForEmail(
      nonce,
      `${config.ourHost}/ftn/callback`,
    );
    req.session.nonce = nonce;
    req.session.email = req.query.id;
    log.info(`Generating ISB auth url for FTN connection ${req.query.id}`);
    return res.redirect(url);
  };

  const callback = async (req, res) => isbAuth.isbCallback(req, res);

  return {
    ftnStart: start,
    ftnStatus: getStatus,
    ftnAuth: doAuth,
    ftnCallback: callback,
  };
};
