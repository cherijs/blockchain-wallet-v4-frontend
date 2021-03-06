import React from 'react'
import { shallow } from 'enzyme'
import 'jest-styled-components'
import toJson from 'enzyme-to-json'
import PhoneNumberBox from './index.js'
import { Remote } from 'blockchain-wallet-v4/src'

jest.mock('react-intl-tel-input/dist/main.css', () => jest.fn())
jest.mock('react-intl-tel-input/dist/libphonenumber.js', () => jest.fn())
jest.mock('react-intl-tel-input', () => jest.fn())

describe('PhoneNumberBox', () => {
  it('renders correctly', () => {
    const component = shallow(<PhoneNumberBox countryCode={Remote.of('US')} />)
    const tree = toJson(component)
    expect(tree).toMatchSnapshot()
  })
})
