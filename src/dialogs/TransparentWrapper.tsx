import React from 'react';
import { connect } from 'react-redux';
import TransparentWrapperStyles from './TransparentWrapper.less';
import { resolve } from '@cvent/nucleus-dynamic-css';
import { injectTestId } from '@cvent/nucleus-test-automation';

const TransparentWrapperDivStyles = {
  classes: TransparentWrapperStyles
};

type TransparentWrapperProps = {
  shouldShowWrapper: boolean;
};

const TransparentWrapper = ({ shouldShowWrapper }: TransparentWrapperProps) => {
  const Styles = {
    ...TransparentWrapperDivStyles
  };

  return (
    <div>
      {shouldShowWrapper ? (
        <div {...injectTestId('transparent-wrapper-preview')} {...resolve(Styles, 'transparentWrapper')}></div>
      ) : null}
    </div>
  );
};

const mapStateToProps = (state: $TSFixMe) => {
  return {
    shouldShowWrapper: state.transparentWrapper.showTransparentWrapper
  };
};

export default connect(mapStateToProps)(TransparentWrapper);
