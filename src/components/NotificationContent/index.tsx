// @ts-nocheck
import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLink } from '@fortawesome/free-solid-svg-icons';
import Icon from 'components/Icon';

export const TxSuccessNotificationContent = ({ extrinsic, subscanBaseUrl }) => {
  const onClickHandler = (subscanBaseUrl) => () => {
    if (subscanBaseUrl) {
      const subscanLink = `${subscanBaseUrl}/extrinsic/${extrinsic}`;
      window.open(subscanLink, '_blank', 'noreferrer');
    }
  };

  return (
    <div>
      <div
        className={classNames('h-12 flex flex-col justify-center', {
          'cursor-pointer': subscanBaseUrl
        })}
        onClick={onClickHandler(subscanBaseUrl)}>
        <div className="text-lg font-semibold text-thirdry mb-1">
          Transaction succeeded
        </div>
        {subscanBaseUrl && (
          <p className="text-base mt-1">
            View on explorer&nbsp;
            <FontAwesomeIcon icon={faExternalLink} />
          </p>
        )}
      </div>
    </div>
  );
};

TxSuccessNotificationContent.propTypes = {
  extrinsic: PropTypes.string,
  subscanBaseUrl: PropTypes.string
};

export const NotificationContent = ({ msg }) => {
  return (
    <div className="pt-2 pb-4 ">
      <h1 className="text-base pt-1 font-semibold text-thirdry">{msg}</h1>
    </div>
  );
};

NotificationContent.propTypes = {
  msg: PropTypes.string
};

export const WarningNotification = ({
  title,
  content,
  linkUrl,
  linkText
}: {
  title: string;
  content: string;
  linkUrl?: string;
  linkText?: string;
}) => {
  return (
    <div className={classNames('flex items-center justify-center -mt-1')}>
      <Icon className="w-12 h-12" name="warningV2" />
      <div className="mx-4">
        <div className="text-sm font-semibold text-thirdry mb-1">{title}</div>
        <p className="text-xs my-1">{content}</p>
        {linkUrl && (
          <a
            href={linkUrl}
            target="_blank"
            className={classNames('text-xs mt-1', {
              'cursor-pointer': linkUrl
            })}
            rel="noreferrer">
            <span className="mr-2">{linkText}</span>
            <FontAwesomeIcon icon={faExternalLink} />
          </a>
        )}
      </div>
    </div>
  );
};
