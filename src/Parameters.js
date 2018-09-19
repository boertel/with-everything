import React, { Component } from 'react';
import { withRouter } from 'react-router';
import qs from 'qs';
import { isEmpty, omit, isEqual, mapValues, pick } from 'lodash';

import { setDisplayName } from './utils';


const format = (definitions, obj={}) => {
  return mapValues(definitions, (value, key) => {
    let output = null;
    if (typeof value === 'function') {
      output = value(obj[key], obj);
    } else {
      output = obj[key] || value;
    }
    return output;
  });
}

const ParametersContext = React.createContext('parameters');

const ParametersProvider = withRouter(class extends Component {
  constructor(props) {
    super(props);
    this.state = this.getDefaultParameters(qs.parse(this.props.location.search, { ignoreQueryPrefix: true }));
  }

  push = (parameters) => {
    this.props.push(parameters);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.location.search, this.props.location.search)) {
      this.setState(format(this.props.fromURL, qs.parse(nextProps.location.search, { ignoreQueryPrefix: true })));
    }
  }

  getDefaultParameters = (query) => {
    const { fromState, fromURL } = this.props;
    return {
      ...format(fromState),
      ...format(fromURL, query),
    }
  }

  resetParameters = () => {
    this.updateParameters(this.getDefaultParameters());
  }

  updateParameters = (parameters) => {
    const { fromState, fromURL } = this.props;
    let stateFromState = {};
    let stateFromURL = {};

    const parametersFromState = pick(parameters, Object.keys(fromState));
    if (!isEmpty(parametersFromState)) {
      stateFromState = {
        ...format(fromState),
        ...format(parametersFromState, parameters),
      };
    }

    // URL parameters are propagated and stored through the URL query parameters,
    // and retrieve and formatted with `componentWillReceiveProps`
    const parametersFromURL = pick(parameters, Object.keys(fromURL));
    if (!isEmpty(parametersFromURL)) {
      stateFromURL = {
        ...pick(this.props.location.query, Object.keys(fromURL)), // values from URL
        ...parametersFromURL,  // and then new values that will be push to URL
      };
      }

    // URL parameters > state parameters
    if (!isEmpty(stateFromState)) {
      this.setState(omit(stateFromState, Object.keys(stateFromURL)));
    }
    if (!isEmpty(stateFromURL)) {
      this.push(stateFromURL);
    }
  }

  getContext() {
    return {
      parameters: this.state,
      updateParameters: this.updateParameters,
      resetParameters: this.resetParameters,
    }
  }

  render() {
    const context = this.getContext();
    return <ParametersContext.Provider value={context} {...this.props} />
  }
})

ParametersProvider.defaultProps = {
  fromState: {},
  fromURL: {},
}

const withParameters = WrappedComponent => {
  const WithParameters = (props) => {
    return (
      <ParametersContext.Consumer>{(context) => {
        return (
          <WrappedComponent
            {...context}
            {...props}
          />
        );
      }}
      </ParametersContext.Consumer>
    );
  }
  setDisplayName(WithParameters, WrappedComponent);
  return WithParameters;
}


export {
  withParameters,
}

export default ParametersProvider;
