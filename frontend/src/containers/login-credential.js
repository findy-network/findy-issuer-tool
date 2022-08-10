import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import LoginCredentialComponent from '../components/login-credential';
import { fetchFtnInvitation, fetchFtnStatus } from '../store/actions';

function LoginCredential({
  status,
  invitation,
  doFetchFtnInvitation,
  doFetchFtnStatus,
}) {
  const [invitationFetched, setIinvitationFetched] = useState(false);
  const [pollingStatus, setPollingStatus] = useState(false);
  useEffect(() => {
    if (!invitationFetched) {
      doFetchFtnInvitation();
      setIinvitationFetched(true);
    }
    if (invitation && !pollingStatus) {
      doFetchFtnStatus({ id: invitation.id });
      setPollingStatus(true);
    }
  });

  return <LoginCredentialComponent invitation={invitation} status={status} />;
}

const mapStateToProps = ({ ftn }) => ({
  invitation: ftn.invitation,
  status: ftn.status,
});

const mapDispatchToProps = (dispatch) => ({
  doFetchFtnInvitation: () => dispatch(fetchFtnInvitation()),
  doFetchFtnStatus: (payload) => dispatch(fetchFtnStatus(payload)),
});

LoginCredential.propTypes = {
  invitation: PropTypes.object,
  status: PropTypes.string,
  doFetchFtnInvitation: PropTypes.func.isRequired,
  doFetchFtnStatus: PropTypes.func.isRequired,
};

LoginCredential.defaultProps = {
  invitation: null,
  status: null,
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginCredential);
