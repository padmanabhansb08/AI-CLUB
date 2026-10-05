const fs = require('fs');

function replaceFile(path, regex, replacement) {
  let text = fs.readFileSync(path, 'utf8');
  text = text.replace(regex, replacement);
  fs.writeFileSync(path, text);
}

const files = [
  'src/pages/admin/AdminEventDetail.tsx',
  'src/pages/admin/AdminEvents.tsx',
  'src/pages/EventDetail.tsx',
  'src/pages/Events.tsx'
];

files.forEach(f => {
  replaceFile(f, /import \{ useState \} from 'react';/, "import { useState, useEffect } from 'react';");
});

replaceFile('src/pages/Profile.tsx', /import \{ User, Mail, Shield, BookOpen, Briefcase, GraduationCap, Code, ArrowRight, Github \} from 'lucide-react';/, "import { User, Mail, Shield, GraduationCap, ArrowRight, Github } from 'lucide-react';");
