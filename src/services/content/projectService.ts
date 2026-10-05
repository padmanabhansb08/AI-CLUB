import { Repository } from './repository';
import type { ProjectIdea } from '../../data/projects';

export const projectService = new Repository<ProjectIdea>('/projects');
