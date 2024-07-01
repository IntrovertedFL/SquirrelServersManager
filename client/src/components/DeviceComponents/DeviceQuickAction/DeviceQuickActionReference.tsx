import {
  BugOutlined,
  DeleteOutlined,
  DownloadOutlined,
  LoginOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  ShakeOutlined,
  ThunderboltOutlined,
  ToTopOutlined,
} from '@ant-design/icons';
import React from 'react';

export enum Types {
  PLAYBOOK = 'playbook',
  PLAYBOOK_SELECTION = 'playbook-selection',
  ACTION = 'action',
  DIVIDER = 'divider',
  SUBMENU = 'submenu',
}

export type QuickActionReferenceType = {
  type: Types;
  action?: string;
  playbookQuickRef?: string;
  label?: React.JSX.Element;
  onAdvancedMenu: boolean;
  children?: QuickActionReferenceType[];
};

export enum Actions {
  CONNECT = 'connect',
  DELETE = 'delete',
}

const DeviceQuickActionReference: QuickActionReferenceType[] = [
  {
    type: Types.PLAYBOOK_SELECTION,
    label: (
      <>
        <PlayCircleOutlined /> Execute a playbook
      </>
    ),
    onAdvancedMenu: false,
  },
  {
    type: Types.PLAYBOOK,
    playbookQuickRef: 'reboot',
    label: (
      <>
        <ReloadOutlined /> Reboot
      </>
    ),
    onAdvancedMenu: false,
  },
  {
    type: Types.ACTION,
    action: Actions.CONNECT,
    label: (
      <>
        <LoginOutlined /> Connect
      </>
    ),
    onAdvancedMenu: false,
  },
  {
    onAdvancedMenu: false,
    type: Types.DIVIDER,
  },
  {
    type: Types.PLAYBOOK,
    playbookQuickRef: 'ping',
    label: (
      <>
        <ShakeOutlined /> Ping
      </>
    ),
    onAdvancedMenu: false,
  },
  {
    onAdvancedMenu: true,
    type: Types.DIVIDER,
  },
  {
    type: Types.PLAYBOOK,
    playbookQuickRef: 'updateAgent',
    onAdvancedMenu: true,
    label: (
      <>
        <ToTopOutlined /> Update Agent
      </>
    ),
  },
  {
    type: Types.PLAYBOOK,
    playbookQuickRef: 'reinstallAgent',
    onAdvancedMenu: true,
    label: (
      <>
        <DownloadOutlined /> Reinstall Agent
      </>
    ),
  },
  {
    type: Types.PLAYBOOK,
    playbookQuickRef: 'restartAgent',
    onAdvancedMenu: true,
    label: (
      <>
        <ThunderboltOutlined /> Restart Agent
      </>
    ),
  },
  {
    type: Types.PLAYBOOK,
    onAdvancedMenu: true,
    playbookQuickRef: 'retrieveAgentLogs',
    label: (
      <>
        <BugOutlined /> Retrieve Agent Logs
      </>
    ),
  },
  {
    onAdvancedMenu: true,
    type: Types.DIVIDER,
  },
  {
    type: Types.PLAYBOOK,
    playbookQuickRef: 'uninstallAgent',
    onAdvancedMenu: true,
    label: (
      <>
        <DeleteOutlined /> Uninstall Agent
      </>
    ),
  },
  {
    type: Types.ACTION,
    action: Actions.DELETE,
    onAdvancedMenu: true,
    label: (
      <>
        <DeleteOutlined /> Delete device
      </>
    ),
  },
];

export default DeviceQuickActionReference;
