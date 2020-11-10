// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { Fragment, useMemo, useCallback, Suspense, useEffect } from 'react';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { RouteComponentProps, Router } from '@reach/router';
import { useRecoilValue } from 'recoil';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { navigateTo } from '../../utils/navigation';
import { TreeLink } from '../../components/ProjectTree/ProjectTree';
import { Page } from '../../components/Page';
import { validateDialogsSelectorFamily } from '../../recoilModel';

import TableView from './table-view';
const CodeEditor = React.lazy(() => import('./code-editor'));

const LGPage: React.FC<RouteComponentProps<{
  dialogId: string;
  projectId: string;
  skillId: string;
}>> = (props) => {
  const { dialogId = '', projectId = '', skillId } = props;
  const dialogs = useRecoilValue(validateDialogsSelectorFamily(skillId ?? projectId ?? ''));

  const path = props.location?.pathname ?? '';

  const edit = /\/edit(\/)?$/.test(path);

  const baseURL = skillId == null ? `/bot/${projectId}/` : `/bot/${projectId}/skill/${skillId}/`;

  const navLinks: TreeLink[] = useMemo(() => {
    const newDialogLinks: TreeLink[] = dialogs.map((dialog) => {
      let url = `${baseURL}language-generation/${dialog.id}`;
      if (edit) {
        url += `/edit`;
      }
      return {
        id: dialog.id,
        name: dialog.displayName,
        ariaLabel: formatMessage('language generation file'),
        url,
      };
    });
    const mainDialogIndex = newDialogLinks.findIndex((link) => link.id === 'Main');

    if (mainDialogIndex > -1) {
      const mainDialog = newDialogLinks.splice(mainDialogIndex, 1)[0];
      newDialogLinks.splice(0, 0, mainDialog);
    }
    let commonUrl = `${baseURL}language-generation/common`;
    if (edit) {
      commonUrl += '/edit';
    }

    newDialogLinks.splice(0, 0, {
      id: 'common',
      name: formatMessage('All'),
      ariaLabel: formatMessage('all language generation files'),
      url: commonUrl,
    });
    return newDialogLinks;
  }, [dialogs, edit]);

  useEffect(() => {
    const activeDialog = dialogs.find(({ id }) => id === dialogId);
    if (!activeDialog && dialogs.length && dialogId !== 'common') {
      navigateTo(`${baseURL}language-generation/common`);
    }
  }, [dialogId, dialogs, projectId]);

  const onToggleEditMode = useCallback(
    (_e) => {
      let url = `${baseURL}language-generation/${dialogId}`;
      if (!edit) url += `/edit`;
      navigateTo(url);
    },
    [dialogId, projectId, edit]
  );

  const onRenderHeaderContent = () => {
    return (
      <ActionButton data-testid="showcode" onClick={onToggleEditMode}>
        {edit ? formatMessage('Hide code') : formatMessage('Show code')}
      </ActionButton>
    );
  };

  return (
    <Page
      useNewTree
      data-testid="LGPage"
      mainRegionName={formatMessage('LG editor')}
      navLinks={navLinks}
      navRegionName={formatMessage('LG Navigation Pane')}
      title={formatMessage('Bot Responses')}
      toolbarItems={[]}
      onRenderHeaderContent={onRenderHeaderContent}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <Router component={Fragment} primary={false}>
          <CodeEditor dialogId={dialogId} path="/edit/*" projectId={projectId} />
          <TableView dialogId={dialogId} path="/" projectId={projectId} />
        </Router>
      </Suspense>
    </Page>
  );
};

export default LGPage;
