import React, { Component } from 'react';

import { withDebug } from './Debug';
import { setDisplayName } from './utils';

const WaitingContext = React.createContext('waiting');

export const withWaiting = (WrappedComponent) => {
  const WithWaiting = (props) => {
    return (
      <WaitingContext.Consumer>{(context) => (
        <WrappedComponent {...context} {...props} />
      )}</WaitingContext.Consumer>
    );
  }

  setDisplayName(WithWaiting, WrappedComponent);
  return WithWaiting;
}


class WaitingProvider extends Component {
  constructor(props) {
    super(props);

    this._waiting = 0;

    this.state = {
      waiting: false,
    }
  }

  register = () => {
    this._waiting += 1
    if (this._waiting === 1) {
      this.setState({ waiting: true });
    }
  }

  unregister = () => {
    if (this._waiting > 0) {
      this._waiting -= 1;
      if (this._waiting === 0) {
        this.setState({ waiting: false });
      }
    }
  }

  render() {
    const { children, loading, } = this.props;

    const context = {
      register: this.register,
      unregister: this.unregister,
      waiting: this.state.waiting,
    };

    return (
      <WaitingContext.Provider value={context}>{this.state.waiting ? loading : null}{children}</WaitingContext.Provider>
    );
  }
}

export default WaitingProvider;
