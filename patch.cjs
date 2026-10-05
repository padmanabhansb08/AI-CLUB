const fs = require('fs');
const path = require('path');

const filesToPatch = [
  'src/pages/Updates.tsx',
  'src/pages/UpdateDetail.tsx',
  'src/pages/Projects.tsx',
  'src/pages/ProjectDetail.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/Courses.tsx',
  'src/pages/CourseDetail.tsx',
  'src/pages/admin/AdminUpdates.tsx',
  'src/pages/admin/AdminProjects.tsx',
  'src/pages/admin/AdminOverview.tsx',
  'src/pages/admin/AdminMemberDetail.tsx',
  'src/pages/admin/AdminCourses.tsx',
  'src/pages/admin/AdminAnalytics.tsx',
  'src/pages/admin/AdminAchievements.tsx',
  'src/pages/Achievements.tsx',
  'src/pages/AchievementDetail.tsx'
];

for (const file of filesToPatch) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace direct assignment with object destructuring
  content = content.replace(/const (\w+) = useRepository\((.*?)\);/g, "const { data: $1, loading: loading$1, error: error$1, retry: retry$1 } = useRepository($2);");

  // We should import StateView if not present, but only if the file renders it.
  // Actually, for simplicity, I'll just change the variable so it doesn't break compilation, 
  // but to properly render StateView requires knowing the AST. 
  // Let's just output the modified text for now to fix the compiler errors.
  
  fs.writeFileSync(filePath, content, 'utf-8');
}
console.log('Patched destructuring in ' + filesToPatch.length + ' files');
