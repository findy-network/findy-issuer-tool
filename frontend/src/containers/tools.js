import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Divider from '@material-ui/core/Divider';
import { saveSchema, saveCredDef } from '../store/actions';
import LedgerEditor from '../components/ledger-editor';
import SchemaEditor from '../components/schema-editor';

const defaultSchemaJSON = JSON.stringify({
  attrs: ['email'],
  name: 'Email',
  version: '1.0',
});

const Tools = ({
  doSaveSchema,
  doSaveCredDef,
  schemaId,
  credDefId,
  schemas,
  credDefs,
}) => {
  const defaultCredDefJSON = JSON.stringify({
    schema: {
      id: schemaId || 'schema-id',
    },
    info: 'findy-issuer',
  });
  return (
    <div>
      <SchemaEditor
        doSaveEditorItem={doSaveSchema}
        value={schemaId}
        txnType="101"
        title="Schema"
        label="SchemaJSON"
        defaultValue={defaultSchemaJSON}
        items={schemas}
      />
      <Divider />
      <LedgerEditor
        doSaveEditorItem={doSaveCredDef}
        value={credDefId}
        txnType="102"
        title="Credential Definition"
        label="CredDefJSON"
        description="Replace 'schema-id' with appropriate value. 'info'-field sets cred def tag."
        defaultValue={defaultCredDefJSON}
        items={credDefs}
      />
    </div>
  );
};

Tools.propTypes = {
  doSaveSchema: PropTypes.func.isRequired,
  doSaveCredDef: PropTypes.func.isRequired,
  schemaId: PropTypes.string,
  credDefId: PropTypes.string,
  schemas: PropTypes.arrayOf(PropTypes.string).isRequired,
  credDefs: PropTypes.arrayOf(PropTypes.string).isRequired,
};

Tools.defaultProps = {
  schemaId: null,
  credDefId: null,
};

const mapStateWithProps = ({ result: { schemaId, credDefId }, ledger }) => ({
  schemaId,
  credDefId,
  schemas: ledger ? ledger.schemas : [],
  credDefs: ledger ? ledger.credDefs : [],
});
const mapDispatchWithProps = (dispatch) => ({
  doSaveSchema: (schema) => dispatch(saveSchema(schema)),
  doSaveCredDef: (credDef) => dispatch(saveCredDef(credDef)),
});

export default connect(mapStateWithProps, mapDispatchWithProps)(Tools);
