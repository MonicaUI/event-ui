import React from 'react';
import { resolve, select } from '@cvent/nucleus-dynamic-css';
import ConfirmationStyles from './Confirmation.less';
import Button from 'nucleus-core/buttons/Button';
import { resolveTestId, injectTestId } from '@cvent/nucleus-test-automation';
import StandardDialog from './StandardDialog';

/*
 * React component for displaying a yes/no confirmation dialog.
 */
export const ConfirmationDialog = (props: $TSFixMe): $TSFixMe => {
  const {
    title,
    requestClose,
    translate,
    confirmChoice,
    successMessage,
    buttonText = {},
    instructionalText,
    contentDetails,
    useSuccessComponent,
    ...rest
  } = props;
  const {
    no: buttonTextNo = 'EventWidgets_GenericText_No__resx',
    yes: buttonTextYes = 'EventWidgets_GenericText_Yes__resx'
  } = buttonText;
  const successComponent = (
    <div {...resolve(rest, 'body')} className={ConfirmationStyles.cancelRegistrationModalText}>
      {translate(successMessage)}
    </div>
  );
  const confirmationPrompt = (
    <div {...injectTestId('confirmation-form')}>
      <div {...resolve(rest, 'body')} className={ConfirmationStyles.cancelRegistrationModalText}>
        {translate(instructionalText)}
        {contentDetails && (
          <div {...resolve(rest, 'detailsText')} className={ConfirmationStyles.detailsText}>
            {contentDetails}
          </div>
        )}
      </div>
      <Button
        {...injectTestId('no-submit-button')}
        {...select(rest, 'secondaryButton')}
        kind="secondaryButton"
        onClick={requestClose}
        title={translate(buttonTextNo)}
        aria-label={translate(buttonTextNo)}
      />
      <Button
        {...injectTestId('yes-submit-button')}
        {...select(rest, 'primaryButton')}
        kind="primaryButton"
        onClick={confirmChoice}
        title={translate(buttonTextYes)}
        aria-label={translate(buttonTextYes)}
        autoFocus
      />
    </div>
  );

  const dialogContent = useSuccessComponent ? successComponent : confirmationPrompt;
  return (
    <div {...resolveTestId(rest)}>
      <StandardDialog
        title={translate(title)}
        onClose={requestClose}
        closeFallbackText={translate('EventGuestSide_StandardDialog_FallbackText_Close__resx')}
        style={rest.style}
        classes={ConfirmationStyles}
      >
        <div className={ConfirmationStyles.panel} {...resolve(rest, 'panel')}>
          {dialogContent}
        </div>
      </StandardDialog>
    </div>
  );
};
