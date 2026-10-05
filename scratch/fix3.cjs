const fs = require('fs');

function replaceFile(path, regex, replacement) {
  let text = fs.readFileSync(path, 'utf8');
  text = text.replace(regex, replacement);
  fs.writeFileSync(path, text);
}

replaceFile('src/components/MyProjectTeams.tsx', /onRetry=\{fetchTeams\}/g, 'retry={fetchTeams}');
replaceFile('src/components/ProjectTeamsSection.tsx', /onRetry=\{fetchTeams\}/g, 'retry={fetchTeams}');

replaceFile('src/pages/admin/AdminEventDetail.tsx', /import React(,[^;]+)? from 'react';/, "import { useState } from 'react';");
replaceFile('src/pages/admin/AdminEvents.tsx', /import React(,[^;]+)? from 'react';/, "import { useState } from 'react';");
replaceFile('src/pages/EventDetail.tsx', /import React(,[^;]+)? from 'react';/, "import { useState } from 'react';");
replaceFile('src/pages/Events.tsx', /import React(,[^;]+)? from 'react';/, "import { useState } from 'react';");

replaceFile('src/pages/Dashboard.tsx', /import \{ ArrowRight, Trophy, AlertCircle \} from 'lucide-react';/, "import { ArrowRight, Trophy } from 'lucide-react';");

replaceFile('src/pages/Profile.tsx', /import \{ User, Mail, Shield, BookOpen, Briefcase, GraduationCap, Code, ArrowRight, Github \} from 'lucide-react';/, "import { User, Mail, Shield, GraduationCap, ArrowRight, Github } from 'lucide-react';");
