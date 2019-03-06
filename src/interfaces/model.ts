import { Charge } from '../models/charge';
import { Kickboard } from '../models/kickboard';
import { Placement } from '../models/placement';
import { Ride } from '../models/ride';
import { User } from '../models/user';

export interface Model {
  Charge: Charge;
  Kickboard: Kickboard;
  Placement: Placement;
  Ride: Ride;
  User: User;
}
