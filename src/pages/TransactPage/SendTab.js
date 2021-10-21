import FormSelect from 'components/elements/Form/FormSelect';
import React, { useState, useRef, useEffect } from 'react';
import { base64Encode } from '@polkadot/util-crypto';
import CurrencyType from 'types/ui/CurrencyType';
import BN from 'bn.js';
import FormInput from 'components/elements/Form/FormInput';
import Button from 'components/elements/Button';
import { useSubstrate } from 'contexts/SubstrateContext';
import Svgs from 'resources/icons';
import { useWallet } from 'contexts/WalletContext';
import { useExternalAccount } from 'contexts/ExternalAccountContext';
import TxStatus from 'types/ui/TxStatus';
import { makeTxResHandler } from 'utils/api/MakeTxResHandler';
import { base64Decode } from '@polkadot/util-crypto';
import MantaLoading from 'components/elements/Loading';
import { showError, showSuccess } from 'utils/ui/Notifications';
import selectCoins from 'utils/SelectCoins';
import TransactionController from 'api/TransactionController';

const SendTab = () => {
  const { api } = useSubstrate();
  const { currentExternalAccount } = useExternalAccount();
  const { getSpendableBalance, spendableAssets, removeSpendableAsset } =
    useWallet();

  const [, setUnsub] = useState(null);
  const [selectedAssetType, setSelectedAssetType] = useState(null);
  const [sendAmountInput, setSendAmountInput] = useState(null);
  const [privateTransferAmount, setPrivateTransferAmount] = useState(
    new BN(-1)
  );
  const [receivingAddress, setReceivingAddress] = useState('');
  const coinSelection = useRef(null);
  const [status, setStatus] = useState(null);
  const txResWasHandled = useRef(null);
  const [privateBalance, setPrivateBalance] = useState(null);

  useEffect(() => {
    const displaySpendableBalance = async () => {
      if (!api) return;
      await api.isReady;
      selectedAssetType &&
        setPrivateBalance(getSpendableBalance(selectedAssetType.assetId, api));
    };
    displaySpendableBalance();
  }, [selectedAssetType, status, spendableAssets, api]);

  /**
   *
   * polkadot.js API API response Handlers
   *
   */

  const onPrivateTransferSuccess = async (block) => {
    // Seems like every batched tx gets handled?
    if (txResWasHandled.current === true) {
      return;
    }
    coinSelection.current.coins.forEach((coins) => {
      removeSpendableAsset(coins, api);
    });
    showSuccess('Transfer successful');
    txResWasHandled.current = true;
    setStatus(TxStatus.finalized(block));
  };

  const onPrivateTransferFailure = (block, error) => {
    // Every batched tx gets handled separately
    if (txResWasHandled.current === true) {
      return;
    }
    console.error(error);
    showError('Transfer failed');
    txResWasHandled.current = true;
    setStatus(TxStatus.failed(block, error));
  };

  const onPrivateTransferUpdate = (message) => {
    setStatus(TxStatus.processing(message));
  };

  const onClickSend = async () => {
    setStatus(TxStatus.processing());
    await doPrivateTransfer();
  };

  const doPrivateTransfer = async () => {
    coinSelection.current = selectCoins(privateTransferAmount, spendableAssets);
    const controller = new TransactionController(api, coinSelection.current);
    const transactions = await controller.buildExternalPrivateTransfer(
      receivingAddress
    );

    const txResHandler = makeTxResHandler(
      api,
      onPrivateTransferSuccess,
      onPrivateTransferFailure,
      onPrivateTransferUpdate
    );

    const unsub = api.tx.utility
      .batch(transactions)
      .signAndSend(currentExternalAccount, txResHandler);
    setUnsub(() => unsub);
  };

  const insufficientFunds = privateBalance?.lt(privateTransferAmount);
  const formIsDisabled = status && status.isProcessing();
  const buttonIsDisabled =
    formIsDisabled || insufficientFunds || !privateTransferAmount.gt(new BN(0));

  const onChangeSendAmountInput = (amountStr) => {
    setSendAmountInput(amountStr);
    try {
      setPrivateTransferAmount(new BN(amountStr));
    } catch (error) {
      return;
    }
  };

  const onClickMax = () => {
    onChangeSendAmountInput(privateBalance.toString());
  };

  const onChangeReceivingAddress = (e) => {
    try {
      setReceivingAddress(
        base64Encode(
          api
            .createType(
              'MantaAssetShieldedAddress',
              base64Decode(e.target.value)
            )
            .toU8a()
        )
      );
    } catch (e) {
      setReceivingAddress(null);
    }
  };

  const balanceString =
    privateBalance &&
    selectedAssetType &&
    `Available: ${privateBalance.toString()} private ${
      selectedAssetType.ticker
    }`;

  const addressValidationText = 'Receiver';

  return (
    <div className="send-content">
      <div className="py-2">
        <FormSelect
          label="Token"
          selectedOption={selectedAssetType}
          setSelectedOption={setSelectedAssetType}
          options={CurrencyType.AllCurrencies()}
          disabled={formIsDisabled}
        />
        <FormInput
          value={sendAmountInput}
          onChange={(e) => onChangeSendAmountInput(e.target.value)}
          onClickMax={onClickMax}
          type="text"
        >
          {balanceString}
        </FormInput>
      </div>
      <img className="mx-auto" src={Svgs.ArrowDownIcon} alt="switch-icon" />
      <div className="py-2">
        <FormInput
          onChange={onChangeReceivingAddress}
          prefixIcon={Svgs.WalletIcon}
          isMax={false}
          type="text"
        >
          {addressValidationText}
        </FormInput>
      </div>
      {status?.isProcessing() ? (
        <MantaLoading className="py-4" />
      ) : (
        <Button
          onClick={onClickSend}
          disabled={buttonIsDisabled}
          className="btn-primary btn-hover w-full text-lg py-3"
        >
          Send
        </Button>
      )}
    </div>
  );
};

export default SendTab;
