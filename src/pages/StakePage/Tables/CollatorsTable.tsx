// @ts-nocheck
import React, { useState } from 'react';
import { ColDef } from 'ag-grid-community';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useModal } from 'hooks';
import Button from 'components/Button';
import SortableTable from 'components/SortableTable';
import getTableHeight from 'utils/ui/getTableHeight';
import { useSubstrate } from 'contexts/substrateContext';
import { StakeModal } from '../Modals';
import { useStakeData } from '../StakeContext/StakeDataContext';
import { UnstakeModal } from '../Modals/UnstakeModal';
import StakeErrorDisplay from '../StakeErrorDisplay';
import CollatorDisplayCell from './CollatorDisplayCell';

const collatorStatusOptions = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
];

const dropdownStyles = () => {
  return {
    indicatorSeparator: () => null,
    control: (provided) => ({
      ...provided,
      borderStyle: 'none',
      borderWidth: '0px',
      borderRadius: '8px',
      paddingBottom: '0.5rem',
      paddingTop: '0.5rem',
      boxShadow: '0 0 #0000',
      backgroundColor: 'transparent',
      width: '100%',
      cursor: 'pointer',
      color: 'white'
    }),
    input: (provided) => ({
      ...provided,
      fontSize: '1.125rem',
      paddingLeft: '0.6rem',
      minWidth: '0%',
      maxWidth: '100%',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      cursor: 'pointer'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'rgb(255,255,255)'
    })
  };
};

const CollatorsTable = () => {
  const { apiState } = useSubstrate();
  const {
    collatorCandidates,
    setSelectedCollator,
    unstakeRequests,
    userDelegations
  } = useStakeData();
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

  const nodeIsDisconnected =
    apiState === 'ERROR' || apiState === 'DISCONNECTED';

  const [filterText, setFilterText] = useState('');
  const [filterOption, setFilterOption] = useState(collatorStatusOptions[1]);

  const getApyEstimateString = (collator) => {
    if (!collator.apy) {
      return '-';
    } else {
      return `${collator.apy.toNumber().toLocaleString(undefined)} %`;
    }
  };

  const rowData = collatorCandidates
    .filter((collator) => {
      if (!filterText) {
        return true;
      }
      return (
        collator.name.includes(filterText) ||
        collator.address.startsWith(filterText)
      );
    })
    .filter((collator) => {
      if (filterOption.value === 'all') {
        return true;
      }
      if (filterOption.value === 'active') {
        return collator.isFunctionallyActive;
      }
      return !collator.isFunctionallyActive;
    })
    .map((collator) => {
      return {
        Collator: collator,
        'Amount Staked': collator.balanceEffectiveBonded,
        'Minimum Stake': collator.minStake,
        Delegations: collator.delegationCount,
        Status: collator.isFunctionallyActive ? 'Active' : '⚠️ Inactive',
        'APY Estimate': collator,
        data: collator
      };
    });

  const amountStakedTooltip =
    'Total balance staked for this collator across all delegations';
  const minStakeTooltip =
    'Minimum stake required to earn staking rewards for this collator';
  const delegationTooltip =
    'Total stakers delegating to this node; only the top 100 stakers earn rewards';
  const apyEstimateTooltip =
    'APY estimates are based on collator performance last round';

  const columnDefs: ColDef[] = [
    {
      field: 'Collator',
      sortable: false,
      width: 270,
      cellRenderer: (params: any) => {
        return <CollatorDisplayCell collator={params.data.Collator} />;
      },
      suppressMovable: true
    },
    {
      field: 'Amount Staked',
      width: 195,
      unSortIcon: true,
      headerTooltip: amountStakedTooltip,
      suppressMovable: true,
      cellRenderer: (params: any) => {
        return params.data['Amount Staked'].toDisplayString(0);
      },
      comparator: (valueA, valueB, nodeA, nodeB, isDescending) =>
        valueA.gt(valueB) ? 1 : -1
    },
    {
      field: 'Minimum Stake',
      width: 195,
      unSortIcon: true,
      headerTooltip: minStakeTooltip,
      suppressMovable: true,
      cellRenderer: (params: any) => {
        return params.data['Minimum Stake'].toDisplayString(0);
      },
      comparator: (valueA, valueB, nodeA, nodeB, isDescending) =>
        valueA.gt(valueB) ? 1 : -1
    },
    {
      field: 'APY Estimate',
      width: 195,
      unSortIcon: true,
      headerTooltip: apyEstimateTooltip,
      suppressMovable: true,
      cellRenderer: (params: any) => {
        return getApyEstimateString(params.data['APY Estimate']);
      },
      comparator: (valueA, valueB, nodeA, nodeB, isDescending) =>
        valueA.apy.toNumber() > valueB.apy.toNumber() ? 1 : -1
    },
    {
      field: 'Delegations',
      unSortIcon: true,
      headerTooltip: delegationTooltip,
      width: 195,
      suppressMovable: true,
      cellRenderer: (params: any) => {
        return `${params.data['Delegations']} / 100`;
      },
      comparator: (valueA, valueB, nodeA, nodeB, isDescending) =>
        valueA > valueB ? 1 : -1
    },
    {
      field: '',
      sortable: false,
      suppressMovable: true,
      width: 220,
      cellRenderer: (params: any) => {
        const collator = params.data.data;
        const unstakeRequest = unstakeRequests.find(
          (request) => request.collator.address === collator.address
        );
        const onClickStake = () => {
          setSelectedCollator(collator);
          showStakeModal();
        };
        const onClickUnstake = () => {
          setSelectedCollator(collator);
          showUnstakeModal();
        };
        const delegation = userDelegations.find((delegation) => {
          return delegation.collator.address === collator.address;
        });
        return (
          <div className="flex pr-2 justify-end w-full gap-3">
            {!unstakeRequest && (
              <Button
                className="px-6 btn-secondary flex items-center justify-start h-10"
                onClick={onClickStake}>
                Stake
              </Button>
            )}
            {delegation && !unstakeRequest && (
              <Button
                className="btn-thirdry flex items-center justify-center h-10 text-bg-thirdry"
                onClick={onClickUnstake}>
                Unstake
              </Button>
            )}
            {unstakeRequest && 'Unstaking in progress'}
          </div>
        );
      }
    }
  ];

  const onChangeOption = (option) => {
    setFilterOption(option);
  };

  return (
    <div className="mt-10 mx-auto sortable-table-wrapper" id="collatorsTable">
      <h1 className="text-base font-semibold text-white flex items-end gap-10 font-red-hat-text">
        Collators
      </h1>
      <div className="mt-4 flex gap-5">
        <div className="p-3 pl-6 rounded-md border border-white border-opacity-20 flex items-center gap-2 text-secondary bg-secondary">
          <input
            className="bg-transparent font-red-hat-text text-sm text-thirdry outline-none"
            placeholder="Search Collators"
            onChange={(e) => setFilterText(e.target.value)}
            value={filterText}
          />
          <FontAwesomeIcon icon={faSearch} />
        </div>
        <div className="rounded-md border border-white border-opacity-20 flex items-center gap-2">
          <Select
            className="w-52 cursor-pointer bg-secondary rounded-md font-red-hat-text text-sm"
            options={collatorStatusOptions}
            styles={dropdownStyles()}
            placeholder=""
            value={filterOption}
            onChange={onChangeOption}
            isSearchable={false}
          />
        </div>
        <div className="ml-auto flex items-center">
          <a
            href="https://docs.manta.network/docs/calamari/Staking/Collation/Overview"
            target="_blank"
            className={
              'p-3 cursor-pointer text-sm btn-hover unselectable-text text-center rounded-lg btn-primary w-full hover:text-white font-red-hat-text'
            }
            rel="noreferrer">
            Launch your own collator
          </a>
        </div>
      </div>
      <div className="w-full mt-4">
        {nodeIsDisconnected ? (
          <StakeErrorDisplay />
        ) : (
          <SortableTable
            height={getTableHeight(rowData.length, 10)}
            columnDefs={columnDefs}
            rowData={rowData}
          />
        )}
      </div>
      <StakeModalWrapper>
        <StakeModal hideModal={hideStakeModal} />
      </StakeModalWrapper>
      <UnstakeModalWrapper>
        <UnstakeModal hideModal={hideUnstakeModal} />
      </UnstakeModalWrapper>
    </div>
  );
};

export default CollatorsTable;
