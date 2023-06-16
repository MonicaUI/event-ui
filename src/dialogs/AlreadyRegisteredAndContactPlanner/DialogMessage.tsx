import React from 'react';
import Styles from './DialogMessage.less';
import Icon from '@cvent/nucleus-icon';
import { resolve, select } from '@cvent/nucleus-dynamic-css';
import { resolveTestId, injectTestId } from '@cvent/nucleus-test-automation';
import Button from 'nucleus-core/buttons/Button';

type Props = {
  type: 'success' | 'error' | 'warning';
  title: string;
  message?: string;
  translate: $TSFixMeFunction;
  onBackClick?: $TSFixMeFunction;
  backButtonText?: string;
};

export default function DialogMessage({
  type,
  title,
  message,
  onBackClick,
  translate,
  backButtonText,
  ...rest
}: Props): $TSFixMe {
  const iconClass = `${Styles.icon} ${Styles[type]}`;
  return (
    <div className={Styles.container} {...resolveTestId(rest)}>
      <Icon {...injectTestId('icon')} icon={type === 'success' ? 'check' : 'error'} modifier={iconClass} />
      <h2 {...resolve(rest, 'title')} {...injectTestId('title')}>
        {title}
      </h2>
      <h4 {...resolve(rest, 'subTitle')} {...injectTestId('subtitle')}>
        {message}
      </h4>
      {onBackClick && (
        <div className={Styles.backButtonContainer}>
          <Button
            {...injectTestId('link')}
            {...select(rest, 'backButton')}
            kind="backButton"
            onClick={onBackClick}
            title={`< ${backButtonText || translate('EventWidgets_AlreadyRegistered_BackButton__resx')}`}
          />
        </div>
      )}
    </div>
  );
}
