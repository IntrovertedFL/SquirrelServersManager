import { API } from 'ssm-shared-lib';
import { InternalError, NotFoundError } from '../../middlewares/api/ApiError';
import { SuccessResponse } from '../../middlewares/api/ApiResponse';
import DeviceRepo from '../../data/database/repository/DeviceRepo';
import asyncHandler from '../../middlewares/AsyncHandler';
import DeviceStatsUseCases from '../../use-cases/DeviceStatsUseCases';
import DeviceUseCases from '../../use-cases/DeviceUseCases';

export const updateDeviceAndAddDeviceStat = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  const deviceInfo: API.DeviceInfo = req.body;
  const device = await DeviceRepo.findOneByUuid(uuid);
  if (device == null) {
    throw new NotFoundError(`Device not found (${uuid})`);
  }
  await DeviceUseCases.updateDeviceFromJson(deviceInfo, device);
  await DeviceStatsUseCases.createStatIfMinInterval(deviceInfo, device);
  new SuccessResponse('Update device and add device stat successful').send(res);
});

export const getDeviceStatsByDeviceUuid = asyncHandler(async (req, res) => {
  const { uuid, type } = req.params;
  const { from = 24 } = req.query;

  const device = await DeviceRepo.findOneByUuid(uuid);
  if (device == null) {
    throw new NotFoundError(`Device not found ${uuid}`);
  }
  try {
    const stats = await DeviceStatsUseCases.getStatsByDeviceAndType(device, from as number, type);
    new SuccessResponse('Get device stats by device uuid successful', stats).send(res);
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});

export const getDeviceStatByDeviceUuid = asyncHandler(async (req, res) => {
  const { uuid, type } = req.params;

  const device = await DeviceRepo.findOneByUuid(uuid);
  if (device == null) {
    throw new NotFoundError(`Device not found ${uuid}`);
  }
  try {
    const stat = await DeviceStatsUseCases.getStatByDeviceAndType(device, type);
    new SuccessResponse('Get device stats by device uuid successful', stat ? stat[0] : null).send(
      res,
    );
  } catch (error: any) {
    throw new InternalError(error.message);
  }
});
