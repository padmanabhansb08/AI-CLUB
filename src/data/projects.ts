export interface ProjectResource {
  title: string;
  type: string; /* Documentation, Research Paper, GitHub, Dataset, Tutorial, Reference */
  url: string;
}

export interface ProjectIdea {
  id: string;
  title: string;
  slug?: string;
  shortDescription: string;
  description: string;
  category: string;
  domain?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'Open' | 'In Progress' | 'Completed' | 'Archived';
  technologies: string[];
  tags: string[];
  features?: string[];
  problem?: string;
  approach?: string;
  expectedOutcome?: string;
  skills?: string[];
  resources?: ProjectResource[];
  featured?: boolean;
  interestedCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export const mockProjects: ProjectIdea[] = [
  {
    id: 'p1',
    title: 'AI Campus Assistant',
    shortDescription: 'RAG-based assistant for campus facilities, departments, events, and student services.',
    description: 'A comprehensive campus assistant leveraging Retrieval-Augmented Generation to provide accurate, up-to-date information about university life.',
    category: 'Generative AI',
    domain: 'Education',
    difficulty: 'Intermediate',
    status: 'In Progress',
    technologies: ['Python', 'LangChain', 'Pinecone', 'React'],
    tags: ['RAG', 'LLM', 'Chatbot'],
    features: [
      'Natural language queries for campus events',
      'Integration with university calendar APIs',
      'Vector search across department handbooks',
      'Multi-platform accessibility (Web, Mobile)'
    ],
    problem: 'Students often struggle to find specific information buried in massive university websites and PDF handbooks. Administrative staff spend too much time answering repetitive queries.',
    approach: 'Build a data pipeline that scrapes and chunks university public data, embeds it using a modern embedding model, and stores it in a vector database. Use an open-source LLM to synthesize answers grounded in the retrieved context.',
    expectedOutcome: 'A fully functional web interface where students can ask questions and receive instant, cited answers based on official campus data.',
    skills: ['Vector Databases', 'Prompt Engineering', 'Data Pipeline Construction', 'Frontend Integration'],
    resources: [
      { title: 'LangChain Documentation', type: 'Documentation', url: 'https://python.langchain.com' },
      { title: 'Pinecone Vector DB', type: 'Reference', url: 'https://pinecone.io' }
    ],
    featured: true,
    interestedCount: 12
  },
  {
    id: 'p2',
    title: 'Research Paper Intelligence',
    shortDescription: 'System for extracting, comparing, summarizing, and connecting concepts across research papers.',
    description: 'An advanced literature review tool designed to help researchers synthesize vast amounts of academic papers quickly.',
    category: 'NLP',
    domain: 'Research Tools',
    difficulty: 'Intermediate',
    status: 'Open',
    technologies: ['Python', 'Embeddings', 'LLM', 'Vector Search'],
    tags: ['PDF Parsing', 'Summarization', 'Graph Database'],
    features: [
      'Automated extraction of methodology and results',
      'Semantic similarity search across a custom library',
      'Concept graph generation showing paper relationships'
    ],
    problem: 'Researchers spend hundreds of hours reading and cross-referencing papers. Existing tools don\'t effectively extract and synthesize methodologies across multiple papers automatically.',
    approach: 'Use specialized PDF parsing tools (like Nougat or GROBID) to extract text. Employ LLMs to generate structured summaries (method, dataset, results) and store embeddings to find overlapping research scopes.',
    expectedOutcome: 'A web dashboard where a user can upload a folder of PDFs and query them, receiving synthesized literature reviews.',
    skills: ['PDF Parsing', 'LLM API Integration', 'Graph Data Structures'],
    interestedCount: 8
  },
  {
    id: 'p3',
    title: 'Computer Vision Lab Monitor',
    shortDescription: 'Computer vision system for detecting specific laboratory conditions and events.',
    description: 'A safety and compliance monitoring system for chemistry and engineering labs using edge-deployed computer vision.',
    category: 'Computer Vision',
    domain: 'Safety',
    difficulty: 'Advanced',
    status: 'Open',
    technologies: ['Python', 'OpenCV', 'PyTorch', 'TensorRT'],
    tags: ['Edge AI', 'Object Detection', 'IoT'],
    features: [
      'PPE (Personal Protective Equipment) detection',
      'Unattended experiment alerts',
      'Spill detection'
    ],
    problem: 'Lab safety is critical, but continuous human monitoring is impossible. Unattended reactions or missing safety gear often go unnoticed until an incident occurs.',
    approach: 'Train a YOLO-based object detection model on custom lab safety datasets. Deploy the model on edge devices (e.g., Jetson Nano) connected to lab cameras for real-time inference without streaming sensitive video to the cloud.',
    expectedOutcome: 'A real-time monitoring dashboard and alert system that notifies lab managers of safety violations.',
    skills: ['Model Quantization', 'Edge Deployment', 'Real-time Video Processing'],
    featured: true,
    interestedCount: 15
  },
  {
    id: 'p4',
    title: 'AI Interview Simulator',
    shortDescription: 'An AI system that conducts technical interviews and produces structured feedback.',
    description: 'An interactive voice-and-text agent designed to help students practice technical and behavioral interviews.',
    category: 'AI Agents',
    domain: 'Career Tools',
    difficulty: 'Advanced',
    status: 'Open',
    technologies: ['LLM', 'Whisper API', 'TTS', 'React'],
    tags: ['Speech-to-Text', 'Agentic Workflow'],
    problem: 'Students lack access to high-quality, realistic technical interview practice before speaking with real recruiters.',
    approach: 'Combine a real-time transcription service (Whisper), an LLM orchestrated to follow a specific interviewer persona, and a Text-to-Speech engine. The agent will adapt its questions based on the user\'s previous answers.',
    expectedOutcome: 'A web app where a user can select a job role and complete a 15-minute voice-based interview, followed by a detailed performance report.',
    skills: ['Audio Processing', 'Stateful LLM Interactions', 'React Audio APIs'],
    interestedCount: 22
  },
  {
    id: 'p5',
    title: 'Smart Code Reviewer',
    shortDescription: 'Automated pull request reviewer that checks for security vulnerabilities and style violations.',
    description: 'A GitHub App that uses static analysis combined with LLMs to provide meaningful, actionable code review comments.',
    category: 'Developer Tools',
    domain: 'Software Engineering',
    difficulty: 'Intermediate',
    status: 'Completed',
    technologies: ['TypeScript', 'Node.js', 'GitHub Actions', 'OpenAI'],
    tags: ['DevSecOps', 'CI/CD'],
    interestedCount: 5
  },
  {
    id: 'p6',
    title: 'Autonomous Drone Navigator',
    shortDescription: 'Vision-based navigation system for drones in GPS-denied environments.',
    description: 'Using SLAM and deep reinforcement learning to allow small drones to navigate indoor spaces.',
    category: 'Robotics',
    domain: 'Autonomous Systems',
    difficulty: 'Advanced',
    status: 'In Progress',
    technologies: ['C++', 'ROS', 'PyTorch', 'Simulation'],
    tags: ['SLAM', 'Reinforcement Learning', 'Drones'],
    interestedCount: 18
  },
  {
    id: 'p7',
    title: 'Predictive Maintenance for Campus HVAC',
    shortDescription: 'Machine learning model predicting equipment failures based on IoT sensor data.',
    description: 'Analyzing historical temperature, vibration, and energy usage data to predict when campus HVAC systems will fail.',
    category: 'Machine Learning',
    domain: 'Infrastructure',
    difficulty: 'Intermediate',
    status: 'Open',
    technologies: ['Python', 'Scikit-Learn', 'Pandas', 'AWS'],
    tags: ['Time Series', 'Predictive Analytics'],
    interestedCount: 7
  },
  {
    id: 'p8',
    title: 'Medical Image Anomaly Detector',
    shortDescription: 'A federated learning approach to training models on MRI scans across different hospitals.',
    description: 'Building a privacy-preserving framework to train tumor detection models without sharing raw patient data.',
    category: 'AI',
    domain: 'Healthcare',
    difficulty: 'Advanced',
    status: 'Open',
    technologies: ['PyTorch', 'Flower', 'Docker'],
    tags: ['Federated Learning', 'Medical Imaging'],
    interestedCount: 14
  },
  {
    id: 'p9',
    title: 'Automated Meeting Minutes Generator',
    shortDescription: 'Tool that records club meetings, transcribes audio, and extracts action items.',
    description: 'A practical utility for the club to automatically document weekly meetings and assign tasks.',
    category: 'NLP',
    domain: 'Productivity',
    difficulty: 'Beginner',
    status: 'Completed',
    technologies: ['Python', 'Whisper', 'FastAPI'],
    tags: ['Transcription', 'Automation'],
    interestedCount: 4
  },
  {
    id: 'p10',
    title: 'Algorithmic Trading Sandbox',
    shortDescription: 'A platform to backtest reinforcement learning strategies on historical financial data.',
    description: 'Creating a simulated exchange environment to safely train and evaluate RL trading agents.',
    category: 'Machine Learning',
    domain: 'Finance',
    difficulty: 'Intermediate',
    status: 'Archived',
    technologies: ['Python', 'Gymnasium', 'Pandas'],
    tags: ['Reinforcement Learning', 'Finance'],
    interestedCount: 9
  },
  {
    id: 'p11',
    title: 'Sign Language Translator',
    shortDescription: 'Real-time translation of ASL gestures to text using a webcam.',
    description: 'An accessible communication tool running directly in the browser using lightweight vision models.',
    category: 'Computer Vision',
    domain: 'Accessibility',
    difficulty: 'Intermediate',
    status: 'Open',
    technologies: ['JavaScript', 'TensorFlow.js', 'MediaPipe'],
    tags: ['Browser ML', 'Accessibility'],
    interestedCount: 20
  },
  {
    id: 'p12',
    title: 'Personalized Learning Path Generator',
    shortDescription: 'AI tool that creates custom curriculum based on a student\'s current skills and goals.',
    description: 'Recommends tutorials, papers, and projects dynamically to help students reach specific technical milestones.',
    category: 'Generative AI',
    domain: 'Education',
    difficulty: 'Beginner',
    status: 'In Progress',
    technologies: ['React', 'Firebase', 'OpenAI'],
    tags: ['Recommendation', 'Education'],
    interestedCount: 11
  },
  {
    id: 'p13',
    title: 'Synthetic Data Generator for Retail',
    shortDescription: 'Creating realistic customer purchase datasets for ML training while preserving privacy.',
    description: 'Using GANs to generate high-quality synthetic data that maintains the statistical properties of real retail data.',
    category: 'Data Science',
    domain: 'Retail',
    difficulty: 'Intermediate',
    status: 'Open',
    technologies: ['Python', 'PyTorch', 'GANs'],
    tags: ['Synthetic Data', 'Privacy'],
    interestedCount: 6
  },
  {
    id: 'p14',
    title: 'Local LLM Deployment Toolkit',
    shortDescription: 'A set of scripts and UI tools to easily run and finetune models locally on consumer GPUs.',
    description: 'Lowering the barrier to entry for students wanting to experiment with open-weights models without cloud costs.',
    category: 'Developer Tools',
    domain: 'Infrastructure',
    difficulty: 'Beginner',
    status: 'Completed',
    technologies: ['Bash', 'Python', 'Ollama', 'Gradio'],
    tags: ['Local AI', 'Tooling'],
    interestedCount: 25
  }
];
