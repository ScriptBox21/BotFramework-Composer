// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type LogData = Record<string, unknown>;

export type Logger = {
  logEvent: (name: string, properties?: LogData) => void;
  flush: () => void;
};

type SessionEvents = {
  SessionStarted: { resolution: string; pva: boolean };
  SessionEnded: undefined;
  NavigateTo: { sectionName: string };
};

type BotProjectEvents = {
  CreateNewBotProjectUsingNewButton: undefined;
  CreateNewBotProjectNextButton: undefined;
  CreateNewBotProjectFromExample: undefined;
  CreateNewBotProjectCompleted: undefined;
  BotProjectOpened: undefined;
};

type DesignerEvents = {
  ActionAdded: { type: string };
  ActionDeleted: { type: string };
  EditModeToggled: undefined;
  HelpLinkClicked: { url: string };
  ToolTipOpened: undefined;
  ToolbarButtonClicked: { name: string };
  EmulatorButtonClicked: undefined;
  LeftMenuExpanded: undefined;
  LeftMenuCollapsed: undefined;
  LeftMenuFilterUsed: undefined;
  TooltipOpened: undefined;
  NewTriggerStarted: undefined;
  NewTriggerCompleted: { kind: string };
  NewDialogAdded: undefined;
  AddNewSkillStarted: undefined;
  AddNewSkillCompleted: undefined;
  UseCustomRuntimeToggle: undefined;
  NewTemplateAdded: undefined;
};

type QnaEvents = {
  NewKnowledgeBaseStarted: undefined;
  NewKnowledgeBaseCreated: undefined;
  NewQnAPair: undefined;
  AlternateQnAPhraseAdded: undefined;
  QnAEditModeToggled: undefined;
};

type PublishingEvents = {
  NewPublishingProfileStarted: undefined;
  NewPublishingProfileSaved: undefined;
  PublishingProfileStarted: undefined;
  PublishingProfileCompleted: undefined;
};

type OtherEvents = {};

export type TelemetryEvents = BotProjectEvents &
  DesignerEvents &
  OtherEvents &
  SessionEvents &
  PublishingEvents &
  QnaEvents;

export type TelemetryEventName = keyof TelemetryEvents;

export type TelemetrySettings = {
  allowDataCollection?: boolean | null;
};

export type ServerSettings = {
  telemetry?: TelemetrySettings;
};

export type EventLogger = {
  log: <TN extends TelemetryEventName>(
    eventName: TN,
    ...args: TelemetryEvents[TN] extends undefined ? [never?] : [TelemetryEvents[TN]]
  ) => void;
};
