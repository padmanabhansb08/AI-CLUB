import { seed } from './001_initial_seed';
import { seedQuestionsAndApplicants } from './002_assessment_questions';
import { pool } from '../index';

export async function runAllSeeds() {
  console.log('[seeds] 1/2 Running core development accounts, courses, and events seed...');
  await seed();
  console.log('[seeds] 2/2 Running 25-MCQ assessment question bank and applicant profiles seed...');
  await seedQuestionsAndApplicants();
  console.log('[seeds] ✓ All database seeds executed successfully.');
}

if (require.main === module || process.argv[1]?.includes('seeds')) {
  runAllSeeds()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[seeds] Error executing seeds:', err);
      await pool.end();
      process.exit(1);
    });
}
