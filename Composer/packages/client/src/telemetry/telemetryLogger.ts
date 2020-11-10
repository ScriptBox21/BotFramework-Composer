// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LogData, Logger, TelemetrySettings } from '@bfc/shared';
import noop from 'lodash/noop';

import { getApplicationInsightsLogger } from './applicationInsightsLogger';
import { getEventLogger } from './getEventLogger';

const noopLogger = (): Logger => {
  return {
    logEvent: noop,
    flush: noop,
  };
};

const theLogger = {
  current: noopLogger(),
};

export const addPropsToLogger = (logger: Logger, addProperties?: LogData | (() => LogData)): Logger => {
  const getProperties = typeof addProperties === 'function' ? addProperties : () => addProperties;

  const logEvent = (name: string, properties?: LogData) => {
    logger.logEvent(name, { ...getProperties(), ...properties });
  };

  return {
    ...logger,
    logEvent,
  };
};

const createLogger = (telemetrySettings?: TelemetrySettings): Logger => {
  return telemetrySettings?.allowDataCollection ? getApplicationInsightsLogger() : noopLogger();
};

export const initializeLogger = (telemetrySettings?: TelemetrySettings, properties?: LogData | (() => LogData)) => {
  theLogger.current = addPropsToLogger(createLogger(telemetrySettings), properties);
  return getEventLogger();
};

export const getLogger = () => theLogger.current;
