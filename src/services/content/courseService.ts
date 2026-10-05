import { Repository } from './repository';
import type { ExternalCourse } from '../../data/courses';

class CourseRepository extends Repository<ExternalCourse> {
  constructor() {
    super('/courses');
  }

  async fetchData() {
    await super.fetchData();
    // Map backend snake_case to frontend nested object
    this['data'] = this['data'].map((c: any) => ({
      ...c,
      tracking: {
        method: c.tracking_method || c.tracking?.method || 'none',
        status: c.tracking_status || c.tracking?.status || 'None',
        provider: c.tracking_provider || c.tracking?.provider
      },
      skills: c.skills || []
    }));
    // Cannot call private this.notify(), so we can't notify here if it's private in base class.
    // Wait, let's just intercept getAll()
  }

  getAll(): ExternalCourse[] {
    const raw = super.getAll();
    console.log('courseService.getAll() called. raw:', raw);
    return raw.map((c: any) => {
        if (c.tracking) return c; // Already mapped
        return {
            ...c,
            tracking: {
                method: c.tracking_method || 'none',
                status: c.tracking_status || 'None',
                provider: c.tracking_provider
            },
            skills: c.skills || []
        };
    });
  }
}

export const courseService = new CourseRepository();
