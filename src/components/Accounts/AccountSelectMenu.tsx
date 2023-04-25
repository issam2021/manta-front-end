// @ts-nocheck
import WALLET_NAME from 'constants/WalletConstants';
import classNames from 'classnames';
import Icon from 'components/Icon';
import { useGlobal } from 'contexts/globalContexts';
import { useKeyring } from 'contexts/keyringContext';
import { useMetamask } from 'contexts/metamaskContext';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import { usePublicAccount } from 'contexts/publicAccountContext';
import { useState } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import AccountSelectDropdown from './AccountSelectDropdown';
import { ConnectWalletButton, ConnectWalletIcon } from './ConnectWallet';
import WalletSelectBar from './WalletSelectIconBar';

const DisplayAccountsButton = () => {
  const { ethAddress } = useMetamask();
  const { selectedWallet } = useKeyring();
  const { externalAccount } = usePublicAccount();
  const { isReady: privateWalletIsReady } = usePrivateWallet();
  const [showAccountList, setShowAccountList] = useState(false);
  const [isMetamaskSelected, setIsMetamaskSelected] = useState(false);
  const { usingMantaWallet } = useGlobal();

  const isMetamaskEnabled =
    !!ethAddress && window?.location?.pathname?.includes('bridge');

  // using manta wallet zkAddress combined with other wallets public address
  const isOnlyUsingMantaWalletZKAddress =
    usingMantaWallet &&
    privateWalletIsReady &&
    selectedWallet?.extensionName !== WALLET_NAME.MANTA &&
    window?.location?.pathname?.includes('transact');

  const succinctAccountName =
    externalAccount?.meta.name.length >11
      ? `${externalAccount?.meta.name.slice(0, 11)}...`
      : externalAccount?.meta.name;

  const ExternalAccountBlock = ({ text }) => {
    return (
      <>
        <img
          className="unselectable-text w-6 h-6 rounded-full"
          src={selectedWallet.logo.src}
          alt={selectedWallet.logo.alt}
        />
        {
          isOnlyUsingMantaWalletZKAddress && (
            <Icon
              className="unselectable-text w-6 h-6 rounded-full"
              name="manta"
            />
          )
        }
        {isMetamaskEnabled && (
          <Icon
            className="unselectable-text w-6 h-6 rounded-full"
            name="metamask"
          />
        )}
        <p className="unselectable-text">{text}</p>
      </>
    );
  };

  return (
    <div className="relative">
      <OutsideClickHandler onOutsideClick={() => setShowAccountList(false)}>
        <div
          className={classNames(
            'flex flex-row justify-center h-10 gap-3 border border-white-light bg-fifth dark:text-black dark:text-white font-red-hat-text w-44 text-sm cursor-pointer rounded-lg items-center'
          )}
          onClick={() => setShowAccountList(!showAccountList)}>
          <ExternalAccountBlock
            text={(isMetamaskEnabled || isOnlyUsingMantaWalletZKAddress) ? 'Connected' : succinctAccountName}
          />
        </div>
        {showAccountList && (
          <div className="w-80 flex flex-col mt-3 absolute right-0 top-full border border-white-light rounded-lg text-black dark:text-white">
            <div className="flex flex-row items-center justify-between bg-fourth rounded-t-lg">
              <div className="flex flex-row items-center">
                <WalletSelectBar
                  isMetamaskSelected={isMetamaskSelected}
                  setIsMetamaskSelected={setIsMetamaskSelected}
                />
              </div>
              <div className="relative top-1">
                <ConnectWalletIcon setIsMetamaskSelected={setIsMetamaskSelected} />
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto bg-primary px-5 py-5 rounded-b-lg">
              <AccountSelectDropdown isMetamaskSelected={isMetamaskSelected} />
            </div>
          </div>
        )}
      </OutsideClickHandler>
    </div>
  );
};

const AccountSelectMenu = () => {
  const { externalAccount } = usePublicAccount();

  return externalAccount ? (
    <DisplayAccountsButton />
  ) : (
    <ConnectWalletButton
      className={
        'bg-connect-wallet-button text-white font-red-hat-text text-sm h-10 w-44 cursor-pointer rounded-lg'
      }
    />
  );
};

export default AccountSelectMenu;
