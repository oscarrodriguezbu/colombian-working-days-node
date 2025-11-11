import { Router } from 'express';
import { WorkingDaysRoutes } from './workingDays/routes';

export class AppRoutes {
  static get routes(): Router {
    const router = Router();
    router.use('/api/working-days', WorkingDaysRoutes.routes);
    return router;
  }
}