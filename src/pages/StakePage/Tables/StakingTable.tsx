// @ts-nocheck
import React from 'react';
import { ColDef } from 'ag-grid-community';
import { useModal } from 'hooks';
import Button from 'components/Button';
import SortableTable from 'components/SortableTable';
import { usePublicAccount } from 'contexts/publicAccountContext';
import Delegation from 'types/Delegation';
import getTableHeight from 'utils/ui/getTableHeight';
import { useSubstrate } from 'contexts/substrateContext';
import Collator from 'types/Collator';
import { useConfig } from 'contexts/configContext';
import { StakeModal } from '../Modals';
import { useStakeData } from '../StakeContext/StakeDataContext';
import { UnstakeModal } from '../Modals/UnstakeModal';
import StakeErrorDisplay from '../StakeErrorDisplay';
import CollatorDisplayCell from './CollatorDisplayCell';

const NothingStakedDisplay = () => {
  const { externalAccount } = usePublicAccount();
  let primaryText = '';
  let secondaryText = '';
  if (!externalAccount) {
    primaryText = 'Please connect your wallet';
    secondaryText =
      'polkadot.js, SubWallet, or Talisman wallet must be connected to see your balance and rewards';
  } else {
    primaryText = 'You are not currently staking KMA';
    secondaryText = 'Select a collator below to begin staking';
  }

  return (
    <div className="mt-4 w-full p-6 shadow-2xl bg-secondary rounded-lg text-white text-opacity-80 text-sm">
      <h1 className="font-semibold font-red-hat-text">{primaryText}</h1>
      <h1 className="mt-4 font-semibold font-red-hat-text">
        {secondaryText}
      </h1>
    </div>
  );
};

const StakingTable = () => {
  const config = useConfig();
  const { apiState } = useSubstrate();
  const {
    collatorCandidates,
    setSelectedCollator,
    userDelegations,
    unstakeRequests
  } = useStakeData();
  const nodeIsDisconnected =
    apiState === 'ERROR' || apiState === 'DISCONNECTED';

  const {
    ModalWrapper: StakeModalWrapper,
    showModal: showStakeModal,
    hideModal: hideStakeModal
  } = useModal({ closeCallback: () => setSelectedCollator(null) });
  const {
    ModalWrapper: UnstakeModalWrapper,
    showModal: showUnstakeModal,
    hideModal: hideUnstakeModal
  } = useModal({ closeCallback: () => setSelectedCollator(null) });

  const getRankString = (rank) => {
    if (rank > 100) {
      return '⚠️ Not in top 100';
    }
    return `${rank} / 100`;
  };

  const getDelegationCollator = (delegation) => {
    let collator = collatorCandidates.find(
      (candidate) => candidate.address === delegation.collator.address
    );
    if (!collator) {
      collator = Collator.Former(config, delegation.collator.address);
    }
    return collator;
  };

  const getIsEarningString = (delegation) => {
    const collator = getDelegationCollator(delegation);
    if (!collator.isFunctionallyActive) {
      return '⚠️ Collator inactive';
    } else if (delegation.rank > 100) {
      return '⚠️ Stake too small';
    } else {
      return 'Active';
    }
  };

  const getApyEstimateString = (collator) => {
    if (!collator) {
      return 0;
    } else if (!collator.apy) {
      return '-';
    } else {
      return `${collator.apy.toNumber().toLocaleString(undefined)} %`;
    }
  };

  const rowData = userDelegations.map((delegation: Delegation) => {
    return {
      Collator: delegation.collator,
      Amount: delegation.delegatedBalance,
      Status: getIsEarningString(delegation),
      Rank: delegation.rank,
      'APY Estimate': collatorCandidates.find(
        (collator) => collator.address === delegation.collator.address
      ),
      data: delegation
    };
  });

  const amountTooltip = 'Your balance staked with this collator';
  const statusTooltip = 'Whether this delegation is earning yield';
  const rankTooltip =
    'Your rank among the top 100 delegations to this collator';
  const apyEstimateTooltip =
    'APY estimates are based on collator performance last round';

  const columnDefs: ColDef[] = [
    {
      field: 'collator',
      sortable: false,
      cellRenderer: (params: any) => {
        return <CollatorDisplayCell collator={params.data.Collator} />;
      },
      width: 270,
      suppressMovable: true
    },
    {
      field: 'Amount',
      unSortIcon: true,
      width: 195,
      suppressMovable: true,
      headerTooltip: amountTooltip,
      cellRenderer: (params: any) => {
        return params.data['Amount'].toDisplayString(0);
      },
      comparator: (valueA, valueB, nodeA, nodeB, isDescending) =>
        valueA.gt(valueB) ? 1 : -1
    },
    {
      field: 'Status',
      unSortIcon: true,
      headerTooltip: statusTooltip,
      width: 195,
      suppressMovable: true
    },
    {
      field: 'APY Estimate',
      width: 195,
      suppressMovable: true,
      unSortIcon: true,
      headerTooltip: apyEstimateTooltip,
      cellRenderer: (params: any) => {
        return getApyEstimateString(params.data['APY Estimate']);
      },
      comparator: (valueA, valueB, nodeA, nodeB, isDescending) =>
        valueA.apy.toNumber() > valueB.apy.toNumber() ? 1 : -1
    },
    {
      field: 'Rank',
      unSortIcon: true,
      headerTooltip: rankTooltip,
      width: 195,
      suppressMovable: true,
      cellRenderer: (params: any) => {
        return getRankString(params.data['Rank']);
      },
      comparator: (valueA, valueB, nodeA, nodeB, isDescending) =>
        valueA < valueB ? 1 : -1
    },
    {
      field: '',
      sortable: false,
      width: 215,
      suppressMovable: true,
      cellRenderer: (params: any) => {
        const delegation = params.data.data;
        const unstakeRequest = unstakeRequests.find(
          (request) => request.collator.address === delegation.collator.address
        );
        const collator = getDelegationCollator(delegation);
        const onClickStake = () => {
          setSelectedCollator(collator);
          showStakeModal();
        };
        const onClickUnstake = () => {
          setSelectedCollator(collator);
          showUnstakeModal();
        };
        return (
          <div className="flex pr-2 justify-end w-full gap-3">
            {!unstakeRequest ? (
              <>
                <Button
                  className="px-6 btn-secondary flex items-center justify-center h-10"
                  onClick={onClickStake}
                >
                  Stake
                </Button>
                <Button
                  className="btn-thirdry flex items-center justify-center h-10 text-bg-thirdry"
                  onClick={onClickUnstake}
                >
                  Unstake
                </Button>
              </>
            ) : (
              'Unstaking in progress'
            )}
          </div>
        );
      }
    }
  ];

  let mainComponent = <NothingStakedDisplay />;
  if (nodeIsDisconnected) {
    mainComponent = <StakeErrorDisplay />;
  } else if (userDelegations.length) {
    mainComponent = (
      <SortableTable
        height={getTableHeight(rowData.length, 5)}
        columnDefs={columnDefs}
        rowData={rowData}
      />
    );
  }

  return (
    <>
      <div className="mt-10 mx-auto sortable-table-wrapper">
        <h1 className="text-base font-semibold text-white font-red-hat-text">
          Staking
        </h1>
        <div className="w-full mt-4">{mainComponent}</div>
        <StakeModalWrapper>
          <StakeModal hideModal={hideStakeModal} />
        </StakeModalWrapper>
        <UnstakeModalWrapper>
          <UnstakeModal hideModal={hideUnstakeModal} />
        </UnstakeModalWrapper>
      </div>
    </>
  );
};

export default StakingTable;
