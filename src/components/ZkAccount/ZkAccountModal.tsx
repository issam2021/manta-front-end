import classNames from 'classnames';
import CopyPasteIcon from 'components/CopyPasteIcon';
import Icon from 'components/Icon';
import { API_STATE, useSubstrate } from 'contexts/substrateContext';
import { useZkAccountBalances } from 'contexts/zkAccountBalancesContext';
import { usePrivateWallet } from 'contexts/privateWalletContext';
import { useState } from 'react';
import getAbbreviatedName from 'utils/display/getAbbreviatedName';
import PrivateActivityTableContent from './PrivateActivityTableContent';
import PrivateAssetTableContent from './PrivateAssetTableContent';

type TableContentSelectorProp = {
  displayAssets: boolean;
  displayAssetsHandler: () => void;
  displayActivityHandler: () => void;
};

const TableContentSelector = ({
  displayAssets,
  displayAssetsHandler,
  displayActivityHandler
}: TableContentSelectorProp) => {
  return (
    <div className="flex items-center text-white-60">
      <div
        className="cursor-pointer w-1/2 text-center text-sm"
        onClick={displayAssetsHandler}>
        <div
          className={classNames('pt-4 pb-3.5', {
            'text-white': displayAssets
          })}>
          Assets
        </div>
        <Icon name={displayAssets ? 'blueSolidLine' : 'grayThinLine'} />
      </div>
      <div
        className="cursor-pointer w-1/2 text-center text-sm"
        onClick={displayActivityHandler}>
        <div
          className={classNames('pt-4 pb-3.5', {
            'text-white': !displayAssets
          })}>
          Activity
        </div>
        <Icon name={displayAssets ? 'grayThinLine' : 'blueSolidLine'} />
      </div>
    </div>
  );
};

const ZkAddressDisplay = () => {
  const { privateAddress } = usePrivateWallet();
  const privateAddressDisplayString = privateAddress ?
    `zkAddress ${getAbbreviatedName(privateAddress, 5, 4)}`
    : '';
  return (
    <div className="flex justify-between">
      <div className="border border-white border-opacity-20 bg-white bg-opacity-5 rounded-lg p-2 flex items-center gap-2">
        <Icon className="w-6 h-6" name="manta" />
        <span className="text-white font-light">
          {privateAddressDisplayString}
        </span>
      </div>
      <CopyPasteIcon btnClassName="border border-white border-opacity-20 bg-white bg-opacity-5 rounded-lg relative p-2.5 w-10.5 text-0" iconClassName="w-5 h-5" textToCopy={privateAddress || ''} />
    </div>
  );
};

const UsdBalanceDisplay = () => {
  const { totalBalanceString } = useZkAccountBalances();
  return (
    <div className="border border-white border-opacity-20 bg-white bg-opacity-5 rounded-lg p-1 mt-4 text-secondary flex flex-col justify-center items-center">
      <span className="pt-3 pb-1 text-base text-white">Total zkBalance</span>
      <div className="text-white pb-3 text-2xl font-bold">{totalBalanceString}</div>
    </div>
  );
};

const TableContentDisplay = () => {
  const [displayAssets, setDisplayAssets] = useState(true);

  const displayAssetsHandler = () => {
    setDisplayAssets(true);
  };

  const displayActivityHandler = () => {
    setDisplayAssets(false);
  };
  return (
    <>
      <TableContentSelector
        displayAssets={displayAssets}
        displayAssetsHandler={displayAssetsHandler}
        displayActivityHandler={displayActivityHandler}
      />
      <div className="overflow-y-auto h-50">
        {displayAssets ? (
          <PrivateAssetTableContent />
        ) : (
          <PrivateActivityTableContent />
        )}
      </div>
    </>
  );
};

const NetworkDisconnectedDisplay = () => {
  return (
    <div className="border border-secondary rounded-lg px-6 py-6 mt-4 text-secondary overflow-y-auto bg-white bg-opacity-5">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="text-white text-center">
          Cannot connect to the network
        </div>
        <div className="text-secondary text-xss">
          Please check your internet connection and wait to reconnect.
        </div>
      </div>
    </div>
  );
};

const ZkAccountModalContent = () => {
  const { apiState } = useSubstrate();
  const isDisconnected =
    apiState === API_STATE.DISCONNECTED || apiState === API_STATE.ERROR;
  return (
    <>
      <div className="flex flex-col w-80 mt-3 bg-fifth rounded-lg p-4 absolute left-0 top-full z-50 border border-white border-opacity-20 text-secondary ">
        <ZkAddressDisplay />
        <UsdBalanceDisplay />
        {isDisconnected ? (
          <NetworkDisconnectedDisplay />
        ) : (
          <TableContentDisplay />
        )}
      </div>
    </>
  );
};

const NoZkAccountModal = () => {
  return (
    <div className="w-80 mt-3 bg-fifth rounded-lg p-4 absolute left-0 top-full z-50 border border-white border-opacity-20 text-secondary ">
      <div className="whitespace-nowrap text-center">
        You have no zkAccount yet.
      </div>
    </div>
  );
};

const ZkAccountModal = () => {
  const { privateAddress } = usePrivateWallet();
  return privateAddress ? <ZkAccountModalContent /> : <NoZkAccountModal />;
};

export default ZkAccountModal;
