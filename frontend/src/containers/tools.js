import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Divider from '@material-ui/core/Divider';
import { saveSchema, saveCredDef } from '../store/actions';
import CredDefEditor from '../components/cred-def-editor';
import SchemaEditor from '../components/schema-editor';

const defaultSchemaJSON = JSON.stringify({
  attrs: ['email'],
  name: 'Email',
  version: '1.0',
});

function Tools({
  doSaveSchema,
  doSaveCredDef,
  schemaId,
  sendingSchema,
  credDefId,
  sendingCredDef,
  schemas,
  credDefs,
}) {
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
        sending={sendingSchema}
      />
      <Divider />
      <CredDefEditor
        doSaveEditorItem={doSaveCredDef}
        value={credDefId}
        txnType="102"
        title="Credential Definition"
        label="CredDefJSON"
        description="Note: creation may take a while depending on the ledger type."
        defaultValue={defaultCredDefJSON}
        items={credDefs}
        schemas={schemas}
        sending={sendingCredDef}
      />
    </div>
  );
}

Tools.propTypes = {
  doSaveSchema: PropTypes.func.isRequired,
  doSaveCredDef: PropTypes.func.isRequired,
  schemaId: PropTypes.string,
  sendingSchema: PropTypes.bool,
  credDefId: PropTypes.string,
  sendingCredDef: PropTypes.bool,
  schemas: PropTypes.arrayOf(PropTypes.string).isRequired,
  credDefs: PropTypes.arrayOf(PropTypes.string).isRequired,
};

Tools.defaultProps = {
  schemaId: null,
  sendingSchema: false,
  credDefId: null,
  sendingCredDef: false,
};

const mapStateWithProps = ({
  result: { schemaId, sendingSchema, credDefId, sendingCredDef },
  ledger,
}) => ({
  schemaId,
  sendingSchema,
  credDefId,
  sendingCredDef,
  schemas: ledger ? ledger.schemas : [],
  credDefs: ledger ? ledger.credDefs : [],
});
const mapDispatchWithProps = (dispatch) => ({
  doSaveSchema: (schema) => dispatch(saveSchema(schema)),
  doSaveCredDef: (credDef) => dispatch(saveCredDef(credDef)),
});

export default connect(mapStateWithProps, mapDispatchWithProps)(Tools);
