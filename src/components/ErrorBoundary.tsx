import React from 'react'

import { LargeMessage } from './LargeMessage'

export class ErrorBoundary extends React.Component {
  // eslint-disable-next-line react/state-in-constructor
  state: { error?: Error } = {}

  static getDerivedStateFromError(error: Error) {
    return {
      error,
    }
  }

  render() {
    if (this.state.error) {
      return (
        <LargeMessage
          iconName="Error"
          title="Error"
          content={this.state.error.message}
        />
      )
    }
    return this.props.children
  }
}
