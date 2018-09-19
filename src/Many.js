import React, { Component } from 'react';
import { omit, isEmpty, values, sortBy as _sortBy, } from 'lodash';

import { setDisplayName } from './utils';


export const withMany = (ChildComponent, options) => WrappedComponent => {
  let defaults = {
    propName: 'data',
    attributeForKey: 'id',
    sortBy: null,
    placeholder: null,
    omit: [],
  };

  if (typeof options === 'string') {
    defaults.propName = options;
    defaults.omit = [defaults.propName];
  } else {
    defaults = {
      ...defaults,
      ...options,
    };

    defaults.omit = [
      ...defaults.omit,
      ...(options.omit || []),
      defaults.propName,
    ];
  }

  class WithMany extends Component {
    render() {
      const data = this.props[defaults.propName];
      const { sortBy, loading, attributeForKey, ...rest } = this.props;

      let toArray = d => d;
      if (!Array.isArray(data)) {
        toArray = values;
      }
      if (sortBy) {
        if (typeof sortBy === 'function') {
          toArray = d => values(d).sort(sortBy);
        } else if (typeof sortBy === 'string') {
          toArray = d => _sortBy(values(d), sortBy);
        } else if (Array.isArray(sortBy)) {
          toArray = d => {
            return !isEmpty(d) ? sortBy.map(key => d[key]) : [];
          }
        }
      }

      let passProps = rest;
      if (defaults.omit.length) {
        passProps = omit(rest, defaults.omit);
      }

      const children = toArray(data).filter(d => d).map(d => {
        const key = d[attributeForKey];
        if (loading && defaults.placeholder) {
          const Placeholder = defaults.placeholder;
          return <Placeholder {...passProps} {...d} key={key} />
        } else {
          return <ChildComponent {...passProps} {...d} key={key} />
        }
      });

      return <WrappedComponent {...passProps}>{children}</WrappedComponent>;
    }
  }

  setDisplayName(WithMany, WrappedComponent)

  WithMany.defaultProps = {
    sortBy: defaults.sortBy,
    attributeForKey: defaults.attributeForKey,
  };

  return WithMany;
}
