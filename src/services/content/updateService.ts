import { Repository } from './repository';
import type { Update } from '../../data/updates';

export const updateService = new Repository<Update>('/updates');
