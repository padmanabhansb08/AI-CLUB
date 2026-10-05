export type TrackingMethod = 'api' | 'oauth' | 'webhook' | 'lti' | 'certificate' | 'manual' | 'none';
export type TrackingStatus = 'available' | 'connected' | 'unsupported';

export interface TrackingConfig {
  method: TrackingMethod;
  provider: string;
  status: TrackingStatus;
}

export interface ExternalCourse {
  id: string;
  title: string;
  provider: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  skills: string[];
  topics: string[];
  whyThisCourse?: string;
  courseUrl?: string;
  featured?: boolean;
  tracking: TrackingConfig;
  createdAt?: string;
  updatedAt?: string;
}

export const mockCourses: ExternalCourse[] = [
  {
    id: 'c1',
    title: 'Machine Learning Foundations',
    provider: 'Google',
    description: 'Build a foundation in supervised and unsupervised machine learning models, training techniques, and evaluation metrics.',
    category: 'Machine Learning',
    difficulty: 'Beginner',
    duration: '~20 hours',
    skills: ['Python', 'TensorFlow', 'Data Preprocessing', 'Model Evaluation'],
    topics: ['Supervised Learning', 'Unsupervised Learning', 'Gradient Descent', 'Neural Network Basics'],
    whyThisCourse: 'A comprehensive starting point for students completely new to ML, created by industry leaders.',
    courseUrl: 'https://example.com/ml-foundations',
    tracking: {
      method: 'api',
      provider: 'Google Learn',
      status: 'available'
    },
    featured: true
  },
  {
    id: 'c2',
    title: 'Generative AI with Large Language Models',
    provider: 'DeepLearning.AI',
    description: 'Learn the fundamentals of how LLMs work, including architecture, training, fine-tuning, and deployment.',
    category: 'Generative AI',
    difficulty: 'Intermediate',
    duration: '~30 hours',
    skills: ['Transformers', 'Fine-Tuning', 'PEFT', 'LoRA', 'Prompt Engineering'],
    topics: ['Transformer Architecture', 'Instruction Tuning', 'RLHF', 'Model Evaluation'],
    whyThisCourse: 'Provides practical, hands-on labs using AWS infrastructure to fine-tune open-source models.',
    courseUrl: 'https://example.com/genai-llm',
    tracking: {
      method: 'oauth',
      provider: 'Coursera',
      status: 'available'
    }
  },
  {
    id: 'c3',
    title: 'Building AI Agents',
    provider: 'Hugging Face',
    description: 'An interactive course on orchestrating LLMs with tools to build autonomous AI agents.',
    category: 'AI Agents',
    difficulty: 'Advanced',
    duration: '~15 hours',
    skills: ['Tool Calling', 'Agentic Workflows', 'LangChain', 'Hugging Face Hub'],
    topics: ['ReAct Prompting', 'Tool Execution', 'Multi-Agent Systems', 'Memory Management'],
    courseUrl: 'https://example.com/hf-agents',
    tracking: {
      method: 'certificate',
      provider: 'Hugging Face',
      status: 'available'
    },
    featured: true
  },
  {
    id: 'c4',
    title: 'Advanced Computer Vision with PyTorch',
    provider: 'Coursera',
    description: 'Deep dive into state-of-the-art computer vision models including Vision Transformers and advanced object detection.',
    category: 'Computer Vision',
    difficulty: 'Advanced',
    duration: '~40 hours',
    skills: ['PyTorch', 'CNNs', 'Vision Transformers', 'Image Segmentation'],
    topics: ['Object Detection', 'Semantic Segmentation', 'ViT Architecture', 'Generative Vision'],
    whyThisCourse: 'Essential for students working on the lab monitoring or autonomous drone club projects.',
    tracking: {
      method: 'oauth',
      provider: 'Coursera',
      status: 'available'
    }
  },
  {
    id: 'c5',
    title: 'Practical Data Science on AWS',
    provider: 'AWS',
    description: 'Learn how to deploy, scale, and manage machine learning models in a cloud environment.',
    category: 'Data Science',
    difficulty: 'Intermediate',
    duration: '~25 hours',
    skills: ['AWS SageMaker', 'Cloud Architecture', 'Model Deployment', 'Data Pipelines'],
    topics: ['Data Wrangling', 'Model Training at Scale', 'Endpoint Deployment', 'A/B Testing'],
    courseUrl: 'https://example.com/aws-data-science',
    tracking: {
      method: 'api',
      provider: 'AWS Training',
      status: 'available'
    }
  },
  {
    id: 'c6',
    title: 'Deep Learning Specialization',
    provider: 'Coursera',
    description: 'The classic deep learning sequence covering neural networks, hyperparameter tuning, structuring ML projects, and sequence models.',
    category: 'Deep Learning',
    difficulty: 'Intermediate',
    duration: '~80 hours',
    skills: ['Neural Networks', 'Hyperparameter Tuning', 'Sequence Models', 'TensorFlow'],
    topics: ['Deep Neural Networks', 'Optimization Algorithms', 'RNNs & LSTMs', 'Structuring ML Projects'],
    whyThisCourse: 'The industry-standard baseline for understanding deep learning concepts from scratch.',
    tracking: {
      method: 'oauth',
      provider: 'Coursera',
      status: 'available'
    }
  },
  {
    id: 'c7',
    title: 'MLOps: Machine Learning Operations',
    provider: 'DeepLearning.AI',
    description: 'Learn how to take models from the research environment and deploy them reliably in production.',
    category: 'MLOps',
    difficulty: 'Advanced',
    duration: '~35 hours',
    skills: ['CI/CD for ML', 'Model Monitoring', 'Data Drift Detection', 'Kubernetes'],
    topics: ['Model Deployment', 'Data Pipelines', 'Continuous Training', 'Monitoring'],
    tracking: {
      method: 'certificate',
      provider: 'Coursera',
      status: 'available'
    }
  },
  {
    id: 'c8',
    title: 'Introduction to Natural Language Processing',
    provider: 'edX',
    description: 'Foundational concepts in NLP, from text preprocessing and embeddings to advanced language models.',
    category: 'NLP',
    difficulty: 'Intermediate',
    duration: '~30 hours',
    skills: ['Text Preprocessing', 'Word Embeddings', 'NLTK', 'Transformers'],
    topics: ['Tokenization', 'TF-IDF', 'Word2Vec', 'Attention Mechanism'],
    courseUrl: 'https://example.com/edx-nlp',
    tracking: {
      method: 'oauth',
      provider: 'edX',
      status: 'available'
    }
  },
  {
    id: 'c9',
    title: 'CUDA Programming and GPU Architecture',
    provider: 'NVIDIA',
    description: 'Learn how to write highly parallel code for NVIDIA GPUs to accelerate machine learning workloads.',
    category: 'Developer Tools',
    difficulty: 'Advanced',
    duration: '~15 hours',
    skills: ['C++', 'CUDA', 'Parallel Computing', 'GPU Optimization'],
    topics: ['GPU Architecture', 'Thread Hierarchy', 'Memory Management', 'Performance Profiling'],
    whyThisCourse: 'Crucial for students wanting to build custom operations or optimize inference latency.',
    courseUrl: 'https://example.com/nvidia-cuda',
    tracking: {
      method: 'certificate',
      provider: 'NVIDIA Deep Learning Institute',
      status: 'available'
    }
  },
  {
    id: 'c10',
    title: 'Kaggle Intro to Machine Learning',
    provider: 'Kaggle',
    description: 'A fast-paced, practical introduction to machine learning using Python and Pandas.',
    category: 'Machine Learning',
    difficulty: 'Beginner',
    duration: '~5 hours',
    skills: ['Python', 'Pandas', 'Scikit-Learn', 'Decision Trees'],
    topics: ['Data Exploration', 'Model Validation', 'Random Forests', 'Handling Missing Values'],
    courseUrl: 'https://example.com/kaggle-intro',
    tracking: {
      method: 'none',
      provider: 'Kaggle',
      status: 'unsupported'
    }
  },
  {
    id: 'c11',
    title: 'Data Science with R',
    provider: 'edX',
    description: 'Learn data analysis, visualization, and statistical modeling using the R programming language.',
    category: 'Data Science',
    difficulty: 'Beginner',
    duration: '~40 hours',
    skills: ['R', 'ggplot2', 'Statistical Analysis', 'Data Visualization'],
    topics: ['Data Wrangling', 'Probability', 'Inference', 'Linear Regression'],
    tracking: {
      method: 'oauth',
      provider: 'edX',
      status: 'available'
    }
  },
  {
    id: 'c12',
    title: 'Open Source AI Models',
    provider: 'Independent Research',
    description: 'A community-driven guide to running, fine-tuning, and evaluating open-source models locally.',
    category: 'Generative AI',
    difficulty: 'Intermediate',
    duration: '~10 hours',
    skills: ['Ollama', 'llama.cpp', 'Model Quantization', 'Local Deployment'],
    topics: ['Local LLMs', 'Quantization Techniques', 'Hardware Requirements', 'Open Source Ecosystem'],
    tracking: {
      method: 'none',
      provider: 'Independent',
      status: 'unsupported'
    }
  }
];
