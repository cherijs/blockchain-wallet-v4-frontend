import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { FormattedMessage } from 'react-intl'
import { Field, reduxForm } from 'redux-form'

import { required, validEtherAddress } from 'services/FormHelper'
import { Button, Text, Tooltip } from 'blockchain-info-components'
import { FiatConvertor, Form, FormGroup, FormItem, FormLabel, SelectBoxCoin, TextBox, TextAreaDebounced } from 'components/Form'
import { invalidAmount, insufficientFunds, maximumAmount } from './validation'
import QRCodeCapture from 'components/QRCodeCapture'
import ComboDisplay from 'components/Display/ComboDisplay'

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
`

const FirstStep = props => {
  const { pristine, invalid, submitting, fee, handleSubmit, unconfirmedTx, isContract } = props
  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup inline margin={'15px'}>
        <FormItem width={'40%'}>
          <FormLabel for='coin'>
            <FormattedMessage id='modals.sendether.firststep.coin' defaultMessage='Currency:' />
          </FormLabel>
          <Field name='coin' component={SelectBoxCoin} validate={[required]} />
        </FormItem>
      </FormGroup>
      <FormGroup margin={'15px'}>
        <FormItem>
          <FormLabel for='to'>
            <FormattedMessage id='modals.sendether.firststep.to' defaultMessage='To:' />
          </FormLabel>
          <Row>
            <Field disabled={unconfirmedTx} name='to' placeholder='Paste or scan an address' component={TextBox} validate={[required, validEtherAddress]} />
            { !unconfirmedTx && <QRCodeCapture scanType='ethAddress' border={['top', 'bottom', 'right']} /> }
          </Row>
          { unconfirmedTx && <Text color='error' size='12px' weight={300}>
            <FormattedMessage id='modals.sendeth.unconfirmedtransactionmessage' defaultMessage='Please wait until your previous transaction confirms.' />
          </Text>}
          { isContract && <Text color='error' size='12px' weight={300}>
            <FormattedMessage id='modals.sendeth.contractaddr' defaultMessage='Sending to contract addresses is disabled.' />
          </Text>}
        </FormItem>
      </FormGroup>
      <FormGroup margin={'15px'}>
        <FormItem>
          <FormLabel for='amount'>
            <FormattedMessage id='modals.sendether.firststep.amount' defaultMessage='Enter amount:' />
          </FormLabel>
          <Field name='amount' disabled={unconfirmedTx} component={FiatConvertor} coin='ETH' validate={[invalidAmount, insufficientFunds, maximumAmount]} />
        </FormItem>
      </FormGroup>
      <FormGroup margin={'15px'}>
        <FormItem>
          <FormLabel for='description'>
            <FormattedMessage id='modals.sendether.firststep.description' defaultMessage='Description: ' />
            <Tooltip>
              <FormattedMessage id='modals.sendether.firststep.sharetooltip' defaultMessage='Add a note to remind yourself what this transaction relates to. This note will be private and only seen by you.' />
            </Tooltip>
          </FormLabel>
          <Field name='description' component={TextAreaDebounced} placeholder="What's this transaction for?" fullwidth />
        </FormItem>
      </FormGroup>
      <FormGroup margin={'30px'}>
        <FormItem>
          <FormLabel>
            <FormattedMessage id='modals.sendether.firststep.fee' defaultMessage='Transaction Fee :' />
          </FormLabel>
          <ComboDisplay size='14px' coin='ETH'>{fee}</ComboDisplay>
        </FormItem>
      </FormGroup>
      <FormGroup>
        <Button type='submit' nature='primary' uppercase disabled={pristine || submitting || invalid || isContract}>
          <FormattedMessage id='modals.sendether.firststep.continue' defaultMessage='Continue' />
        </Button>
      </FormGroup>
    </Form>
  )
}

FirstStep.propTypes = {
  invalid: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
  fee: PropTypes.string.isRequired,
  effectiveBalance: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  unconfirmedTx: PropTypes.bool
}

export default reduxForm({ form: 'sendEth', destroyOnUnmount: false })(FirstStep)
