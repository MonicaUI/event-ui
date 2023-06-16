import React, { useState } from 'react';

// Utilities
import { resolveTestId } from '@cvent/nucleus-test-automation';
import { select, resolve } from '@cvent/nucleus-dynamic-css';
import { injectTestId } from '@cvent/nucleus-test-automation';

// Base dialog
import StandardDialog from '../shared/StandardDialog';

// Components
import SubmitButton from 'nucleus-form/src/components/SubmitButton';
import Form from 'nucleus-form/src/components/Form';
import Textbox from 'nucleus-form/src/components/inputs/Textbox';
import Description from 'nucleus-widgets/lib/Description/Description';

export const WebsitePasswordDialog = (props: $TSFixMe): $TSFixMe => {
  const { translate, eventTitle } = props;

  const [password, setPassword] = useState('');
  const [errorMessages, setErrorMessages] = useState({});

  const getErrorMessages = () => {
    return errorMessages;
  };

  const onChange = (fieldName, newValue) => {
    setPassword(newValue);
    setErrorMessages({});
  };

  const handleWebsitePasswordSubmit = async () => {
    const { websitePasswordClient, eventId, referrer } = props;
    if (password !== undefined && eventId !== undefined) {
      const response = await websitePasswordClient.verifyPassword(eventId, password);
      props.setIsPasswordValid(response.ok);
      if (response.ok) {
        props.closeDialog(referrer);
      } else {
        setErrorMessages({ invalidError: translate('EventGuestSide_WebsitePassword_PasswordInvalid__resx') });
      }
    }
  };

  const handleSubmit = () => {
    if (password === '') {
      setErrorMessages({ blankError: translate('EventGuestSide_WebsitePassword_PasswordBlank_resx') });
    } else {
      void handleWebsitePasswordSubmit();
    }
  };

  const onKeyPress = action => {
    if (action.key === 'Enter' && password === '') {
      setErrorMessages({ blankError: translate('EventGuestSide_WebsitePassword_PasswordBlank_resx') });
    } else if (action.key === 'Enter') {
      handleSubmit();
    }
  };

  const onBlur = () => {
    if (password === '') {
      setErrorMessages({ blankError: translate('EventGuestSide_WebsitePassword_PasswordBlank_resx') });
    }
  };

  return (
    <StandardDialog {...props} message={translate(eventTitle)}>
      <div {...resolveTestId(props)}>
        <Form>
          <div {...resolve(props, 'body')}>
            <Description text={translate('EventGuestSide_WebsitePassword_HelpText__resx')} shouldRenderHtml />
          </div>
          <Textbox
            {...select(props, 'form')}
            fieldName="websitePassword"
            type="password"
            value={password}
            onChange={onChange}
            onKeyPress={onKeyPress}
            onBlur={onBlur}
            errorMessages={getErrorMessages()}
          />
          <SubmitButton
            {...injectTestId('submit-password-button')}
            {...resolve(props, 'primaryButton')}
            onSubmit={handleSubmit}
          >
            {translate('EventGuestSide_WebsitePassword_SubmitButton__resx')}
          </SubmitButton>
        </Form>
      </div>
    </StandardDialog>
  );
};
