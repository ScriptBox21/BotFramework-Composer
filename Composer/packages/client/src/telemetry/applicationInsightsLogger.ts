// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { throttle } from 'lodash';
import { LogData, Logger } from '@bfc/shared';

import httpClient from '../utils/httpUtil';

export const appInsightsLogger = (): Logger => {
  const trackEvent = (name: string, properties?: LogData) => {
    console.log('bfc', { name, properties });
    httpClient.post('/telemetry/trackEvent', { name, properties });
  };

  const throttledTrackEvent = throttle(trackEvent, 1000);

  const logEvent = (name: string, properties?: LogData) => {
    throttledTrackEvent(name, properties);
  };

  const flush = () => {
    throttledTrackEvent.flush();
  };

  return {
    logEvent,
    flush,
  };
};

const logger = {
  current: appInsightsLogger(),
};

export const getApplicationInsightsLogger = () => {
  return logger.current;
};
