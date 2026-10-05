const fs = require('fs');
const path = require('path');

const files = [
  { name: 'src/pages/Updates.tsx', var: 'mockUpdates', listClass: 'updates-list', empty: 'No updates found.' },
  { name: 'src/pages/Projects.tsx', var: 'mockProjects', listClass: 'projects-grid', empty: 'No projects found.' },
  { name: 'src/pages/Courses.tsx', var: 'mockCourses', listClass: 'courses-list', empty: 'No courses found.' },
  { name: 'src/pages/Achievements.tsx', var: 'mockAchievements', listClass: 'achievements-list', empty: 'No achievements found.' },
  
  { name: 'src/pages/admin/AdminUpdates.tsx', var: 'updates', listClass: 'admin-table-container', empty: 'No updates found.' },
  { name: 'src/pages/admin/AdminProjects.tsx', var: 'projects', listClass: 'admin-table-container', empty: 'No projects found.' },
  { name: 'src/pages/admin/AdminCourses.tsx', var: 'courses', listClass: 'admin-table-container', empty: 'No courses found.' },
  { name: 'src/pages/admin/AdminAchievements.tsx', var: 'achievements', listClass: 'admin-table-container', empty: 'No achievements found.' }
];

for (const f of files) {
  const filePath = path.join(__dirname, f.name);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // add import if missing
  if (!content.includes('StateView')) {
    content = content.replace("import React", "import React from 'react';\nimport { StateView } from '../components/common/StateView';\n//");
    content = content.replace("import { StateView } from '../components/common/StateView';\n// from 'react';", "import { StateView } from '../components/common/StateView';\n");
    // fix admin path
    if (f.name.includes('admin')) {
      content = content.replace("'../components/common/StateView'", "'../../components/common/StateView'");
    }
  }

  // wrap the list class
  const regex = new RegExp(\`<div className="\${f.listClass}">([\\s\\S]*?)<\\/div>\\s*<\\/div>\`, 'g');
  
  // Actually, regex matching HTML is very fragile. Let's just find the first `<div className="f.listClass">` and the corresponding closing div, or just replace `<div className="${f.listClass}">` with `<StateView...><div...>` and then append `</StateView>`.
  
  // A simpler way: replace the exact opening and assume the structure. 
  // Let's do it manually via regex:
  
  content = content.replace(
    new RegExp(\`<div className="\${f.listClass}">\`),
    \`<StateView loading={loading\${f.var}} error={error\${f.var}} retry={retry\${f.var}} empty={\${f.var}.length === 0} emptyMessage="\${f.empty}">\\n          <div className="\${f.listClass}">\`
  );
  
  // we need to close </StateView>. This is tricky without AST.
}
