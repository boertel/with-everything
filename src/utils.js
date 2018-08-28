export function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export function setDisplayName(Hoc, WrappedComponent) {
  Hoc.displayName = `${getDisplayName(Hoc)}(${getDisplayName(WrappedComponent)})`;
}
