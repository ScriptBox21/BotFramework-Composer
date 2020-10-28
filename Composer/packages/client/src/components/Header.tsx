// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import formatMessage from 'format-message';
import { IconButton, IButtonStyles, ActionButton } from 'office-ui-fabric-react/lib/Button';
import { useCallback, Fragment, useState, useEffect, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { FontSizes, SharedColors } from '@uifabric/fluent-theme';

import {
  dispatcherState,
  appUpdateState,
  botDisplayNameState,
  localeState,
  currentProjectIdState,
  runningBotsSelector,
  currentModeState,
} from '../recoilModel';
import composerIcon from '../images/composerIcon.svg';
import { AppUpdaterStatus } from '../constants';

import { NotificationButton } from './Notifications/NotificationButton';
import { StartBotsPanel } from './TestController/startBotsPanel';
import { useLocalBotOperations } from './TestController/useLocalBotOperations';
export const actionButton = css`
  font-size: ${FontSizes.size18};
  margin-top: 2px;
`;

// -------------------- Styles -------------------- //

const headerContainer = css`
  position: relative;
  background: ${SharedColors.cyanBlue10};
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const title = css`
  margin-left: 20px;
  font-weight: ${FontWeights.semibold};
  font-size: ${FontSizes.size16};
  color: #fff;
`;

const botName = css`
  margin-left: 20px;
  font-size: 16px;
  color: #fff;
`;

const divider = css`
  height: 24px;
  border-right: 1px solid #979797;
  margin: 0px 0px 0px 20px;
`;

const headerTextContainer = css`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 50%;
`;

const rightSection = css`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 50%;
  margin: 15px 10px;
`;

const localBotOperationIcon: IButtonStyles = {
  root: {
    color: `#fff`,
    marginRight: '12px',
    boxSizing: 'border-box',
    fontSize: `${FontSizes.size16}`,
    width: '20px',
  },
};

const startBotWidgetContainer = css`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
`;

const buttonStyles: IButtonStyles = {
  icon: {
    color: '#fff',
    fontSize: FontSizes.size20,
  },
  root: {
    height: '20px',
    width: '20px',
    marginLeft: '16px',
    marginTop: '4px',
  },
  rootHovered: {
    backgroundColor: 'transparent',
  },
  rootPressed: {
    backgroundColor: 'transparent',
  },
};

// -------------------- Header -------------------- //

export const Header = () => {
  const { setAppUpdateShowing } = useRecoilValue(dispatcherState);
  const projectId = useRecoilValue(currentProjectIdState);
  const projectName = useRecoilValue(botDisplayNameState(projectId));
  const locale = useRecoilValue(localeState(projectId));
  const appUpdate = useRecoilValue(appUpdateState);
  const { showing, status } = appUpdate;
  const [showStartBotsPanel, setStartPanelView] = useState(false);
  const runningBots = useRecoilValue(runningBotsSelector);
  const isRunning = runningBots.projectIds.length > 0;

  const { projectIds: projectIdsRunning } = runningBots;
  const [areBotsStarted, setBotsInBotProjectStarted] = useState<boolean>(false);
  const { stopAllBots, startAllBots } = useLocalBotOperations();
  const [showStartBotsWidget, setStartBotsWidgetVisible] = useState(true);
  const currentMode = useRecoilValue(currentModeState);

  useEffect(() => {
    if (currentMode !== 'home') {
      setStartBotsWidgetVisible(true);
      return;
    }
    setStartBotsWidgetVisible(false);
  }, [currentMode]);

  useEffect(() => {
    if (projectIdsRunning.length > 0) {
      setBotsInBotProjectStarted(true);
    }
  }, [projectIdsRunning]);

  const startPanelText = useMemo(() => {
    if (isRunning) {
      return formatMessage('Stop all bots ({running}/{total}) running', {
        running: runningBots.projectIds.length,
        total: runningBots.totalBots,
      });
    }
    return formatMessage('Start all bots');
  }, [runningBots, isRunning]);

  const onUpdateAvailableClick = useCallback(() => {
    setAppUpdateShowing(true);
  }, []);

  function dismissStartPanelViewer() {
    setStartPanelView(false);
  }

  function handleStartOrStopAll() {
    if (areBotsStarted) {
      stopAllBots();
      dismissStartPanelViewer();
      setBotsInBotProjectStarted(false);
    } else {
      startAllBots();
      setStartPanelView(true);
    }
  }

  const showUpdateAvailableIcon = status === AppUpdaterStatus.UPDATE_AVAILABLE && !showing;

  return (
    <div css={headerContainer} role="banner">
      <img
        alt={formatMessage('Composer Logo')}
        aria-label={formatMessage('Composer Logo')}
        src={composerIcon}
        style={{ marginLeft: '9px' }}
      />
      <div css={headerTextContainer}>
        <div css={title}>{formatMessage('Bot Framework Composer')}</div>
        {projectName && (
          <Fragment>
            <div css={divider} />
            <span css={botName}>{`${projectName} (${locale})`}</span>
          </Fragment>
        )}
      </div>

      <div css={rightSection}>
        {showStartBotsWidget && (
          <div css={startBotWidgetContainer}>
            {runningBots.projectIds.length > 0 ? (
              <ActionButton
                aria-label={formatMessage('Stop all bots')}
                css={actionButton}
                onClick={handleStartOrStopAll}
              >
                <Icon iconName={'CircleStopSolid'} styles={localBotOperationIcon} />
              </ActionButton>
            ) : (
              <ActionButton
                aria-label={formatMessage('Start all bots')}
                css={actionButton}
                data-testid={'startAllBots'}
                onClick={handleStartOrStopAll}
              >
                <Icon iconName={'Play'} styles={localBotOperationIcon} />
              </ActionButton>
            )}
            <span aria-label={startPanelText} aria-live={'assertive'}>
              {startPanelText}
            </span>
            <ActionButton css={actionButton} onClick={() => setStartPanelView(true)}>
              <Icon iconName={'ProductList'} styles={localBotOperationIcon} />
            </ActionButton>
          </div>
        )}

        {showUpdateAvailableIcon && (
          <IconButton
            iconProps={{ iconName: 'History' }}
            styles={buttonStyles}
            title={formatMessage('Update available')}
            onClick={onUpdateAvailableClick}
          />
        )}
        <NotificationButton buttonStyles={buttonStyles} />
      </div>

      {showStartBotsPanel && <StartBotsPanel isOpen={showStartBotsPanel} onDismiss={dismissStartPanelViewer} />}
    </div>
  );
};
