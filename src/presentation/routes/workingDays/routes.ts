// src/routes/workingDays/routes.ts
import { Router } from 'express';
import { WorkingDaysService } from '../../services';
import { WorkingDaysController } from './controller';

export class WorkingDaysRoutes {
  static get routes(): Router {
    const router = Router();
    const service = new WorkingDaysService();
    const controller = new WorkingDaysController(service);

    router.get('/', controller.calculate);

    return router;
  }
}
