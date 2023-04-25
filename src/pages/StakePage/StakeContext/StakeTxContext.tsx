// @ts-nocheck
import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useSubstrate } from 'contexts/substrateContext';
import { usePublicAccount } from 'contexts/publicAccountContext';
import Balance from 'types/Balance';
import AssetType from 'types/AssetType';
import BN from 'bn.js';
import TxStatus from 'types/TxStatus';
import extrinsicWasSentByUser from 'utils/api/ExtrinsicWasSendByUser';
import { useTxStatus } from 'contexts/txStatusContext';
import { useConfig } from 'contexts/configContext';
import { BASE_MIN_DELEGATION, MAX_DELEGATIONS } from '../StakeConstants';
import { useStakeData } from './StakeDataContext';


const StakeTxContext = createContext();

export const StakeTxContextProvider = (props) => {
  const config = useConfig();
  const { api } = useSubstrate();
  const { setTxStatus, txStatus } = useTxStatus();
  const { externalAccount, externalAccountSigner } = usePublicAccount();
  const {
    userDelegations,
    userAvailableBalance,
    stakeTargetBalance,
    selectedCollator,
    selectedCollatorDelegation,
    selectedUnstakeRequest,
    unstakeTargetBalance,
  } = useStakeData();
  const address =  externalAccount?.address;

  // Builds a stake transaction for an address that is not currently delegating to the selected collator
  const buildInitialStakeTx = () => {
    const TOTAL_DELEGATIONS_SAFETY_MARGIN = 5;
    return api.tx.parachainStaking.delegate(
      selectedCollator.address,
      stakeTargetBalance?.valueAtomicUnits.toString() || new BN(0),
      selectedCollator.delegationCount + TOTAL_DELEGATIONS_SAFETY_MARGIN,
      userDelegations.length + TOTAL_DELEGATIONS_SAFETY_MARGIN
    );
  };

  // Builds a stake transaction for an address that is already delegating to the selected collator
  const buildStakeMoreTx = () => {
    return api.tx.parachainStaking.delegatorBondMore(
      selectedCollator.address,
      stakeTargetBalance?.valueAtomicUnits.toString() || new BN(0),
    );
  };

  // Builds a stake transaction
  const buildStakeTx = () => {
    if (selectedCollatorDelegation) {
      return buildStakeMoreTx();
    }
    return buildInitialStakeTx();
  };


  // Returns true if unstaking would fall below the minimum allowed delegation amount
  const getUnstakeWouldBeBelowDelegationThreshold = () => {
    if (!unstakeTargetBalance) {
      return null;
    }
    const delegationThreshold = Balance.fromBaseUnits(
      AssetType.Native(config), BASE_MIN_DELEGATION
    );
    const balanceAfterUndelegation = selectedCollatorDelegation.delegatedBalance.sub(
      unstakeTargetBalance
    );
    return balanceAfterUndelegation.lt(delegationThreshold);
  };

  // Builds a transaction to schedule unstaking
  const buildUnstakeTx = () => {
    if (getUnstakeWouldBeBelowDelegationThreshold()) {
      return buildRevokeDelegationTx();
    }
    return buildReduceStakeTx();
  };

  // Builds a transaction to cancel a pending unstak request
  const buildCancelUnstakeTx = () => {
    return api.tx.parachainStaking.cancelDelegationRequest(
      selectedUnstakeRequest.collator.address
    );
  };

  // Builds a transaction to schedule partial unstaking, i.e. a non-total reduction of staked balance
  const buildReduceStakeTx = () => {
    return api.tx.parachainStaking.scheduleDelegatorBondLess(
      selectedCollator.address,
      unstakeTargetBalance.valueAtomicUnits.toString() || new BN(0)
    );
  };

  // Builds a transaction to schedule total unstaking of entire staked balance
  const buildRevokeDelegationTx = () => {
    return api.tx.parachainStaking.scheduleRevokeDelegation(selectedCollator.address);
  };

  // Builds a transaction to execute a scheduled unstake request and return tokens to fully liquid state
  const buildWithdrawTx = () => {
    return api.tx.parachainStaking.executeDelegationRequest(
      address,
      selectedUnstakeRequest.collator.address
    );
  };

  // Estimates fees for the given transaction
  const getFeeEstimate = async (tx) => {
    const info = await tx.paymentInfo(externalAccountSigner);
    return Balance.Native(config, new BN(info.partialFee.toString()));
  };

  // Returns amount of the user's free balance that they are unable to stake
  // i.e. existential deposit plus estimated fee for a desired transaction
  const getReservedBalance = async (tx) => {
    const feeEstimate = await getFeeEstimate(tx);
    const existentialDeposit = Balance.Native(
      config,
      AssetType.Native(config).existentialDeposit
    );
    return feeEstimate.add(existentialDeposit);
  };

  // Handles the result of a transaction
  const handleTxRes = async ({ status, events }) => {
    if (status.isInBlock) {
      for (const event of events) {
        if (api.events.system.ExtrinsicFailed.is(event.event)) {
          const error = event.event.data[0];
          if (error.isModule) {
            const decoded = api.registry.findMetaError(error.asModule.toU8a());
            const { docs, method, section } = decoded;
            console.error(`${section}.${method}: ${docs.join(' ')}`);
          } else {
            console.error(error.toString());
          }
          setTxStatus(TxStatus.failed());
          console.error('Transaction failed', event);
        } else if (api.events.system.ExtrinsicSuccess.is(event.event)) {
          try {
            const signedBlock = await api.rpc.chain.getBlock(status.asInBlock);
            const extrinsics = signedBlock.block.extrinsics;
            const extrinsic = extrinsics.find((extrinsic) =>
              extrinsicWasSentByUser(extrinsic, externalAccount, api)
            );
            const extrinsicHash = extrinsic.hash.toHex();
            setTxStatus(TxStatus.finalized(extrinsicHash, config.SUBSCAN_URL));
          } catch(error) {
            console.error(error);
          }
        }
      }
    }
  };

  // Returns the maximum balance a user is able to stake
  const getMaxStakeableBalance = async () => {
    if (!userAvailableBalance || !api) {
      return null;
    }
    const stakeTx = buildStakeTx();
    const reservedNativeTokenBalance = await getReservedBalance(stakeTx);
    const zeroBalance = Balance.Native(config, new BN(0));
    return Balance.max(
      userAvailableBalance.sub(reservedNativeTokenBalance),
      zeroBalance
    );
  };

  // Returns whether the user has sufficient funds to stake the desired amount
  const getUserHasSufficientFundsToStake = async () => {
    const maxStakeableBalance = await getMaxStakeableBalance();
    return stakeTargetBalance.lte(maxStakeableBalance);
  };

  // Returns whether the user's desired stake amount is sufficient to earn rewards
  const getUserWouldExceedMinStake = () => {
    if (selectedCollatorDelegation) {
      return true;
    }
    return stakeTargetBalance.gte(selectedCollator.minStake);
  };

  // Returns whether desired stake amount is over zero
  const getUserStakeAmountOverZero = () => {
    return !stakeTargetBalance.eq(Balance.Native(config, new BN(0)));
  };

  // Returns whether the user's desired stake transaction would exceed the
  // maximum allowed number of delegations
  const getUserWouldExceedMaxDelegations = () => {
    return userDelegations.length === MAX_DELEGATIONS;
  };

  // Returns whether the user is able to execute the desired stake transaction
  const getUserCanStake = async () => {
    if (!stakeTargetBalance || !userAvailableBalance || !api || txStatus?.isProcessing()) {
      return false;
    } else if (getUserWouldExceedMaxDelegations()) {
      return false;
    } else if (!(await getUserHasSufficientFundsToStake())) {
      return false;
    } else if (!getUserStakeAmountOverZero()) {
      return false;
    } else {
      return getUserWouldExceedMinStake();
    }
  };

  // Returns whether the user is able to pay the fee to unstake
  const getUserHasSufficientFreeFundsToUnstake = async () => {
    const unstakeTx = buildUnstakeTx();
    const reservedNativeTokenBalance = await getReservedBalance(unstakeTx);
    return userAvailableBalance.gte(reservedNativeTokenBalance);
  };

  // Returns whether the user's desired unstake amount is over zero
  const getUnstakeAmountIsOverZero = () => {
    return unstakeTargetBalance.gt(Balance.Native(config, new BN(0)));
  };

  // Returns where the user has sufficient staked funds to unstake the desired amount
  const getUserHasSufficientStakedFundsToUnstake = () => {
    return unstakeTargetBalance.lte(selectedCollatorDelegation.delegatedBalance);
  };

  // Returns whether the user is able to execute the desired unstake transaction
  const getUserCanUnstake = async () => {
    if (!unstakeTargetBalance || !userAvailableBalance || !api || txStatus?.isProcessing()) {
      return false;
    } else if (!getUnstakeAmountIsOverZero()) {
      return false;
    } else if (!(await getUserHasSufficientFreeFundsToUnstake())) {
      return false;
    } else {
      return getUserHasSufficientStakedFundsToUnstake();
    }
  };

  // Returns whether the user is able to pay the fee to cancel a scheduled unstake
  const getUserHasSufficientFundsToCancelUnstake = async () => {
    const cancelUnstakeTx = buildCancelUnstakeTx();
    const reservedNativeTokenBalance = await getReservedBalance(cancelUnstakeTx);
    return userAvailableBalance.gte(reservedNativeTokenBalance);
  };

  // Returns whether the user is able to execute the desired cancel shceduled unstake transaction
  const getUserCanCancelUnstake = async () => {
    if (!userAvailableBalance || !api || txStatus?.isProcessing()) {
      return false;
    }
    const sufficientFunds = await getUserHasSufficientFundsToCancelUnstake();
    return sufficientFunds;
  };

  // Returns whether the user is able to pay the fee to execute a scheduled unstake
  const getUserHasSufficientFundsToWithdraw = async () => {
    const withdrawTx = buildWithdrawTx();
    const reservedNativeTokenBalance = await getReservedBalance(withdrawTx);
    return userAvailableBalance.gte(reservedNativeTokenBalance);
  };

  // Returns whether the user is able to execute the desired transaction to execute a scheduled unstake
  const getUserCanWithdraw = async () => {
    if (!userAvailableBalance || !api || txStatus?.isProcessing()) {
      return false;
    }
    const sufficientFunds = await getUserHasSufficientFundsToWithdraw();
    return sufficientFunds;
  };

  // Publishes a transactioin
  const publishTx = async (tx) => {
    // retrieve sender's next index/nonce, taking txs in the pool into account
    const nonce = await api.rpc.system.accountNextIndex(address);
    await tx.signAndSend(externalAccountSigner, { nonce }, handleTxRes);
  };

  // Attempts to execute the user's desired stake transaction if it is valid
  const stake = async () => {
    const userCanStake = await getUserCanStake();
    if (!userCanStake) {
      return;
    }
    const tx = buildStakeTx();
    await publishTx(tx);
    setTxStatus(TxStatus.processing('Stake transaction sent'));
  };

  // Attempts to execute the user's desired unstake transaction if it is valid
  const unstake = async () => {
    const userCanUnstake = await getUserCanUnstake();
    if (!userCanUnstake) {
      return;
    }
    const tx = buildUnstakeTx();
    await publishTx(tx);
    setTxStatus(TxStatus.processing('Unstake transaction sent'));
  };

  // Attempts to execute the user's desired withdraw transaction if it is valid
  const withdraw = async () => {
    const userCanWithdraw = await getUserCanWithdraw();
    if (!userCanWithdraw) {
      return;
    }
    const tx = buildWithdrawTx();
    await publishTx(tx);
    setTxStatus(TxStatus.processing('Withdraw transaction sent'));
  };

  // Attempts to execute the user's desired cancel unstake transaction if it is valid
  const cancelUnstake = async () => {
    const userCanCancelUnstake = await getUserCanCancelUnstake();
    if (!userCanCancelUnstake) {
      return;
    }
    const tx = buildCancelUnstakeTx();
    await publishTx(tx);
    setTxStatus(TxStatus.processing('Cancel transaction sent'));
  };

  const value = {
    getMaxStakeableBalance,
    getUserHasSufficientFundsToStake,
    getUserWouldExceedMaxDelegations,
    getUserWouldExceedMinStake,
    getUserStakeAmountOverZero,
    getUserCanStake,
    getUnstakeAmountIsOverZero,
    getUserHasSufficientFreeFundsToUnstake,
    getUserHasSufficientStakedFundsToUnstake,
    getUserCanUnstake,
    getUnstakeWouldBeBelowDelegationThreshold,
    getUserHasSufficientFundsToCancelUnstake,
    getUserCanCancelUnstake,
    getUserHasSufficientFundsToWithdraw,
    getUserCanWithdraw,
    stake,
    unstake,
    withdraw,
    cancelUnstake
  };


  return (
    <StakeTxContext.Provider value={value}>
      {props.children}
    </StakeTxContext.Provider>
  );
};

StakeTxContextProvider.propTypes = {
  children: PropTypes.any
};

export const useStakeTx = () => ({
  ...useContext(StakeTxContext)
});
