import { cancel, call, fork, put, race, select, take } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import { equals, identity, path, prop } from 'ramda'
import { actions, actionTypes, selectors } from 'data'

export default ({ api, coreSagas }) => {
  const updateTradeStatus = function * (depositAddress) {
    try {
      const appState = yield select(identity)
      const currentTrade = selectors.core.kvStore.shapeShift.getTrade(depositAddress, appState).getOrFail('Could not find trade.')
      const currentStatus = prop('status', currentTrade)
      if (equals('complete', currentStatus) || equals('failed', currentStatus)) {
        return
      }
      const data = yield call(api.getTradeStatus, depositAddress)
      const status = prop('status', data)
      if (!equals(status, currentStatus)) {
        yield put(actions.core.kvStore.shapeShift.updateTradeStatusMetadataShapeshift(depositAddress, status))
      }
    } catch (e) {
      console.log(e)
    }
  }

  const exchangeHistoryInitialized = function * (action) {
    try {
      const { trades } = action.payload
      for (let i = 0; i < trades.length; i++) {
        const trade = trades[i]
        const depositAddress = path(['quote', 'deposit'], trade)
        try {
          yield call(coreSagas.kvStore.shapeShift.fetchShapeshiftTrade, depositAddress)
          yield race({
            success: take(actionTypes.core.kvStore.shapeShift.FETCH_SHAPESHIFT_TRADE_SUCCESS),
            failure: take(actionTypes.core.kvStore.shapeShift.FETCH_SHAPESHIFT_TRADE_FAILURE)
          })
        } catch (e) {
          const orderId = path(['quote', 'orderId'], trade)
          yield put(actions.alerts.displayError(`Could not fetch trade [${orderId}] status.`))
        }
      }
    } catch (e) {
      yield put(actions.alerts.displayError(`Could not fetch all trades statuses.`))
    }
  }

  let pollingTradeStatusTask

  const startPollingTradeStatus = function * (depositAddress) {
    try {
      while (true) {
        yield call(updateTradeStatus, depositAddress)
        yield call(delay, 5000)
      }
    } catch (e) {
      yield put(actions.alerts.displayError('Could not refresh trade status.'))
    }
  }

  const exchangeHistoryModalInitialized = function * (action) {
    try {
      const { depositAddress } = action.payload
      pollingTradeStatusTask = yield fork(startPollingTradeStatus, depositAddress)
    } catch (e) {
      yield put(actions.alerts.displayError('Error fetching trade information'))
    }
  }

  const exchangeHistoryModalDestroyed = function * (action) {
    try {
      yield cancel(pollingTradeStatusTask)
    } catch (e) {
      yield put(actions.alerts.displayError('Error fetching trade information'))
    }
  }

  return {
    exchangeHistoryInitialized,
    exchangeHistoryModalInitialized,
    exchangeHistoryModalDestroyed
  }
}