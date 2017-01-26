export const ADD_TRANSACTION = 'ADD_TRANSACTION';
export const DELETE_TRANSACTION = 'DELETE_TRANSACTION';
export const GET_TRANSACTION_GRID_FIELDS = 'GET_TRANSACTION_GRID_FIELDS';
export const REQUEST_SUM = 'REQUEST_SUM';

function createTransaction(transaction) {
  return {
    type: ADD_TRANSACTION,
    transaction
  };
}

export function deleteTransaction(id) {
  return {
    type: ADD_TRANSACTION,
    id
  };
}

export function requestSum(data) {
  return {
    type: REQUEST_SUM,
    data
  };
}

export function addTransaction(transaction) {
  return (dispatch, getState) => {
    const addedResult = dispatch(createTransaction(transaction));
    dispatch(requestSum(getState().transactions.transactions));
    return addedResult;
  };
}
