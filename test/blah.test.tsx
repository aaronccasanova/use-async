// TODO: Write tests

import React from 'react'
import * as ReactDOM from 'react-dom'
// import { Default as Thing } from '../stories/Thing.stories'

function Placeholder() {
  return null
}

describe('useAsync', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div')
    ReactDOM.render(<Placeholder />, div)
    ReactDOM.unmountComponentAtNode(div)
  })
})
