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

  cancel = (params, path) => {
    this.push(this.props.parentPath, params, path);
  };

  render() {
    const { steps, parentPath, } = this.props;

    const routes = steps.map(({ component: RouteComponent, ...step }, index) => {
      const first = index === 0;
      const last = index === steps.length - 1;

      const back = (params, path) => {
        const pattern = !first ? steps[index - 1].path : parentPath;
        this.push(pattern, params, path);
      };
      const next = (params, path) => {
        const pattern = !last ? steps[index + 1].path : parentPath;
        this.push(pattern, params, path);
      };


      const wizardProps = {
        back,
        next,
        first,
        last,
        cancel: this.cancel,
      };

      const render = props => <RouteComponent {...props} wizard={wizardProps} />
      return <Route key={step.path || index} {...step} render={render} />
    }).reverse();   // reverse in order to place the "index" route if present
                    // at this end, so it doesn't block the render of the other children

    return (
      <Switch>{routes}</Switch>
    );
  }
}

export default Wizard;
