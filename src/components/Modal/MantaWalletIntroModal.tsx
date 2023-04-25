import { localStorageKeys } from 'constants/LocalStorageConstants';
import React, { useState, useEffect } from 'react';
import Icon from 'components/Icon';
import Logo from 'resources/images/manta-wallet-intro-modal-logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import store from 'store';
import { useGlobal } from 'contexts/globalContexts';
import { useLocation } from 'react-router-dom';

function MantaWalletIntroModal() {
  const [open, setOpen] = useState(false);
  const [skipIntro, setSkipIntro] = useState(false);
  const { usingMantaWallet, setUsingMantaWallet } = useGlobal();
  const { pathname } = useLocation();

  const onClickExplore = () => {
    if (!usingMantaWallet) {
      setUsingMantaWallet(true);
    }
    setOpen(false);
  };

  const skipIntroHandler = () => {
    store.set(localStorageKeys.SkipMantaWalletIntro, true);
    setSkipIntro(true);
  };

  useEffect(() => {
    const prevSkipMantaWalletIntro = store.get(
      localStorageKeys.SkipMantaWalletIntro
    );
    if (prevSkipMantaWalletIntro) {
      setSkipIntro(prevSkipMantaWalletIntro);
    } else {
      setOpen(true);
    }
  }, []);

  const isMantaPayPage = pathname.includes('/transact');
  if (!open || skipIntro || !isMantaPayPage) return null;

  return (
    <div className="flex items-center justify-center fixed top-0 bottom-0 left-0 right-0 z-50">
      <div className="flex w-156 text-white bg-sixth -m-6 rounded-lg p-6 relative">
        <div
          className="absolute top-5 right-7 text-black dark:text-white cursor-pointer text-lg"
          onClick={() => setOpen(false)}>
          <FontAwesomeIcon icon={faTimes} />
        </div>
        <div>
          <div className="text-xl font-semibold	">
            Manta Wallet extension is live,
            <br />
            enjoy MantaPay with Manta Wallet!
          </div>
          <div className="text-sm my-4">
            Manta Signer is being deprecated.
            <br />
            Downloads are disabled.
            <br />
            Please migrate to Manta Wallet to view your zkAssets.
          </div>
          <a
            className="flex items-center mb-6 hover:text-white"
            href="https://docs.manta.network/docs/guides/MantaWalletMigration"
            target="_blank"
            rel="noopener noreferrer">
            <span>Learn how to migrate</span>
            <Icon
              className="w-4 h-4 ml-2 cursor-pointer"
              name="activityRightArrow"
            />
          </a>
          <button
            onClick={onClickExplore}
            className="w-60 h-10 cursor-hover font-semibold text-modal-btn text-sm bg-white cursor-pointer rounded-lg">
            Explore Now
          </button>
          <br />
          <button
            onClick={skipIntroHandler}
            className="mt-4 cursor-hover text-white text-sm cursor-pointer rounded-lg">
            Don&apos;t show this message again
          </button>
        </div>
        <div className="-mb-6 flex items-end">
          <img src={Logo} width="240px" />
        </div>
      </div>
    </div>
  );
}

export default MantaWalletIntroModal;
