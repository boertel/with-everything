import React, { Component } from 'react';
import qs from 'qs';
import { compose } from 'redux';
import { connect, } from 'react-redux';

import { setDisplayName } from './utils';


const extractCursor = (url) => {
  if (url) {
    return qs.parse(new URL(url).search, { ignoreQueryPrefix: true }).cursor;
  }
  return undefined;
}

const extractCursors = (data) => {
  return {
    next: extractCursor(data.next),
    previous: extractCursor(data.previous),
  }
}


export const withAsync = (async, options) => {
  options = {
    loader: false,
    ...options,
  };

  return (WrappedComponent) => {
    class WithAsync extends Component {
      constructor(props) {
        super(props);
        this.state = {
          loading: !!props.load,
          cursors: {},
        }
      }

      done = (response, props={}) => {
        const state = {
          loading: false,
        }
        if (response) {
          state.cursors = extractCursors(response.data);
        }
        if (props.cursors) {
          state.cursors = {
            ...state.cursors,
            current: props.cursors.next,
          };
        }
        this.setState(state);
      }

      load = (props, params={}) => {
        params = {
          wait: true,
          ...params,
        }
        if (!props.load) {
          return;
        }
        if (props.refresh === false) {
          this.done();
          return;
        }

        if (options.mode !== 'append') {
          this.setState({ loading: true, });
        }

        // in a waiting context
        if (params.wait && props.register && props.unregister) {
          props.register();
        }
        return async(props)
          .then(response => this.done(response, props))
          .catch(error => {
            this.done();
            this.setState({
              error,
            });
          })
          .finally(() => props.unregister && props.unregister());
      }


      componentDidMount() {
        this.load(this.props);
      }

      render() {
        const {
          error,
          loading,
        } = this.state;

        let passProps = {
          ...this.props,
          reload: this.load,
          cursors: this.state.cursors,
        }

        if (error) {
          // need to trigger the error in a synchronous matter so it can
          // be caught be `ErrorBoundary` component
          throw error;
        }

        if (!options.loader) {
          passProps.loading = this.state.loading;
        }

        if (loading && options.loader !== false) {
          if (options.loader === null) {
            return null;
          }
          return React.createElement(options.loader)
        }

        return <WrappedComponent {...passProps} />
      }
    }
    setDisplayName(WithAsync, WrappedComponent);
    return WithAsync;
  }
}

export const withAsyncConnect = (mapStateToProps, mapDispatchToProps, options) => {
  let functionMapDispatchToProps = mapDispatchToProps;
  if (typeof mapDispatchToProps === 'object' && mapDispatchToProps !== null) {
    if (Array.isArray(mapDispatchToProps.load)) {
      const loads = mapDispatchToProps.load;

      functionMapDispatchToProps = dispatch => {
        const load = (props) => {
          const promises = loads.map(action => dispatch(action(props)))
          return Promise.all(promises);
        };
        return {
          ...mapDispatchToProps,
          dispatch,
          load,
        }
      };
    }
  }
  return (WrappedComponent) => {
    return compose(
      connect(mapStateToProps, functionMapDispatchToProps),
      withAsync((props) => props.load(props), options),
    )(WrappedComponent);
  }
}
