import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class SimulateEventDto {
  @IsString()
  @IsNotEmpty()
  sensor!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['OPEN', 'CLOSED', 'MOTION_DETECTED', 'TAMPERED'], {
    message: 'Status must be a valid sensor state',
  })
  status!: string;
}