import store from 'store';
import TxHistoryEvent, { HISTORY_EVENT_STATUS } from 'types/TxHistoryEvent';

const PRIVATE_TRANSACTION_STORAGE_KEY = 'privateTransactionHistory';

export const getPrivateTransactionHistory = (network: string | null): TxHistoryEvent[] => {
  const jsonPrivateTransactionHistory = [
    ...store.get(PRIVATE_TRANSACTION_STORAGE_KEY, [])
  ];
  const privateTransactionHistory = jsonPrivateTransactionHistory
    .map(
      (jsonTxHistoryEvent) => {
        return TxHistoryEvent.fromJson(jsonTxHistoryEvent);
      }
    )
    .filter(event => {
      if (network === null) {
        return true;
      }
      return event.network === network;
    })
    .filter((event) => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return sixMonthsAgo < event.date;
    });
  return privateTransactionHistory;
};

export const setPrivateTransactionHistory = (
  privateTransactionHistory: TxHistoryEvent[]
) => {
  const jsonPrivateTransactionHistory = privateTransactionHistory.map(
    (txHistoryEvent) => {
      return txHistoryEvent.toJson();
    }
  );
  store.set(PRIVATE_TRANSACTION_STORAGE_KEY, jsonPrivateTransactionHistory);
};

// add pending private transaction to the history
export const appendTxHistoryEvent = (txHistoryEvent: TxHistoryEvent) => {
  const jsonPrivateTransactionHistory = [
    ...store.get(PRIVATE_TRANSACTION_STORAGE_KEY, [])
  ];
  jsonPrivateTransactionHistory.push(txHistoryEvent.toJson());
  store.set(PRIVATE_TRANSACTION_STORAGE_KEY, jsonPrivateTransactionHistory);
};

// update pending transaction to finalized transaction status
export const updateTxHistoryEventStatus = (
  status: HISTORY_EVENT_STATUS,
  extrinsicHash: string
) => {
  const privateTransactionHistory = [...getPrivateTransactionHistory(null)];
  privateTransactionHistory.forEach((txHistoryEvent) => {
    if (
      txHistoryEvent.extrinsicHash === extrinsicHash &&
      txHistoryEvent.status === HISTORY_EVENT_STATUS.PENDING
    ) {
      txHistoryEvent.status = status;
    }
  });
  const jsonPrivateTransactionHistory = privateTransactionHistory.map(
    (txHistoryEvent) => {
      return txHistoryEvent.toJson();
    }
  );
  store.set(PRIVATE_TRANSACTION_STORAGE_KEY, jsonPrivateTransactionHistory);
};

// remove pending history event (usually the last one) from the history
export const removePendingTxHistoryEvent = (extrinsicHash?: string) => {
  const privateTransactionHistory = [...getPrivateTransactionHistory(null)];
  if (privateTransactionHistory.length === 0) {
    return;
  }

  if (extrinsicHash) {
    const txHistoryEvent = privateTransactionHistory.find(
      (txHistoryEvent) => txHistoryEvent.extrinsicHash === extrinsicHash
    );

    if (
      txHistoryEvent &&
      txHistoryEvent.status === HISTORY_EVENT_STATUS.PENDING
    ) {
      privateTransactionHistory.splice(
        privateTransactionHistory.indexOf(txHistoryEvent),
        1
      );
    }
  } else {
    const lastTransaction =
      privateTransactionHistory[privateTransactionHistory.length - 1];
    if (lastTransaction.status !== HISTORY_EVENT_STATUS.PENDING) {
      return;
    }

    privateTransactionHistory.pop();
  }
  store.set(PRIVATE_TRANSACTION_STORAGE_KEY, privateTransactionHistory);
};
