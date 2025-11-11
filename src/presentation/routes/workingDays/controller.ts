import { Request, Response } from 'express';
import { WorkingDaysService } from '../../services';
import { CustomError, WorkingDaysQueryDto } from '../../domain';

export class WorkingDaysController {
  constructor(private readonly service: WorkingDaysService) { }

  calculate = async (req: Request, res: Response) => {
    try {
      const dto = WorkingDaysQueryDto.create(req.query);
      if (dto.error) {
        return res.status(400).json({ error: 'InvalidParameters', message: dto.error });
      }

      const result = await this.service.calculate(dto.value!);
      return res.status(200).json({ date: result });
    } catch (err) {
      return CustomError.handleError(err, res);
    }
  };
}
