import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import styled from 'styled-components';

import { fetchPairwiseInvitation } from '../store/actions';
import QRInfo from '../components/qr-info';

const Container = styled.div`
  text-align: center;
`;

const Connect = ({ doFetchPairwiseInvitation, pairwiseInvitation }) => {
  useEffect(() => {
    if (!pairwiseInvitation) {
      doFetchPairwiseInvitation();
    }
  });

  const pairwiseInvitationStr =
    pairwiseInvitation && JSON.stringify(pairwiseInvitation);
  return (
    <div>
      {pairwiseInvitationStr && (
        <div>
          <QRInfo title="Pairwise invitation" value={pairwiseInvitationStr} />
          <Container>
            <Button onClick={doFetchPairwiseInvitation}>Regenerate</Button>
          </Container>
        </div>
      )}
    </div>
  );
};

Connect.propTypes = {
  doFetchPairwiseInvitation: PropTypes.func.isRequired,
  pairwiseInvitation: PropTypes.object,
};

Connect.defaultProps = {
  pairwiseInvitation: null,
};

const mapStateToProps = ({ result: { pairwiseInvitation } }) => ({
  pairwiseInvitation,
});

const mapDispatchToProps = (dispatch) => ({
  doFetchPairwiseInvitation: () => dispatch(fetchPairwiseInvitation()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Connect);
