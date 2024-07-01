import Device from '../../../data/database/model/Device';
import logger from '../../../logger';
import ContainerRegistryUseCases from '../../../use-cases/ContainerRegistryUseCases';
import DeviceUseCases from '../../../use-cases/DeviceUseCases';
import Custom from '../registries/providers/custom/Custom';
import Ecr from '../registries/providers/ecr/Ecr';
import Forgejo from '../registries/providers/forgejo/Forgejo';
import Gcr from '../registries/providers/gcr/Gcr';
import Ghcr from '../registries/providers/ghcr/Ghcr';
import Gitea from '../registries/providers/gitea/Gitea';
import Gitlab from '../registries/providers/gitlab/Gitlab';
import Hub from '../registries/providers/hub/Hub';
import Lscr from '../registries/providers/lscr/Lscr';
import providerConf from '../registries/providers/provider.conf';
import Quay from '../registries/providers/quay/Quay';
import Registry from '../registries/Registry';
import { SSMServicesTypes } from '../../../types/typings';
import Docker from '../watchers/providers/docker/Docker';
import Component, { Kind } from './Component';

/**
 * Registry state.
 */
type stateType = {
  registry: Registry[];
  watcher: Docker[];
};

const state: stateType = {
  registry: [],
  watcher: [],
};

function getStates() {
  return state;
}

/**
 * Return all supported registries
 * @returns {*}
 */
export function getRegistries(): Registry[] {
  return getStates().registry;
}

function getComponentClass(
  kind: Kind,
  provider: string,
): Component<SSMServicesTypes.ConfigurationSchema> {
  switch (`${kind}/${provider}`) {
    case 'watcher/docker':
      return new Docker();
    case 'registry/hub':
      return new Hub();
    case 'registry/custom':
      return new Custom();
    case 'registry/gcr':
      return new Gcr();
    case 'registry/ghcr':
      return new Ghcr();
    case 'registry/quay':
      return new Quay();
    case 'registry/ecr':
      return new Ecr();
    case 'registry/gitea':
      return new Gitea();
    case 'registry/forgejo':
      return new Forgejo();
    case 'registry/lscr':
      return new Lscr();
    case 'registry/gitlab':
      return new Gitlab();
    default:
      throw new Error(`Unknown kind.provider: ${kind}/${provider}`);
  }
}

/**
 * Register a component.
 *
 * @param _id
 * @param {*} kind
 * @param {*} provider
 * @param {*} name
 * @param {*} configuration
 */
async function registerComponent(
  _id: string,
  kind: Kind,
  provider: string,
  name: string,
  configuration: SSMServicesTypes.ConfigurationSchema,
) {
  const providerLowercase = provider.toLowerCase();
  const nameLowercase = name.toLowerCase();
  try {
    logger.info(`Registering "${provider}/${name}" component`);
    const component = getComponentClass(kind, provider);
    const componentRegistered = await component.register(
      _id,
      kind,
      providerLowercase,
      nameLowercase,
      configuration,
    );
    switch (kind) {
      case Kind.WATCHER:
        state.watcher[componentRegistered.getId()] = componentRegistered;
        break;
      case Kind.REGISTRY:
        state.registry[componentRegistered.getId()] = componentRegistered;
        break;
      default:
        throw new Error(`Unknown registering component: ${componentRegistered.getId()}`);
    }
    return componentRegistered;
  } catch (e: any) {
    logger.error(
      `Error when registering component ${providerLowercase}/${nameLowercase} (${e.message})`,
    );
  }
}
/**
 * Register watchers from database.
 * @returns {Promise}
 */
async function registerWatchers(): Promise<any> {
  const devicesToWatch = await DeviceUseCases.getDevicesToWatch();

  try {
    const watchersToRegister: any = [];
    devicesToWatch?.map((device) => {
      watchersToRegister.push(
        registerComponent(device._id, Kind.WATCHER, 'docker', `docker-${device.uuid}`, {
          cron: device.dockerWatcherCron as string,
          watchbydefault: true,
          deviceUuid: device.uuid,
          watchstats: device.dockerStatsWatcher,
          cronstats: device.dockerStatsCron as string,
          watchevents: device.dockerEventsWatcher,
        }),
      );
    });
    await Promise.all(watchersToRegister);
  } catch (e: any) {
    logger.warn(`Some watchers failed to register (${e.message})`);
    logger.debug(e);
  }
}

/**
 * Register watcher.
 * @returns {Promise}
 */
async function registerWatcher(device: Device): Promise<any> {
  try {
    await registerComponent(device._id, Kind.WATCHER, 'device', `docker-${device.uuid}`, {
      cron: device.dockerWatcherCron as string,
      watchbydefault: true,
      deviceUuid: device.uuid,
      watchstats: device.dockerStatsWatcher,
      cronstats: device.dockerStatsCron as string,
      watchevents: device.dockerEventsWatcher,
    });
  } catch (e: any) {
    logger.warn(`Some watchers failed to register (${e.message})`);
    logger.debug(e);
  }
}
/**
 * Register registries.
 * @returns {Promise}
 */
async function registerRegistries() {
  const containerRegistries = await ContainerRegistryUseCases.listAllSetupRegistries();
  const registriesToRegister: Record<string, any> = {};

  // Default anonymous registries, will be overrode if a connected one exist
  providerConf
    .filter((e) => e.default)
    .map((e) => {
      registriesToRegister[e.name] = async () =>
        registerComponent('default', Kind.REGISTRY, e.provider, e.name, {});
    });
  try {
    containerRegistries?.map((registry) => {
      registriesToRegister[registry.provider] = async () =>
        registerComponent(registry._id, Kind.REGISTRY, registry.provider, registry.name, {
          ...{
            name: registry.name,
            provider: registry.provider,
          },
          ...registry.auth,
        });
    });
    logger.info('[STATES] Configuration registered will be processed...');
    await Promise.all(
      Object.values(registriesToRegister)
        .sort()
        .map((registerFn) => registerFn()),
    );
  } catch (e: any) {
    logger.warn(`[STATES] Some registries failed to register (${e.message})`);
    logger.debug(e);
  }
}

/**
 * Deregister a component.
 * @param component
 * @param kind
 * @returns {Promise}
 */
async function deregisterComponent(
  kind: Kind,
  component: Component<SSMServicesTypes.ConfigurationSchema>,
): Promise<any> {
  try {
    await component.deregister();
  } catch (e) {
    throw new Error(`Error when de-registering component ${component.getId()}`);
  } finally {
    let components: Registry[] | Docker[] | undefined = undefined;

    switch (kind) {
      case Kind.WATCHER:
        components = getStates().watcher;
        break;
      case Kind.REGISTRY:
        components = getStates().registry;
        break;
      default:
        logger.error(`[WATCHER-ENGINE] Unknown kind ${kind}`);
    }
    if (components) {
      delete components[component.getId()];
    }
  }
}

/**
 * Deregister all components of kind.
 * @param components
 * @param kind
 * @returns {Promise}
 */
async function deregisterComponents(
  kind: Kind,
  components: Component<SSMServicesTypes.ConfigurationSchema>[],
): Promise<any> {
  const deregisterPromises = components.map(async (component) =>
    deregisterComponent(kind, component),
  );
  return Promise.all(deregisterPromises);
}

/**
 * Deregister all registries.
 * @returns {Promise}
 */
async function deregisterRegistries(): Promise<any> {
  return deregisterComponents(Kind.REGISTRY, Object.values(getStates().registry));
}

/**
 * Deregister all registries.
 * @returns {Promise}
 */
async function deregisterWatchers(): Promise<any> {
  return deregisterComponents(Kind.WATCHER, Object.values(getStates().watcher));
}

/**
 * Deregister all components.
 * @returns {Promise}
 */
async function deregisterAll(): Promise<any> {
  logger.warn('[WATCHER-ENGINE] All registered providers will be deregistered.');
  try {
    await deregisterRegistries();
    await deregisterWatchers();
  } catch (e: any) {
    throw new Error(`Error when trying to deregister ${e.message}`);
  }
}

async function init() {
  // Register registries
  await registerRegistries();
  // Register Watchers
  await registerWatchers();
  // Gracefully exit when possible
  process.on('SIGINT', deregisterAll);
  process.on('SIGTERM', deregisterAll);
}

function buildId(kind: Kind, provider: string, name: string) {
  return `${kind}.${provider}.${name}`;
}

export default {
  getStates,
  init,
  deregisterRegistries,
  registerRegistries,
  deregisterWatchers,
  registerWatchers,
  deregisterAll,
  buildId,
  registerWatcher,
};
