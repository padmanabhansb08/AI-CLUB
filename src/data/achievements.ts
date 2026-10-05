export type AchievementType = 'individual' | 'team';

export interface Achievement {
  id: string;
  type: AchievementType;
  category: string;
  title: string;
  description: string;
  studentName?: string;
  teamName?: string;
  teamMembers?: string[];
  organization?: string;
  eventName?: string;
  date?: string;
  year: string;
  technologies?: string[];
  externalUrl?: string;
  projectUrl?: string;
  featured?: boolean;
}

export const mockAchievements: Achievement[] = [
  {
    id: 'a1',
    type: 'team',
    category: 'Hackathons',
    title: 'National AI Hackathon Finalists',
    description: 'Developed an innovative LLM-based autonomous agent for processing unstructured municipal data. Reached the finals out of 500 participating teams.',
    teamName: 'CODE-STREAK',
    teamMembers: ['Arun Kumar', 'Priya S', 'Rahul M'],
    organization: 'Tech Foundation India',
    eventName: 'AI Innovation Challenge',
    date: 'March 2026',
    year: '2026',
    technologies: ['Python', 'PyTorch', 'LangChain'],
    featured: true
  },
  {
    id: 'a2',
    type: 'individual',
    category: 'Research',
    title: 'Publication: Multimodal AI Efficiency',
    description: 'Published a paper on efficient token pruning in multimodal large language models, significantly reducing inference latency.',
    studentName: 'Priya S',
    organization: 'IEEE',
    eventName: 'International Conference on Machine Learning Applications',
    date: 'February 2026',
    year: '2026',
    technologies: ['PyTorch', 'Transformers']
  },
  {
    id: 'a3',
    type: 'individual',
    category: 'Projects',
    title: 'AI Campus Assistant Deployed',
    description: 'Successfully deployed a RAG-based campus assistant used by over 2000 students to navigate schedules, syllabi, and club events.',
    studentName: 'Rahul M',
    organization: 'College Admin',
    year: '2025',
    technologies: ['React', 'Node.js', 'Pinecone', 'OpenAI'],
    projectUrl: 'https://campus-assistant.demo'
  },
  {
    id: 'a4',
    type: 'individual',
    category: 'Certifications',
    title: 'Google Cloud Professional Machine Learning Engineer',
    description: 'Achieved professional certification for designing, building, and productionizing ML models on GCP.',
    studentName: 'Neha Verma',
    organization: 'Google Cloud',
    date: 'December 2025',
    year: '2025'
  },
  {
    id: 'a5',
    type: 'team',
    category: 'Competitions',
    title: 'Kaggle NLP Challenge Top 5%',
    description: 'Secured a silver medal in the global Kaggle challenge for detecting medical anomalies in clinical text.',
    teamName: 'Neural Ninjas',
    teamMembers: ['Siddharth Rao', 'Ananya Gupta'],
    organization: 'Kaggle',
    eventName: 'Clinical NLP Prediction',
    year: '2025',
    technologies: ['Python', 'HuggingFace', 'Pandas']
  },
  {
    id: 'a6',
    type: 'individual',
    category: 'Open Source',
    title: 'Core Contributor to Transformers Library',
    description: 'Merged multiple PRs into the HuggingFace transformers repository, improving the memory efficiency of attention mechanisms.',
    studentName: 'Vikram Singh',
    organization: 'HuggingFace',
    year: '2025',
    technologies: ['Python', 'PyTorch']
  },
  {
    id: 'a7',
    type: 'team',
    category: 'Hackathons',
    title: 'Winner: Sustainability Tech Sprint',
    description: 'Built an AI-driven optimization tool for campus energy grid management, winning the first prize.',
    teamName: 'GreenTech AI',
    teamMembers: ['Arun Kumar', 'Deepak N'],
    organization: 'Global Green Foundation',
    eventName: 'Sustainability Tech Sprint 2025',
    year: '2025',
    technologies: ['TensorFlow', 'React']
  },
  {
    id: 'a8',
    type: 'individual',
    category: 'Certifications',
    title: 'DeepLearning.AI TensorFlow Developer',
    description: 'Completed the rigorous TensorFlow developer professional certificate.',
    studentName: 'Amit Patel',
    organization: 'DeepLearning.AI',
    year: '2026'
  },
  {
    id: 'a9',
    type: 'individual',
    category: 'Research',
    title: 'Poster Presentation at NeurIPS Workshop',
    description: 'Presented a poster on low-rank adaptation techniques for small language models.',
    studentName: 'Priya S',
    organization: 'NeurIPS',
    eventName: 'Efficient ML Workshop',
    date: 'December 2025',
    year: '2025'
  },
  {
    id: 'a10',
    type: 'team',
    category: 'Projects',
    title: 'Autonomous Drone Navigation System',
    description: 'Developed an edge-AI system for drones to navigate indoor environments without GPS, featured in the annual tech symposium.',
    teamName: 'AeroAI',
    teamMembers: ['Karan S', 'Neha Verma', 'Rohit T'],
    eventName: 'Annual Tech Symposium',
    year: '2026',
    technologies: ['C++', 'ROS', 'OpenCV', 'YOLO']
  },
  {
    id: 'a11',
    type: 'individual',
    category: 'Open Source',
    title: 'Created popular VSCode Extension',
    description: 'Built and published an AI-powered code review extension that reached 10,000+ downloads on the marketplace.',
    studentName: 'Rahul M',
    year: '2025',
    technologies: ['TypeScript', 'VSCode API']
  },
  {
    id: 'a12',
    type: 'individual',
    category: 'Other',
    title: 'Selected for Top Tier Summer Internship',
    description: 'Secured a highly competitive AI research internship at a leading technology firm.',
    studentName: 'Ananya Gupta',
    organization: 'Leading Tech Firm',
    year: '2026'
  },
  {
    id: 'a13',
    type: 'team',
    category: 'Competitions',
    title: 'Robotics Vision Challenge Finalists',
    description: 'Ranked 3rd in the national robotics vision challenge for object manipulation.',
    teamName: 'Visionaries',
    teamMembers: ['Vikram Singh', 'Deepak N'],
    organization: 'Robotics Society',
    year: '2025',
    technologies: ['Python', 'OpenCV', 'PyTorch']
  },
  {
    id: 'a14',
    type: 'individual',
    category: 'Certifications',
    title: 'AWS Certified Machine Learning – Specialty',
    description: 'Earned the AWS ML Specialty certification, demonstrating expertise in AWS AI services.',
    studentName: 'Siddharth Rao',
    organization: 'AWS',
    year: '2026'
  }
];
