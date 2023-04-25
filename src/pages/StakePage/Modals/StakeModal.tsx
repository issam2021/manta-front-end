// @ts-nocheck
import React, { useEffect, useState } from 'react';
import Button from 'components/Button';
import GradientText from 'components/GradientText';
import AssetType from 'types/AssetType';
import Decimal from 'decimal.js';
import BN from 'bn.js';
import Balance from 'types/Balance';
import ErrorText from 'components/Error/ErrorText';
import { usePublicAccount } from 'contexts/publicAccountContext';
import { useTxStatus } from 'contexts/txStatusContext';
import { useConfig } from 'contexts/configContext';
import DotLoader from 'components/Loaders/DotLoader';
import Icon from 'components/Icon';
import classNames from 'classnames';
import { useUsdPrices } from 'contexts/usdPricesContext';
import { useStakeData } from '../StakeContext/StakeDataContext';
import { useStakeTx } from '../StakeContext/StakeTxContext';
import { MAX_DELEGATIONS } from '../StakeConstants';
import ModalNotes from './ModalNotes';

export const StakeModal = ({ hideModal }) => {
  const {
    selectedCollator,
    selectedCollatorDelegation,
    setStakeTargetBalance,
    stakeTargetBalance,
    userAvailableBalance,
  } = useStakeData();
  const {
    getMaxStakeableBalance,
    getUserCanStake,
    getUserHasSufficientFundsToStake,
    getUserWouldExceedMinStake,
    getUserWouldExceedMaxDelegations,
    stake
  } = useStakeTx();

  const config = useConfig();
  const { txStatus } = useTxStatus();
  const { externalAccount } = usePublicAccount();
  const { usdPrices } = useUsdPrices();
  const nativeTokenUsdValue = usdPrices?.[AssetType.Native(config).baseTicker];

  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const getBalanceDisplayString = (balance) => {
    if (!externalAccount) {
      return '';
    } else if (!balance) {
      return <DotLoader />;
    } else {
      return balance.toDisplayString(0);
    }
  };

  const availableBalanceNum = `${getBalanceDisplayString(
    userAvailableBalance
  )}`;
  const minStakeAmountString = selectedCollator.minStake.toDisplayString(0);
  const delegationAmountNum = selectedCollatorDelegation
    ? `${selectedCollatorDelegation.delegatedBalance.toDisplayString(0)}`
    : '0 KMA';

  const minimumStakeNum = `${minStakeAmountString}`;

  const usdValueText =
    stakeTargetBalance && nativeTokenUsdValue
      ? stakeTargetBalance.toUsd(nativeTokenUsdValue).toString()
      : '';

  const notes = [
    'Staking rewards are paid to your address every six hours.',
    'Staking rewards are not automatically compounded.',
    'The unstaking process takes seven days.'
  ];

  useEffect(() => {
    const getErrorMessage = async () => {
      if (!externalAccount) {
        setErrorMessage('Wallet not connected');
      } else if (txStatus?.isProcessing()) {
        setErrorMessage('Transaction in progress');
      } else if (getUserWouldExceedMaxDelegations()) {
        setErrorMessage(`Max number of delegations is ${MAX_DELEGATIONS}`);
      } else if (
        !stakeTargetBalance ||
        !selectedCollator ||
        !userAvailableBalance
      ) {
        setErrorMessage(null);
      } else if (!(await getUserHasSufficientFundsToStake())) {
        setErrorMessage('Insufficient balance');
      } else if (!getUserWouldExceedMinStake()) {
        setErrorMessage(`Minimum is ${minStakeAmountString}`);
      } else {
        setErrorMessage(null);
      }
    };
    getErrorMessage();
  }, [
    selectedCollator,
    selectedCollatorDelegation,
    stakeTargetBalance,
    userAvailableBalance
  ]);

  const onClickStake = async () => {
    const userCanStake = await getUserCanStake();
    if (userCanStake) {
      stake();
      hideModal();
    }
  };

  const onChangeStakeAmountInput = (value) => {
    if (value === '') {
      setStakeTargetBalance(null);
      setInputValue('');
    } else {
      try {
        const targetBalance = Balance.fromBaseUnits(
          AssetType.Native(config),
          new Decimal(value)
        );
        setInputValue(value);
        if (targetBalance.valueAtomicUnits.gte(new BN(0))) {
          setStakeTargetBalance(targetBalance);
        } else {
          setStakeTargetBalance(null);
        }
      } catch (error) {
        return;
      }
    }
  };

  const onClickMax = async () => {
    const maxStakeableBalance = await getMaxStakeableBalance();
    if (maxStakeableBalance) {
      onChangeStakeAmountInput(maxStakeableBalance.toString());
    }
  };

  return (
    <div className="w-96 py-4 bg-primary rounded-2xl font-red-hat-text">
      <div className="relative flex items-center gap-2">
        <div className="absolute -mt-4">
          <h1 className="font-semibold text-white text-base font-red-hat-text">
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
          <span>Minimum stake:</span>
          <span className="font-red-hat-mono text-left text-sm font-medium ">
            {minimumStakeNum}
          </span>
        </div>
        <div className="flex justify-between mt-2">
          <span>Available balance: </span>
          <span className="font-red-hat-mono text-left text-sm font-medium ">
            {availableBalanceNum}
          </span>
        </div>
        <div className="mt-4 px-6 h-24 flex flex-wrap items-center rounded-xl bg-white bg-opacity-5">
          <Icon className="mr-3 w-7" name="calamari" />
          <div className="flex flex-row items-center">
            <div className="flex flex-col items-center">
              <input
                className="font-red-hat-mono text-xl bg-transparent pl-1 flex-grow h-8 outline-none dark:text-white"
                placeholder="Amount"
                onChange={(e) => onChangeStakeAmountInput(e.target.value)}
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
      <ErrorText errorMessage={errorMessage} />
      <div className="mt-6 w-full">
        <Button
          className={ classNames('font-red-hat-text text-base w-full btn-primary', { 'filter brightness-50': !inputValue }) }
          onClick={onClickStake}
          disabled={!inputValue}>
          Stake
        </Button>
      </div>
      <ModalNotes notes={notes} />
    </div>
  );
};

export default StakeModal;
