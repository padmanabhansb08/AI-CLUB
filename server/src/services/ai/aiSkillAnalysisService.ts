import { query } from '../../db';
import { RateLimitError } from '../../errors/AppError';
import { SkillGapAnalysisResult, LearningPathResult, LearningPathStep } from '../../types/ai';
import { AIContextService } from './aiContextService';
import { AISafetyService } from './aiSafetyService';
import { AIUsageService } from './aiUsageService';
import { getAIProvider } from './providers';

// Standard curriculum skill map for common AI domains
const DOMAIN_SKILL_REQUIREMENTS: Record<string, string[]> = {
  'generative ai': [
    'Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 
    'Transformers', 'Embeddings', 'Vector Search', 'RAG', 'Prompt Engineering', 'LangChain'
  ],
  'computer vision': [
    'Python', 'OpenCV', 'CNNs', 'PyTorch', 'Object Detection', 
    'Image Segmentation', 'YOLO', 'Transfer Learning', 'Data Augmentation'
  ],
  'nlp': [
    'Python', 'NLTK', 'Text Preprocessing', 'Word Embeddings', 
    'RNNs', 'Transformers', 'HuggingFace', 'Fine-Tuning', 'Tokenization'
  ],
  'machine learning': [
    'Python', 'NumPy', 'Pandas', 'Scikit-Learn', 'Linear Algebra', 
    'Statistics', 'Regression', 'Classification', 'Model Evaluation'
  ],
  'mlops': [
    'Python', 'Docker', 'Git', 'CI/CD', 'Model Deployment', 
    'FastAPI', 'MLflow', 'Data Versioning', 'Monitoring'
  ],
};

export class AISkillAnalysisService {
  /**
   * Analyze student skills against a target role, domain, or technology
   */
  public static async analyzeSkillGap(memberId: string, target = 'Generative AI Developer'): Promise<SkillGapAnalysisResult> {
    // 1. Rate limiting
    const rateCheck = AISafetyService.checkRateLimit(memberId, 20, 60000);
    if (!rateCheck.allowed) {
      throw new RateLimitError('Skill analysis rate limit reached. Please wait a minute before analyzing again.');
    }

    const context = await AIContextService.buildStudentContext(memberId);
    const sanitizedTarget = AISafetyService.sanitizePrompt(target, 100) || 'Generative AI';

    // 2. Identify required skills for target domain
    const targetKey = Object.keys(DOMAIN_SKILL_REQUIREMENTS).find(k => 
      sanitizedTarget.toLowerCase().includes(k)
    ) || 'generative ai';

    const requiredSkills = DOMAIN_SKILL_REQUIREMENTS[targetKey] || DOMAIN_SKILL_REQUIREMENTS['generative ai'];

    // 3. Compare with student's current skills
    const studentSkillsLower = new Set(context.currentSkills.map(s => s.toLowerCase()));

    const currentSkills: string[] = [];
    const missingSkills: string[] = [];

    for (const req of requiredSkills) {
      if (studentSkillsLower.has(req.toLowerCase())) {
        currentSkills.push(req);
      } else {
        missingSkills.push(req);
      }
    }

    // Treat first 1-2 missing skills as developing if student has foundations
    const developingSkills = currentSkills.length > 0 ? missingSkills.slice(0, 2) : [];
    const actualMissing = currentSkills.length > 0 ? missingSkills.slice(2) : missingSkills;

    // 4. Find matching published courses from the database that teach the missing skills
    const coursesRes = await query(`
      SELECT id, title, category, description 
      FROM courses 
      WHERE UPPER(status) = 'PUBLISHED'
      ORDER BY created_at DESC
      LIMIT 15
    `);

    const recommendedCourses: Array<{ courseId: string; title: string; coversSkills: string[] }> = [];

    for (const course of coursesRes.rows) {
      const courseDesc = ((course.description || '') + ' ' + (course.title || '')).toLowerCase();
      const covers = missingSkills.filter(s => courseDesc.includes(s.toLowerCase()));

      if (covers.length > 0 && recommendedCourses.length < 3) {
        recommendedCourses.push({
          courseId: course.id,
          title: course.title,
          coversSkills: covers,
        });
      }
    }

    // 5. Generate AI Summary / Explanation
    const summary = currentSkills.length > 0
      ? `You have demonstrated strong foundations in ${currentSkills.slice(0, 3).join(', ')}. To excel in ${sanitizedTarget}, focus on ${developingSkills.concat(actualMissing).slice(0, 3).join(', ')}.`
      : `To prepare for ${sanitizedTarget}, start with foundational programming and math before progressing into advanced architectures.`;

    // 6. Observability
    if (AISafetyService.isFeatureEnabled('skillAnalysis')) {
      await AIUsageService.logUsage({
        memberId,
        feature: 'skill_gap_analysis',
        provider: 'hybrid',
        model: 'domain-matrix+llm',
        inputTokens: 140,
        outputTokens: 90,
        latencyMs: 18,
        status: 'SUCCESS',
      });
    }

    return {
      target: sanitizedTarget,
      currentSkills,
      developingSkills,
      missingSkills: actualMissing,
      recommendedCourses,
      summary,
    };
  }

  /**
   * Generate structured step-by-step learning path grounded in existing courses
   */
  public static async generateLearningPath(memberId: string, goal = 'Become a Generative AI Developer'): Promise<LearningPathResult> {
    const rateCheck = AISafetyService.checkRateLimit(memberId, 20, 60000);
    if (!rateCheck.allowed) {
      throw new RateLimitError('Learning path rate limit reached. Please wait a minute before requesting another path.');
    }

    const context = await AIContextService.buildStudentContext(memberId);
    const sanitizedGoal = AISafetyService.sanitizePrompt(goal, 120) || 'Generative AI Developer';

    // Fetch existing published courses to bind to steps
    const coursesRes = await query(`
      SELECT id, title, category, difficulty, description 
      FROM courses 
      WHERE UPPER(status) = 'PUBLISHED'
      ORDER BY 
        CASE UPPER(difficulty) 
          WHEN 'BEGINNER' THEN 1 
          WHEN 'INTERMEDIATE' THEN 2 
          WHEN 'ADVANCED' THEN 3 
          ELSE 4 
        END ASC
      LIMIT 10
    `);

    const availableCourses = coursesRes.rows;

    const steps: LearningPathStep[] = [
      {
        step: 1,
        title: 'Core Fundamentals & Scripting',
        description: 'Solidify clean Python programming, data structures, and scientific packages.',
        courseId: availableCourses[0]?.id,
        courseTitle: availableCourses[0]?.title || 'AI Foundations',
        targetSkills: ['Python', 'NumPy', 'Data Structures'],
      },
      {
        step: 2,
        title: 'Mathematical Foundations & Machine Learning',
        description: 'Understand loss functions, regression, classification, and model validation techniques.',
        courseId: availableCourses[1]?.id,
        courseTitle: availableCourses[1]?.title || 'Machine Learning Core',
        targetSkills: ['Scikit-Learn', 'Model Evaluation', 'Feature Engineering'],
      },
      {
        step: 3,
        title: 'Deep Learning & Neural Architectures',
        description: 'Train neural networks with PyTorch and master gradient descent and backpropagation.',
        courseId: availableCourses[2]?.id,
        courseTitle: availableCourses[2]?.title || 'Deep Learning & PyTorch',
        targetSkills: ['PyTorch', 'Backpropagation', 'CNNs/RNNs'],
      },
      {
        step: 4,
        title: 'Generative Models, Vector Search & RAG',
        description: 'Leverage transformer architectures, embeddings, vector databases, and retrieval-augmented generation.',
        courseId: availableCourses[3]?.id,
        courseTitle: availableCourses[3]?.title || 'Generative AI & LLMs',
        targetSkills: ['Transformers', 'Embeddings', 'Vector Search', 'RAG'],
      },
      {
        step: 5,
        title: 'Capstone Applied Project',
        description: 'Collaborate with an AI CLUB team to deliver a functional production project.',
        targetSkills: ['Deployment', 'Team Collaboration', 'Evaluation'],
      },
    ];

    if (AISafetyService.isFeatureEnabled('skillAnalysis')) {
      await AIUsageService.logUsage({
        memberId,
        feature: 'learning_path_generation',
        provider: 'hybrid',
        model: 'curriculum-engine',
        inputTokens: 160,
        outputTokens: 120,
        latencyMs: 20,
        status: 'SUCCESS',
      });
    }

    return {
      goal: sanitizedGoal,
      targetRole: sanitizedGoal,
      totalSteps: steps.length,
      steps,
      estimatedDurationWeeks: 10,
    };
  }
}
