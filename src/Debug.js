import React, { Component } from 'react';

const DebugContext = React.createContext('debug');


export const withDebug = WrappedComponent => {
  return function WithDebugComponent(props) {
    return (
      <DebugContext.Consumer>{debug => <WrappedComponent {...props} debug={debug} />}</DebugContext.Consumer>
    )
  }
}

export default class DebugProvider extends Component {
  state = {}

  static getDerivedStateFromProps(nextProps, prevState) {
    return nextProps;
  }

  debug = (namespace, ...args) => {
    if (this.state[namespace]) {
      console.group(namespace);
      console.log.apply(console, args)
      console.groupEnd();
    }
  }

  render() {
    const context = this.debug;

    return <DebugContext.Provider value={context} {...this.props} />
  }
}
