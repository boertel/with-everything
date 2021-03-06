import WaitingProvider, { withWaiting } from './Waiting';
import DebugProvider, { withDebug } from './Debug';
import ParametersProvider, { withParameters } from './Parameters';
import { withAsync, withAsyncConnect} from './Asynchronous';
import ConnectionProvider, { withConnection, } from './Connection';
import { withMany } from './Many';
import Wizard from './Wizard';


export {
  withAsync,
  withAsyncConnect,

  ConnectionProvider,
  withConnection,

  DebugProvider,
  withDebug,

  withMany,

  ParametersProvider,
  withParameters,

  WaitingProvider,
  withWaiting,

  Wizard,
}
