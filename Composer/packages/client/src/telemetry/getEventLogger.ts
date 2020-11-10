// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import pickBy from 'lodash/pickBy';
import { EventLogger, LogData, TelemetryEventName, TelemetryEvents } from '@bfc/shared';

import { addPropsToLogger, getLogger } from './telemetryLogger';

export const getEventLogger = (properties?: LogData | (() => LogData)): EventLogger => {
  const logger = addPropsToLogger(getLogger(), properties);

  const log = <TN extends TelemetryEventName>(
    eventName: TN,
    ...args: TelemetryEvents[TN] extends undefined ? [never?] : [TelemetryEvents[TN]]
  ) => {
    const [properties] = args;
    logger.logEvent(eventName, pickBy(properties));
  };

  return {
    log,
  };
};

export const useEventLogger = (properties?: LogData | (() => LogData)) => {
  return getEventLogger(properties);
};
