import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQuestionCircle,
  faArrowUpRightFromSquare,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import Icon from 'components/Icon';

const ConnectSignerModal = () => {
  return (
    <div className="py-2 w-120 h-81.5 flex flex-col justify-center text-sm">
      <h1 className="text-white text-xl font-bold mb-4">Log in</h1>
      <Icon className="w-12 h-12" name="manta" />
      <p className="tracking-tighter mt-4 mb-1 text-white text-opacity-70 text-xss">
        Log in to Manta Signer to see your zkAssets and to start transacting.
      </p>
      <div className="my-3 text-white text-opacity-70 flex flex-row gap-2">
        <FontAwesomeIcon
          className="place-self-center w-3 h-3"
          icon={faInfoCircle}
        />
        <p className="tighter-word-space tracking-tighter text-xsss">
          For Brave users: if you are already logged in, lower shields to
          connect.
        </p>
      </div>

      <a
        href="https://docs.manta.network/docs/concepts/Signer"
        className="text-xss text-white text-opacity-60 flex flex-row gap-2 items-center cursor-pointer"
        target="_blank"
        rel="noopener noreferrer">
        <FontAwesomeIcon icon={faQuestionCircle} />
        Why do I need Manta Signer?
        <FontAwesomeIcon
          className="w-2.5 h-2.5"
          icon={faArrowUpRightFromSquare}
        />
      </a>
    </div>
  );
};

export default ConnectSignerModal;
