// @ts-nocheck
import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useReducer } from 'react';
import { useSubstrate } from 'contexts/substrateContext';
import Delegation from 'types/Delegation';
import Collator from 'types/Collator';
import { usePublicAccount } from 'contexts/publicAccountContext';
import Balance from 'types/Balance';
import AssetType from 'types/AssetType';
import BN from 'bn.js';
import UnstakeRequest from 'types/UnstakeRequest';
import Decimal from 'decimal.js';
import { useTxStatus } from 'contexts/txStatusContext';
import { useConfig } from 'contexts/configContext';
import shuffle from 'utils/general/shuffle';
import { BASE_MIN_DELEGATION } from '../StakeConstants';
import { STAKE_INIT_STATE, stakeReducer } from './stakeReducer';
import STAKE_ACTIONS from './stakeActions';
import {
  getCollatorComission,
  getAnnualInflation,
  getCollatorsAreActive,
  getCollatorCandidateInfo,
  getBlocksPreviousRound,
  getUserTotalRecentRewards
} from './stakeQueries';

const StakeDataContext = createContext();

export const StakeDataContextProvider = (props) => {
  const config = useConfig();
  const { api } = useSubstrate();
  const { txStatus, txStatusRef } = useTxStatus();
  const { externalAccount } = usePublicAccount();
  const address =  externalAccount?.address;
  const initState = { ...STAKE_INIT_STATE };
  const [state, dispatch] = useReducer(stakeReducer, initState);
  const {
    userDelegations,
    collatorCandidates,
    userTotalRecentRewards
  } = state;

  useEffect(() => {
    // Sets the user's total and available balances
    const setUserBalance = () => {
      if (!api || !address) {
        return;
      }
      api.query.system.account(address, (account) => {
        const userTotalBalance = Balance.Native(config, new BN(account.data.free.toString()));
        const frozenBalance = Balance.Native(config, new BN(account.data.miscFrozen.toString()));
        if (txStatusRef.current?.isProcessing()) {
          return;
        }
        dispatch({
          type: STAKE_ACTIONS.SET_USER_BALANCE,
          userTotalBalance,
          userAvailableBalance: userTotalBalance.sub(frozenBalance)
        });
      })
        .then((_unsub) => unsub = _unsub)
        .catch(console.error);
    };
    setUserBalance();
    let unsub;
    return () => unsub && unsub();
  }, [api, address, txStatus]);

  // get collator info
  useEffect(() => {
    // Adjusts estimated APY to deduct collator commission
    const deductCollatorCommission = (apy, collatorComission) => {
      const apyLessComission = (new Decimal(1)).sub(collatorComission).mul(apy);
      return apyLessComission;
    };

    // Sets the estimated APY for a single collator
    const setSingleCollatorApy = (
      collator,
      annualRewardsPerCollatorAtomicUnits,
      marginalDelegationAtomicUnits,
      collatorComission,
      collatorExpectedBlocksPerRound
    ) => {
      const collatorDelegationValueAtomicUnits = new Decimal(
        collator.balanceEffectiveBonded.valueAtomicUnits.toString()
      ).add(marginalDelegationAtomicUnits);

      const marginalDelegationProportion = marginalDelegationAtomicUnits.div(
        collatorDelegationValueAtomicUnits
      );

      const marginalRewardAtomicUnits = annualRewardsPerCollatorAtomicUnits.mul(
        marginalDelegationProportion
      );

      const performanceAdjustmentFactor = collator.blocksPreviousRound / collatorExpectedBlocksPerRound;


      Decimal.set({ rounding: 1 });
      let apy = marginalRewardAtomicUnits
        .div(marginalDelegationAtomicUnits)
        .mul(new Decimal(performanceAdjustmentFactor))
        .mul(new Decimal(100))
        .round();
      apy = deductCollatorCommission(apy, collatorComission);
      collator.setApy(apy.round());
    };

    // Sets the estimated APY for all collators
    const setCollatorsApys = async (collatorCandidates, collatorComission, round) => {
      const annualInflation = await getAnnualInflation(api, config);
      const totalActiveCollators = new BN(
        collatorCandidates.filter(collator => collator.isActive).length
      );
      if (totalActiveCollators.eq(new BN(0))) {
        return;
      }
      const annualRewardsPerCollator = annualInflation.div(totalActiveCollators);
      const annualRewardsPerCollatorAtomicUnits = new Decimal(
        annualRewardsPerCollator.valueAtomicUnits.toString()
      );
      const marginalDelegation = Balance.fromBaseUnits(AssetType.Native(config), 5000);
      const marginalDelegationAtomicUnits = new Decimal(
        marginalDelegation.valueAtomicUnits.toString()
      );

      const collatorExpectedBlocksPerRound = round.length.toNumber() / collatorCandidates.length;

      collatorCandidates.forEach(collator => {
        setSingleCollatorApy(
          collator,
          annualRewardsPerCollatorAtomicUnits,
          marginalDelegationAtomicUnits,
          collatorComission,
          collatorExpectedBlocksPerRound
        );
      });
    };

    // Gets the minimum stake required to earn staking rewards for some collator
    const getMinStake = (lowestTopDelegationAmount, delegationCount) => {
      const defaultMinStake = Balance.fromBaseUnits(
        AssetType.Native(config),
        BASE_MIN_DELEGATION
      );
      if (delegationCount < 100) {
        return defaultMinStake;
      }
      const one = Balance.fromBaseUnits(AssetType.Native(config), new BN(1));
      return lowestTopDelegationAmount.add(one);
    };

    // Sets collator information including address, APY estimate, total delegation information etc.
    const setCollatorCandidates = async () => {
      if (!api || collatorCandidates.length) {
        return;
      }
      try {
        const collatorAddresses = (await api.query.parachainStaking.candidatePool())
          .map(candidateRaw => candidateRaw.owner.toString());
        const collatorsAreActive = await getCollatorsAreActive(api, collatorAddresses);
        const round = await api.query.parachainStaking.round();
        const blocksPreviousRound = await getBlocksPreviousRound(api, round, collatorAddresses);
        const collatorComission = await getCollatorComission(api);
        const collatorCandidatesInfo = await getCollatorCandidateInfo(
          api, config, collatorAddresses
        );
        const collatorCandidates = [];
        for (let i = 0; i < collatorsAreActive.length; i++) {
          const collator = new Collator(
            collatorAddresses[i],
            collatorCandidatesInfo[i].balanceSelfBonded,
            collatorCandidatesInfo[i].balanceEffectiveBonded,
            collatorCandidatesInfo[i].delegationCount,
            getMinStake(
              collatorCandidatesInfo[i].lowestTopDelegationAmount,
              collatorCandidatesInfo[i].delegationCount
            ),
            collatorsAreActive[i],
            blocksPreviousRound[i]
          );
          collatorCandidates.push(collator);
        }
        await setCollatorsApys(collatorCandidates, collatorComission, round);
        if (txStatusRef.current?.isProcessing()) {
          return;
        }
        shuffle(collatorCandidates);
        dispatch({
          type: STAKE_ACTIONS.SET_COLLATOR_CANDIDATES,
          collatorCandidates,
        });
      } catch(e) {
        console.error(e);
      }
    };
    setCollatorCandidates();
  }, [api, txStatus]);

  useEffect(() => {
    // Get's the user's current rank among a collator's top delegations
    const getCurrentDelegationRank = (topDelegations) => {
      const index = topDelegations.map(d => d.delegatorAddress).indexOf(address);
      return index === -1 ? 101 : index + 1;
    };

    // Sets the rank for all of the user's delegations by collator
    // i.e. 22 in the user is the 22nd largest delegator for some collator
    const setDelegationRanks = async (userDelegations) => {
      for (const userDelegation of userDelegations) {
        const topDelegations = (await api.query.parachainStaking.topDelegations(
          userDelegation.collator.address
        )).value.delegations.map(raw => {
          return new Delegation(
            raw.owner.toString(),
            userDelegation.collator.address,
            Balance.Native(config, new BN(raw.amount.toString()))
          );
        });
        const currentDelegationRank = getCurrentDelegationRank(topDelegations);
        userDelegation.setRank(currentDelegationRank);
      }
    };

    // Gets the user's total staked balances across all delegations / collators
    const getUserTotalStakedBalance = (userDelegations) => {
      return userDelegations.reduce(
        (partialSum, delegation) => {
          return partialSum.add(delegation.delegatedBalance);
        },
        Balance.Native(config, new BN(0)));
    };

    // Sets the user's delegation information, including amount and collator address
    const setDelegatorState = () => {
      if (!api || !address || !collatorCandidates.length) {
        return;
      }
      api.query.parachainStaking.delegatorState(address, async (delegatorState) => {
        const delegationsRaw = delegatorState.isSome
          ? delegatorState.value.delegations
          : [];
        const userDelegations = delegationsRaw.map(delegationRaw => {
          const delegatedBalance = Balance.Native(config, new BN(delegationRaw.amount.toString()));
          return new Delegation(address, delegationRaw.owner.toString(), delegatedBalance);
        });
        await setDelegationRanks(userDelegations);
        const userStakedBalance = getUserTotalStakedBalance(userDelegations);
        if (txStatusRef.current?.isProcessing()) {
          return;
        }
        dispatch({
          type: STAKE_ACTIONS.SET_USER_DELEGATIONS,
          userStakedBalance,
          userDelegations
        });
      })
        .then(_unsub => unsub = _unsub)
        .catch(console.error);
    };
    let unsub;
    setDelegatorState();
    return () => unsub && unsub();
  }, [api, address, txStatus, collatorCandidates]);

  useEffect(() => {
    // Sets the user's pending unstake requests
    const setUnstakeRequests = async () => {
      if (!api || !userDelegations.length) {
        return;
      }
      const round = await api.query.parachainStaking.round();
      const currentBlockNumber = await api.query.system.number();
      const collatorAddresses = userDelegations.map(delegation => delegation.collator.address);
      api.query.parachainStaking.delegationScheduledRequests.multi(collatorAddresses, (requests) => {
        const unstakeRequests = requests
          .map((requestsByCollator, i) => {
            const request = requestsByCollator.find(r => r.delegator.toString() === address);
            return {request, collatorAddress: collatorAddresses[i]};
          })
          .filter(({request}) => !!request)
          .filter((({request}) => request.delegator.toString() === address))
          .filter(({request}) => request.action.isDecrease || request.action.isRevoke)
          .map(({request, collatorAddress}) => {
            const amount = request.action.isDecrease
              ?  new BN(request.action.asDecrease.toString())
              :  new BN(request.action.asRevoke.toString());
            return new UnstakeRequest(
              collatorAddress,
              Balance.Native(config, new BN(amount)),
              new BN(request.whenExecutable.toString()),
              round,
              currentBlockNumber
            );
          });
        if (txStatusRef.current?.isProcessing()) {
          return;
        }
        dispatch({
          type: STAKE_ACTIONS.SET_UNSTAKE_REQUESTS,
          unstakeRequests,
        });
      }).then(_unsub => unsub = _unsub)
        .catch(console.error);
    };
    let unsub;
    setUnstakeRequests();
    return unsub && unsub();
  }, [api, address, userDelegations, txStatus]);


  useEffect(() => {
    const setUserTotalRecentRewards = async () => {
      if (!api || !address || !config || userTotalRecentRewards) {
        return;
      }
      try {
        const {
          userTotalRecentRewards,
          secondsSinceReward
        } = await getUserTotalRecentRewards(api, config, address);
        dispatch({
          type: STAKE_ACTIONS.SET_USER_TOTAL_RECENT_REWARDS,
          userTotalRecentRewards,
          secondsSinceReward
        });
      } catch(error) {
        console.error(error);
      }
    };
    setUserTotalRecentRewards();
  }, [api, config, address]);


  // Sets the balance that the user intends to stake
  const setStakeTargetBalance = (stakeTargetBalance) => {
    dispatch({
      type: STAKE_ACTIONS.SET_STAKE_TARGET_BALANCE,
      stakeTargetBalance,
    });
  };

  // Sets the balance that the user intends to unstake
  const setUnstakeTargetBalance = (unstakeTargetBalance) => {
    dispatch({
      type: STAKE_ACTIONS.SET_UNSTAKE_TARGET_BALANCE,
      unstakeTargetBalance,
    });
  };

  // Sets the collator the user intends to stake or unstake from
  const setSelectedCollator = (selectedCollator) => {
    dispatch({
      type: STAKE_ACTIONS.SET_SELECTED_COLLATOR,
      selectedCollator,
    });
  };

  // Sets the collator the user intends to cancel or execute
  const setSelectedUnstakeRequest = (selectedUnstakeRequest) => {
    dispatch({
      type: STAKE_ACTIONS.SET_SELECTED_UNSTAKE_REQUEST,
      selectedUnstakeRequest,
    });
  };

  const value = {
    ...state,
    setStakeTargetBalance,
    setUnstakeTargetBalance,
    setSelectedUnstakeRequest,
    setSelectedCollator
  };

  return (
    <StakeDataContext.Provider value={value}>
      {props.children}
    </StakeDataContext.Provider>
  );
};

StakeDataContextProvider.propTypes = {
  children: PropTypes.any
};

export const useStakeData = () => ({
  ...useContext(StakeDataContext)
});
