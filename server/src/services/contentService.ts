import { achievementRepo } from '../repositories/achievementRepository';
import { updateRepo } from '../repositories/updateRepository';
import { projectRepo } from '../repositories/projectRepository';
import { courseRepo } from '../repositories/courseRepository';
import { memberRepo } from '../repositories/memberRepository';

export const contentService = {
  getMembers: memberRepo.findAll,
  getMemberById: memberRepo.findById,
  
  getAchievements: achievementRepo.findAll,
  getAchievementById: achievementRepo.findById,
  createAchievement: achievementRepo.create,
  updateAchievement: achievementRepo.update,
  deleteAchievement: achievementRepo.delete,

  getUpdates: updateRepo.findAll,
  getUpdateById: updateRepo.findById,
  createUpdate: updateRepo.create,
  updateUpdate: updateRepo.update,
  deleteUpdate: updateRepo.delete,

  getProjects: projectRepo.findAll,
  getProjectById: projectRepo.findById,
  createProject: projectRepo.create,
  updateProject: projectRepo.update,
  deleteProject: projectRepo.delete,
  addProjectInterest: projectRepo.addInterest,
  removeProjectInterest: projectRepo.removeInterest,

  getCourses: courseRepo.findAll,
  getCourseById: courseRepo.findById,
  createCourse: courseRepo.create,
  updateCourse: courseRepo.update,
  deleteCourse: courseRepo.delete,
  getCourseProgress: courseRepo.getProgress,
  getCourseProgressByUserId: courseRepo.getProgressByUserId
};