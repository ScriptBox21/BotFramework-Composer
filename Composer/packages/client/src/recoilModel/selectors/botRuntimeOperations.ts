// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { defaultPublishConfig, IPublishConfig } from '@bfc/shared';
import { selector, selectorFamily } from 'recoil';

import settingsStorage from '../../utils/dialogSettingStorage';
import { BotStatus } from '../../constants';
import { isAbsHosted } from '../../utils/envUtil';
import { botStatusState, luFilesState, qnaFilesState, settingsState } from '../atoms';
import { localBotsWithoutErrorsSelector } from '../selectors';
import { Dispatcher } from '../dispatchers';
import { dispatcherState } from '../DispatcherWrapper';
import { isBuildConfigComplete as isBuildConfigurationComplete, needsBuild } from '../../utils/buildUtil';

import { validateDialogSelectorFamily } from './validatedDialogs';

export const trackBotStatusesSelector = selectorFamily({
  key: 'trackBotStatusesSelector',
  get: (trackedProjectIds: string[]) => ({ get }) => {
    if (trackedProjectIds.length === 0) {
      return false;
    }
    const areBotsRunning = trackedProjectIds.find((projectId: string) => {
      const currentStatus = get(botStatusState(projectId));
      return currentStatus !== BotStatus.connected && currentStatus !== BotStatus.failed;
    });
    return areBotsRunning;
  },
});

export const botBuildRequiredSelector = selectorFamily({
  key: 'botBuildRequiredSelector',
  get: (projectId: string) => ({ get }) => {
    const dialogs = get(validateDialogSelectorFamily(projectId));
    return !isAbsHosted() && needsBuild(dialogs);
  },
});

export const buildEssentialsSelector = selectorFamily({
  key: 'buildEssentialsSelector',
  get: (projectId: string) => ({ get }) => {
    const settings = get(settingsState(projectId));
    const configuration = {
      luis: settings.luis,
      qna: settings.qna,
    };
    const dialogs = get(validateDialogSelectorFamily(projectId));
    const luFiles = get(luFilesState(projectId));
    const qnaFiles = get(qnaFilesState(projectId));
    const botBuildRequired = get(botBuildRequiredSelector(projectId));

    return {
      isConfigurationComplete: isBuildConfigurationComplete(configuration, dialogs, luFiles, qnaFiles),
      configuration,
      buildRequired: botBuildRequired,
      projectId,
    };
  },
});

export const buildConfigurationSelector = selector({
  key: 'buildConfigurationSelector',
  get: ({ get }) => {
    const localProjects = get(localBotsWithoutErrorsSelector);
    return localProjects.map((projectId: string) => {
      const result = get(buildEssentialsSelector(projectId));
      return result;
    });
  },
});

export const runningBotsSelector = selector({
  key: 'runningBotsSelector',
  get: ({ get }) => {
    const localProjects = get(localBotsWithoutErrorsSelector);
    const botsRunning = localProjects.filter((projectId: string) => {
      const result = get(botStatusState(projectId));
      return result === BotStatus.connected;
    });
    return {
      totalBots: localProjects.length,
      projectIds: botsRunning,
    };
  },
});

const botRuntimeAction = (dispatcher: Dispatcher) => {
  return {
    buildWithDefaultRecognizer: async (projectId: string, config: IPublishConfig) => {
      if (config) {
        dispatcher.setBotStatus(projectId, BotStatus.publishing);
        await dispatcher.build(config.luis, config.qna, projectId);
      }
    },
    startBot: async (projectId: string, config?: IPublishConfig) => {
      dispatcher.setBotStatus(projectId, BotStatus.reloading);
      if (config?.qna?.subscriptionKey && !config?.qna?.endpointKey) {
        await dispatcher.setQnASettings(projectId, config.qna.subscriptionKey);
      }

      const sensitiveSettings = settingsStorage.get(projectId);
      await dispatcher.publishToTarget(projectId, defaultPublishConfig, { comment: '' }, sensitiveSettings);
    },
    stopBot: async (projectId: string) => {
      dispatcher.stopPublishBot(projectId);
    },
  };
};

export const botRuntimeOperationsSelector = selector({
  key: 'botRuntimeOperationsSelector',
  get: ({ get }) => {
    const dispatcher = get(dispatcherState);
    if (!dispatcher) {
      return undefined;
    }
    return botRuntimeAction(dispatcher);
  },
});
