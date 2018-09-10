import React, { Component } from 'react';
import { isEqual } from 'lodash-es';
import { generatePath } from 'react-router';
import { Switch, Route, } from 'react-router-dom';


class Wizard extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(nextProps, this.props) || !isEqual(this.state, nextState);
  }

  push = (pattern, params, path={}) => {
    const { history } = this.props;
    const pathname = generatePath(pattern, params)
    history.push({
      pathname,
      ...path,
    });
  }

  render() {
    const { steps, } = this.props;

    const routes = steps.map(({ component, ...step }), index) => {

      const first = index === 0;
      const last = index === steps.length - 1;

      const back = !first ? (params, path) => this.push(steps[index - 1].path, params, path) : null;
      const next = !last ? (params, path) => this.push(steps[index + 1].path, params, path) : null;

      const wizardProps = {
        back,
        next,
        first,
        last,
      };

      const render = props => <component {...props} {...wizardProps} />
      return <Route key={step.path} {...step} render={render} />
    });

    return (
      <Switch>{routes}</Switch>
    );
  }
}

export default Wizard;
