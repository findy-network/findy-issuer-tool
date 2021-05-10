import { stringType } from './common';
import log from '../log';

export default (agent) => {
  const pairwiseInvitation = async (req, res) => {
    try {
      const invitationStr = await agent.createPairwiseInvitation();
      res.json(JSON.parse(invitationStr));
    } catch (err) {
      log.error(`Invitation creation failed: ${err}`);
      res.status(500).json({
        err,
        payload: req.body,
        msg: 'Invitation creation failed.',
        code: 500,
      });
    }
  };

  const pairwiseSendMessageBody = {
    type: 'object',
    required: ['connectionId', 'msg'],
    properties: {
      connectionId: stringType,
      msg: stringType,
    },
  };

  const pairwiseSendMessage = async (req, res) => {
    try {
      const ok = await agent.pairwiseSendMessage(req.body);
      res.json({ ok });
    } catch (err) {
      const msg = `Basic message sending failed for ${req.body.connectionId}.`;
      log.error(`${msg} ${err}`);
      res.status(500).json({
        err,
        payload: req.body,
        msg,
        code: 500,
      });
    }
  };

  const pairwiseSendProofRequestBody = {
    type: 'object',
    required: ['connectionId', 'credDefId', 'attributes'],
    properties: {
      connectionId: stringType,
      credDefId: stringType,
      attributes: {
        type: 'object',
      },
    },
  };

  const pairwiseSendProofRequest = async (req, res) => {
    try {
      const ok = await agent.pairwiseSendProofRequest(req.body);
      res.json({ ok });
    } catch (err) {
      const msg = `Sending proof request failed for ${req.body.connectionId}.`;
      log.error(`${msg} ${err}`);
      res.status(500).json({
        err,
        payload: req.body,
        msg,
        code: 500,
      });
    }
  };

  const pairwiseSendCredentialBody = {
    type: 'object',
    required: ['connectionId', 'credDefId', 'values'],
    properties: {
      connectionId: stringType,
      credDefId: stringType,
      values: {
        type: 'object',
      },
    },
  };

  const pairwiseSendCredential = async (req, res) => {
    try {
      const ok = await agent.pairwiseSendCredential(req.body);
      res.json({ ok });
    } catch (err) {
      const msg = `Issuing failed for ${req.body.connectionId}.`;
      log.error(`${msg} ${err}`);
      res.status(500).json({
        err,
        payload: req.body,
        msg,
        code: 500,
      });
    }
  };

  return {
    pairwiseInvitationRoute: () => [pairwiseInvitation],
    pairwiseSendMessageRoute: (validate) => [
      validate({ body: pairwiseSendMessageBody }),
      pairwiseSendMessage,
    ],
    pairwiseSendProofRequestRoute: (validate) => [
      validate({ body: pairwiseSendProofRequestBody }),
      pairwiseSendProofRequest,
    ],
    pairwiseSendCredentialRoute: (validate) => [
      validate({ body: pairwiseSendCredentialBody }),
      pairwiseSendCredential,
    ],
  };
};
