import React, { Component } from 'react';


const { Provider, Consumer } = React.createContext('offline');

class ConnectionProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      offline: !navigator.onLine,
    }
  }

  onOnline = () => this.setState({ offline: false });
  onOffline = () => this.setState({ offline: true });

  componentDidMount() {
    window.addEventListener('online', this.onOnline);
    window.addEventListener('offline', this.onOffline);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.onOnline);
    window.removeEventListener('offline', this.onOffline);
  }

  render() {
    return (
      <Provider {...this.props} value={this.state.offline} />
    );
  }
}

export const withConnection = (WrappedComponent) => {
  return function WithConnectionStatusComponent(props) {
    return (
      <Consumer>
        {offline => <WrappedComponent {...props} offline={offline} />}
      </Consumer>
    )
  };
}

export default ConnectionProvider;
