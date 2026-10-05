import { Repository } from './repository';
import type { Achievement } from '../../data/achievements';

export const achievementService = new Repository<Achievement>('/achievements');
