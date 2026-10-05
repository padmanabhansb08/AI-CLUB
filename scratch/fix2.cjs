const fs = require('fs');
const files = [
  'src/components/DashboardProjectTeams.tsx',
  'src/components/MyProjectTeams.tsx',
  'src/components/ProjectTeamsSection.tsx',
  'src/pages/admin/AdminProjects.tsx',
  'src/services/content/projectTeamService.ts'
];
files.forEach(f => {
  let text = fs.readFileSync(f, 'utf8');
  text = text.replace(/import { ProjectTeam }/g, 'import type { ProjectTeam }');
  if (f.includes('MyProjectTeams') || f.includes('ProjectTeamsSection')) {
    text = text.replace(/import { StateView } from '.\/StateView';/g, "import { StateView } from './common/StateView';");
  }
  fs.writeFileSync(f, text);
});
