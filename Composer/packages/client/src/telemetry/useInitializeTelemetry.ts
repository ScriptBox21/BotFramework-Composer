import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { currentModeState, ServerSettingsState } from '../recoilModel';
import telemetryStorage from '../utils/telemetryStorage';

import { initializeLogger } from './telemetryLogger';

export const useInitializeLogger = () => {
  const [, forceRender] = useState({});
  const { telemetry } = useRecoilValue(ServerSettingsState);
  const page = useRecoilValue(currentModeState);
  const sessionId = telemetryStorage.getSessionId();

  useEffect(() => {
    initializeLogger(telemetry, () => ({
      sessionId,
      timestamp: new Date().toUTCString(),
      composerVersion: process.env.COMPOSER_VERSION || 'unknown',
      sdkPackageVersion: process.env.SDK_PACKAGE_VERSION || 'unknown',
      page,
    }));

    forceRender({});
  }, [telemetry, page]);
};
