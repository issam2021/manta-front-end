// @ts-nocheck
import React, { useEffect } from 'react';
import ChainSelect from 'pages/BridgePage/ChainSelect';
import SendButton from 'pages/BridgePage/SendButton';
import { useTxStatus } from 'contexts/txStatusContext';
import { useKeyring } from 'contexts/keyringContext';
import { useConfig } from 'contexts/configContext';
import classNames from 'classnames';
import Icon from 'components/Icon';
import { useBridgeData } from './BridgeContext/BridgeDataContext';
import BridgeAssetSelect from './BridgeAssetSelect';
import BridgeFeeDisplay from './BridgeFeeDisplay';
import BridgeDestinationForm from './BridgeDestinationForm';

const BridgeForm = () => {
  const config = useConfig();
  const { txStatus } = useTxStatus();
  const disabled = txStatus?.isProcessing();
  const { keyring } = useKeyring();
  const {
    originChain,
    originChainOptions,
    setOriginChain,
    destinationChain,
    destinationChainOptions,
    setDestinationChain,
    switchOriginAndDestination,
    originChainIsEvm,
    destinationChainIsEvm
  } = useBridgeData();

  useEffect(() => {
    if (keyring) {
      keyring.setSS58Format(config.SS58_FORMAT);
    }
  }, [keyring]);

  const onClickSwitchOriginAndDestination = () => {
    if (!disabled) {
      switchOriginAndDestination();
    }
  };

  const shouldShowDestinationForm = originChainIsEvm || destinationChainIsEvm;

  return (
    <div className="2xl:inset-x-0 justify-center min-h-full flex flex-col gap-6 items-center pb-2 pt-12">
      <div className="flex flex-col px-3 py-4 sm:p-8 bg-secondary rounded-lg">
        <div className="flex gap-5 flex-row items-end mb-6">
          <ChainSelect
            chain={originChain}
            chainOptions={originChainOptions}
            setChain={setOriginChain}
            isOriginChain={true}
          />
          <Icon
            name="leftRightArrow"
            onClick={onClickSwitchOriginAndDestination}
            className={classNames('mx-auto pb-7 cursor-pointer', {
              disabled: disabled
            })}
          />
          <ChainSelect
            chain={destinationChain}
            chainOptions={destinationChainOptions}
            setChain={setDestinationChain}
            isOriginChain={false}
          />
        </div>
        <div className="flex flex-col flex-y gap-4">
          <div>
            <BridgeAssetSelect />
          </div>
        </div>
        {shouldShowDestinationForm && <BridgeDestinationForm />}
        <BridgeFeeDisplay />
        <SendButton />
      </div>
    </div>
  );
};

export default BridgeForm;
