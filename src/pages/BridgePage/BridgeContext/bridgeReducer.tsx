// @ts-nocheck
import { localStorageKeys } from 'constants/LocalStorageConstants';
import store from 'store';
import AssetType from 'types/AssetType';
import Balance from 'types/Balance';
import Chain from 'types/Chain';
import BRIDGE_ACTIONS from './bridgeActions';

const getDestinationChainOptions = (originChain, originChainOptions) => {
  return originChainOptions
    .filter(chain => chain.name !== originChain.name)
    .filter(chain => originChain.canTransferXcm(chain));
};

const getSenderAssetTypeOptions = (config, originChain, destinationChain) => {
  return AssetType.AllCurrencies(config, false).filter(
    assetType => assetType.canTransferXcm(originChain, destinationChain));
};

const getNewSenderAssetType = (prevSenderAssetType, senderAssetTypeOptions) => {
  return (
    senderAssetTypeOptions.find(assetType => assetType.name === prevSenderAssetType?.name)
    || senderAssetTypeOptions[0] || null
  );
};

const getNewSenderAssetTargetBalance = (newSenderAssetType, prevTargetBalance) => {
  let targetBalance = null;
  if (prevTargetBalance && newSenderAssetType) {
    targetBalance = Balance.fromBaseUnits(
      newSenderAssetType, prevTargetBalance.valueBaseUnits()
    );
  }
  return targetBalance;
};

export const buildInitState = (config) => {
  // user's prev selecting
  const prevBridgeOriginChainName = store.get(localStorageKeys.BridgeOriginChainName);
  const prevBridgeDestinationChainName = store.get(localStorageKeys.BridgeDestinationChainName);

  const initOriginChainOptions = Chain.All(config);
  let initOriginChain;
  if (prevBridgeOriginChainName) {
    initOriginChain = initOriginChainOptions?.find(chain => chain.name === prevBridgeOriginChainName);
  } else {
    initOriginChain = initOriginChainOptions[0];
  }

  const initDestinationChainOptions = getDestinationChainOptions(
    initOriginChain, initOriginChainOptions
  );
  let initDestinationChain;
  if (prevBridgeDestinationChainName) {
    initDestinationChain = initDestinationChainOptions?.find(chain => chain.name === prevBridgeDestinationChainName);
  } else {
    initDestinationChain = initDestinationChainOptions[0];
  }
  const initSenderAssetTypeOptions = getSenderAssetTypeOptions(
    config, initOriginChain, initDestinationChain
  );
  const initSenderAssetType = initSenderAssetTypeOptions[0];

  return {
    config,
    bridge: null,
    api: null,
    isApiInitialized: false,
    isApiDisconnected: false,

    senderEthAccount: null,
    senderAssetType: initSenderAssetType,
    senderAssetTypeOptions: initSenderAssetTypeOptions,
    senderAssetCurrentBalance: null,
    senderAssetTargetBalance: null,
    maxInput: null,
    minInput: null,
    senderNativeAssetCurrentBalance: null,

    originChain: initOriginChain,
    originChainOptions: initOriginChainOptions,
    originFee: null,

    destinationChain: initDestinationChain,
    destinationChainOptions: initDestinationChainOptions,
    destinationAddress: null,
    destinationFee: null,
  };
};

const bridgeReducer = (state, action) => {
  switch (action.type) {
  case BRIDGE_ACTIONS.SET_API_IS_INITIALIZED:
    return setApiIsInitialized(state, action);

  case BRIDGE_ACTIONS.SET_IS_API_DISCONNECTED:
    return setIsApiDisconnected(state, action);

  case BRIDGE_ACTIONS.SET_BRIDGE:
    return setBridge(state, action);

  case BRIDGE_ACTIONS.SET_SELECTED_ASSET_TYPE:
    return setSelectedAssetType(state, action);

  case BRIDGE_ACTIONS.SET_SENDER_ASSET_CURRENT_BALANCE:
    return setSenderAssetCurrentBalance(state, action);

  case BRIDGE_ACTIONS.SET_SENDER_ASSET_TARGET_BALANCE:
    return setSenderAssetTargetBalance(state, action);

  case BRIDGE_ACTIONS.SET_FEE_ESTIMATES:
    return setFeeEstimates(state, action);

  case BRIDGE_ACTIONS.SET_ORIGIN_CHAIN:
    return setOriginChain(state, action);

  case BRIDGE_ACTIONS.SET_DESTINATION_CHAIN:
    return setDestinationChain(state, action);

  case BRIDGE_ACTIONS.SET_DESTINATION_ADDRESS:
    return setDestinationAddress(state, action);

  case BRIDGE_ACTIONS.SWITCH_ORIGIN_AND_DESTINATION:
    return switchOriginAndDestination(state, action);

  case BRIDGE_ACTIONS.SET_SENDER_NATIVE_ASSET_CURRENT_BALANCE:
    return setSenderNativeAssetCurrentBalance(state, action);

  default:
    throw new Error(`Unknown type: ${action.type}`);
  }
};

const balanceUpdateIsStale = (stateAssetType, updateAssetType) => {
  if (!updateAssetType) {
    return false;
  }
  return stateAssetType?.assetId !== updateAssetType.assetId;
};

const setApiIsInitialized = (state, { chain }) => {
  if (chain.name === state.originChain.name) {
    return {
      ...state,
      isApiInitialized: true,
      isApiDisconnected: false
    };
  }
  return state;
};

const setIsApiDisconnected = (state, { chain, isApiDisconnected }) => {
  if (chain.name === state.originChain.name) {
    return {
      ...state,
      isApiDisconnected
    };
  }
  return state;
};


const setBridge = (state, { bridge }) => {
  return {
    ...state,
    bridge
  };
};

const setSelectedAssetType = (state, action) => {
  store.set(localStorageKeys.CurrentToken, action.selectedAssetType.baseTicker);
  const senderAssetType = action.selectedAssetType;
  let senderAssetTargetBalance = null;
  if (state.senderAssetTargetBalance) {
    senderAssetTargetBalance = Balance.fromBaseUnits(
      senderAssetType, state.senderAssetTargetBalance.valueBaseUnits()
    );
  }
  return {
    ...state,
    senderAssetCurrentBalance: null,
    senderAssetTargetBalance,
    senderAssetType
  };
};

const setSenderAssetCurrentBalance = (state, action) => {
  if (balanceUpdateIsStale(state?.senderAssetType, action.senderAssetCurrentBalance?.assetType)) {
    return state;
  }
  return {
    ...state,
    senderAssetCurrentBalance: action.senderAssetCurrentBalance
  };
};


const setSenderNativeAssetCurrentBalance = (state, {senderNativeAssetCurrentBalance}) => {
  if (
    balanceUpdateIsStale(
      state?.originChain?.nativeAsset, senderNativeAssetCurrentBalance?.assetType
    )) {
    return state;
  }
  return {
    ...state,
    senderNativeAssetCurrentBalance
  };
};

const setSenderAssetTargetBalance = (state, action) => {
  return {
    ...state,
    senderAssetTargetBalance: action.senderAssetTargetBalance
  };
};

const setFeeEstimates = (state, action) => {
  const { originFee, destinationFee, maxInput, minInput  } = action;
  return {
    ...state,
    originFee,
    destinationFee,
    maxInput,
    minInput
  };
};

const setOriginChain = (state, { originChain, isApiInitialized, isApiDisconnected }) => {
  store.set(localStorageKeys.BridgeOriginChainName, originChain.name);
  let destinationChain = state.destinationChain;
  const destinationChainOptions = getDestinationChainOptions(originChain, state.originChainOptions);
  if (!originChain.canTransferXcm(destinationChain)) {
    destinationChain = destinationChainOptions[0];
    store.set(localStorageKeys.BridgeDestinationChainName, destinationChain.name);
  }
  const senderAssetTypeOptions = getSenderAssetTypeOptions(
    state.config, originChain, destinationChain
  );
  const senderAssetType = getNewSenderAssetType(state.senderAssetType, senderAssetTypeOptions);
  const senderAssetTargetBalance = getNewSenderAssetTargetBalance(
    senderAssetType, state.senderAssetTargetBalance
  );

  return {
    ...state,
    originChain,
    isApiInitialized,
    isApiDisconnected,
    destinationChain,
    destinationChainOptions,
    senderAssetType,
    senderAssetTypeOptions,
    senderAssetTargetBalance,
    senderNativeAssetCurrentBalance: null,
    senderAssetCurrentBalance: null,
    originFee: null,
    destinationFee: null
  };
};

const setDestinationChain = (state, { destinationChain }) => {
  store.set(localStorageKeys.BridgeDestinationChainName, destinationChain.name);
  const senderAssetTypeOptions = getSenderAssetTypeOptions(
    state.config, state.originChain, destinationChain
  );
  const senderAssetType = getNewSenderAssetType(state.senderAssetType, senderAssetTypeOptions);
  const senderAssetTargetBalance = getNewSenderAssetTargetBalance(
    senderAssetType, state.senderAssetTargetBalance
  );

  return {
    ...state,
    senderAssetTypeOptions,
    senderAssetType,
    destinationChain,
    senderAssetTargetBalance,
    senderNativeAssetCurrentBalance: null,
    senderAssetCurrentBalance: null,
    originFee: null,
    destinationFee: null
  };
};

const setDestinationAddress = (state, { destinationAddress }) => {
  return {
    ...state,
    destinationAddress
  };
};

const switchOriginAndDestination = (state, { isApiInitialized, isApiDisconnected }) => {
  const { originChain, originChainOptions, destinationChain, senderAssetType, senderAssetTypeOptions} = state;
  if (destinationChain.canTransferXcm(originChain)) {
    const newDestinationChain = originChain;
    const newOriginChain = destinationChain;
    store.set(localStorageKeys.BridgeOriginChainName, newOriginChain.name);
    store.set(localStorageKeys.BridgeDestinationChainName, newDestinationChain.name);
    return {
      ...state,
      isApiInitialized,
      isApiDisconnected,
      originChain: newOriginChain,
      destinationChain: newDestinationChain,
      destinationChainOptions: getDestinationChainOptions(newOriginChain, originChainOptions),
      senderAssetType: getNewSenderAssetType(senderAssetType, senderAssetTypeOptions),
      senderNativeAssetCurrentBalance: null,
      senderAssetCurrentBalance: null,
      originFee: null,
      destinationFee: null,
      destinationAddress: null
    };
  }
  return state;
};

export default bridgeReducer;
