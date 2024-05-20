import { IsNotEmpty } from 'class-validator';

export type Location = {
  location: string;
  position: {
    lat: number;
    lng: number;
  };
};
export class CreateRoadDto {
  @IsNotEmpty()
  finishMark: Location;
  @IsNotEmpty()
  startMark: Location;
  @IsNotEmpty()
  waypoints: Location[];
  @IsNotEmpty()
  title: string;
}
