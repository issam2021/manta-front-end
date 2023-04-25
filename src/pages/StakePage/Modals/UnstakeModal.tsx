// @ts-nocheck
import React, { useEffect, useState } from 'react';
import Button from 'components/Button';
import GradientText from 'components/GradientText';
import Balance from 'types/Balance';
import AssetType from 'types/AssetType';
import Decimal from 'decimal.js';
import BN from 'bn.js';
import ErrorText from 'components/Error/ErrorText';
import WarningText from 'components/Error/WarningText';
import { usePublicAccount } from 'contexts/publicAccountContext';
import { useTxStatus } from 'contexts/txStatusContext';
import { useConfig } from 'contexts/configContext';
import Icon from 'components/Icon';
import classNames from 'classnames';
import { useUsdPrices } from 'contexts/usdPricesContext';
import { useStakeData } from '../StakeContext/StakeDataContext';
import { useStakeTx } from '../StakeContext/StakeTxContext';
import ModalNotes from './ModalNotes';

export const UnstakeModal = ({ hideModal }) => {
  const {
    selectedCollator,
    selectedCollatorDelegation,
    setUnstakeTargetBalance,
    unstakeTargetBalance,
    userAvailableBalance,
  } = useStakeData();
  const {
    getUserCanUnstake,
    getUnstakeAmountIsOverZero,
    getUserHasSufficientFreeFundsToUnstake,
    getUserHasSufficientStakedFundsToUnstake,
    getUnstakeWouldBeBelowDelegationThreshold,
    unstake
  } = useStakeTx();

  const config = useConfig();
  const { externalAccount } = usePublicAccount();
  const { txStatus } = useTxStatus();
  const { usdPrices } = useUsdPrices();
  const nativeTokenUsdValue = usdPrices?.[AssetType.Native(config).baseTicker];


  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [warningMessage, setWarningMessage] = useState(null);

  const delegationAmountNum = selectedCollatorDelegation
    ? `${selectedCollatorDelegation.delegatedBalance.toDisplayString(0)}`
    : '0 KMA';

  const minimumStakeAmountString = selectedCollator.minStake.toDisplayString(0);
  const minimumStakeNum = `${minimumStakeAmountString}`;

  const usdValueText =
    unstakeTargetBalance && nativeTokenUsdValue
      ? unstakeTargetBalance.toUsd(nativeTokenUsdValue).toString()
      : '';

  const notes = [
    'The unstaking process takes seven days. After seven days you can withdraw your tokens.',
    'Unstaked tokens will no longer earn staking rewards.'
  ];

  useEffect(() => {
    const getErrorMessage = async () => {
      if (!externalAccount) {
        setErrorMessage('Wallet not connected');
      } else if (txStatus?.isProcessing()) {
        setErrorMessage('Transaction in progress');
      } else if (
        !unstakeTargetBalance ||
        !selectedCollator ||
        !userAvailableBalance
      ) {
        setErrorMessage(null);
      } else if (!getUnstakeAmountIsOverZero()) {
        setErrorMessage('Cannot unstake zero balance');
      } else if (!(await getUserHasSufficientFreeFundsToUnstake())) {
        setErrorMessage('Insufficient balance to pay fees');
      } else if (!(await getUserHasSufficientStakedFundsToUnstake())) {
        setErrorMessage('Cannot unstake more than staked balance');
      } else {
        setErrorMessage(null);
      }
    };
    const getWarningMessage = () => {
      if (getUnstakeWouldBeBelowDelegationThreshold()) {
        setWarningMessage('Full balance will unstake');
      } else {
        setWarningMessage(null);
      }
    };
    getErrorMessage();
    getWarningMessage();
  }, [
    selectedCollator,
    selectedCollatorDelegation,
    unstakeTargetBalance,
    userAvailableBalance
  ]);

  const onClickUnstake = async () => {
    const userCanUnstake = await getUserCanUnstake();
    if (userCanUnstake) {
      unstake();
      hideModal();
    }
  };

  const onChangeUnstakeAmountInput = (value) => {
    if (value === '') {
      setUnstakeTargetBalance(null);
      setInputValue('');
    } else {
      try {
        const targetBalance = Balance.fromBaseUnits(
          AssetType.Native(config),
          new Decimal(value)
        );
        setInputValue(value);
        if (targetBalance.valueAtomicUnits.gte(new BN(0))) {
          setUnstakeTargetBalance(targetBalance);
        } else {
          setUnstakeTargetBalance(null);
        }
      } catch (error) {
        return;
      }
    }
  };

  const onClickMax = async () => {
    const maxUnstakeableBalance =
      selectedCollatorDelegation.delegatedBalance.toString();
    onChangeUnstakeAmountInput(maxUnstakeableBalance);
  };

  return (
    <div className="w-96 py-4 bg-primary rounded-2xl">
      <div className="relative flex items-center gap-2">
        <div className="absolute -mt-4">
          <h1 className="font-semibold text-white text-base">
            {selectedCollator.name}
          </h1>
        </div>
      </div>
      <div className="mt-4 text-white text-opacity-80 text-sm">
        <div className="flex justify-between mt-2">
          <span>Staked: </span>
          <span className="font-red-hat-mono  text-left text-sm font-medium">
            {delegationAmountNum}
          </span>
        </div>
        <div className="flex justify-between mt-2">
          <span>Minimum stake: </span>
          <span className="font-red-hat-mono  text-left text-sm font-medium">
            {minimumStakeNum}
          </span>
        </div>
        <div className="mt-4 px-6 h-24 flex flex-wrap items-center rounded-xl bg-white bg-opacity-5">
          <Icon className="mr-3 w-7" name="calamari" />
          <div className="flex flex-row items-center">
            <div className="flex flex-col items-center">
              <input
                className="font-red-hat-mono text-xl bg-transparent pl-1 flex-grow h-8 outline-none dark:text-white"
                placeholder="Amount"
                onChange={(e) => onChangeUnstakeAmountInput(e.target.value)}
                value={inputValue}
              />
              <div className="font-red-hat-mono w-full mb-1 text-xs pl-1 text-secondary">
                {usdValueText}
              </div>
            </div>
            <div className="rounded-xl justify-self-end" onClick={onClickMax}>
              <GradientText className="text-base w-full" text="MAX" />
            </div>
          </div>
          <br />
        </div>
      </div>
      {errorMessage ? (
        <ErrorText errorMessage={errorMessage} />
      ) : (
        <WarningText warningMessage={warningMessage} />
      )}

      <div className="mt-6 w-full">
        <Button
          className={ classNames('font-red-hat-text text-base w-full btn-primary', { 'filter brightness-50': !inputValue }) }
          onClick={onClickUnstake}
          disabled={!inputValue}
        >
          Unstake
        </Button>
      </div>
      <ModalNotes notes={notes} />
    </div>
  );
};

export default UnstakeModal;
