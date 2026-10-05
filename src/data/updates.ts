export interface Update {
  id: string;
  category: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  sourceUrl?: string;
  publishedAt: string;
  readingTime: string;
  tags: string[];
  featured?: boolean;
}

export const mockUpdates: Update[] = [
  {
    id: 'u1',
    category: 'AI Agents',
    title: 'Understanding Tool-Using AI Agents',
    summary: 'A deep dive into how LLMs are being extended with tool-calling capabilities to interact with external environments.',
    content: `
      <h3>Overview</h3>
      <p>Recent advancements in large language models have enabled them to move beyond simple text generation to active participation in environments via tool calling. This article explores the architecture of modern AI agents.</p>
      
      <h3>Why It Matters</h3>
      <p>Agents that can query databases, execute code, and browse the web represent a fundamental shift from passive oracles to active assistants. This opens up entirely new workflows in software engineering, data analysis, and automation.</p>
      
      <h3>Key Takeaways</h3>
      <ul>
        <li>Tool calling relies on structured JSON outputs and function registries.</li>
        <li>Safety and permission boundaries are the current major challenges.</li>
        <li>Multi-agent collaboration frameworks are becoming the standard for complex task resolution.</li>
      </ul>
    `,
    source: 'AI Research Weekly (Demo)',
    publishedAt: 'October 3, 2026',
    readingTime: '6 min read',
    tags: ['AI Agents', 'Tool Calling', 'LLM', 'Automation'],
    featured: true
  },
  {
    id: 'u2',
    category: 'Generative AI',
    title: 'Advancements in Diffusion Models for 3D Generation',
    summary: 'Researchers are pushing the boundaries of generative AI by extending diffusion techniques into 3D asset creation.',
    content: `
      <h3>Overview</h3>
      <p>While 2D image generation has matured, 3D asset generation remained a challenge. New research demonstrates how multi-view diffusion models can synthesize consistent 3D representations from a single text prompt.</p>
      
      <h3>Impact on Development</h3>
      <p>Game developers and VR creators can significantly reduce the time spent on early asset prototyping, accelerating the design pipeline.</p>
    `,
    source: 'Graphics Lab Journal (Demo)',
    publishedAt: 'October 1, 2026',
    readingTime: '4 min read',
    tags: ['Generative AI', 'Diffusion Models', '3D Generation', 'Graphics']
  },
  {
    id: 'u3',
    category: 'Research',
    title: 'Linear-Time Attention Mechanisms in Transformers',
    summary: 'A look at recent papers proposing alternatives to quadratic attention, enabling ultra-long context windows.',
    content: `
      <h3>Overview</h3>
      <p>Traditional transformers suffer from O(N^2) complexity with respect to sequence length. Researchers are exploring state-space models (SSMs) and linear attention mechanisms to achieve constant-time inference.</p>
    `,
    source: 'ML Theory Blog (Demo)',
    publishedAt: 'September 29, 2026',
    readingTime: '8 min read',
    tags: ['Transformers', 'Architecture', 'Efficiency', 'Research']
  },
  {
    id: 'u4',
    category: 'Developer',
    title: 'Integrating Rust with Modern ML Frameworks',
    summary: 'Why more machine learning infrastructure is being rewritten in Rust for safety and performance.',
    content: `
      <h3>Overview</h3>
      <p>Python remains the lingua franca of ML research, but production deployment is increasingly shifting to Rust. We explore the benefits of Rust bindings for popular tensor libraries.</p>
    `,
    source: 'Systems Engineering News (Demo)',
    publishedAt: 'September 28, 2026',
    readingTime: '5 min read',
    tags: ['Rust', 'Infrastructure', 'Performance']
  },
  {
    id: 'u5',
    category: 'Open Source',
    title: 'New Open Weights Model Challenges Proprietary APIs',
    summary: 'A new open-source 70B parameter model demonstrates performance parity with closed-source alternatives on reasoning benchmarks.',
    content: `
      <h3>Overview</h3>
      <p>The gap between open-weights models and proprietary APIs continues to close. The latest release introduces advanced instruction tuning and a massive context window available for local deployment.</p>
    `,
    source: 'OpenAI Weekly (Demo)',
    publishedAt: 'September 25, 2026',
    readingTime: '3 min read',
    tags: ['Open Source', 'LLM', 'Benchmarking']
  },
  {
    id: 'u6',
    category: 'Machine Learning',
    title: 'Federated Learning for Privacy-Preserving Health Tech',
    summary: 'How hospitals are training predictive models collaboratively without sharing sensitive patient data.',
    content: `
      <h3>Overview</h3>
      <p>Federated learning allows edge devices or separate institutions to train a shared model while keeping data localized. This approach is revolutionizing medical AI research.</p>
    `,
    source: 'HealthTech AI (Demo)',
    publishedAt: 'September 22, 2026',
    readingTime: '7 min read',
    tags: ['Federated Learning', 'Healthcare', 'Privacy']
  },
  {
    id: 'u7',
    category: 'Technology',
    title: 'Quantum Error Correction Breakthrough',
    summary: 'Physicists have successfully demonstrated logical qubits with lower error rates than their underlying physical qubits.',
    content: `
      <h3>Overview</h3>
      <p>Error correction has been the primary roadblock for practical quantum computing. This milestone proves that fault-tolerant quantum computation is physically achievable.</p>
    `,
    source: 'Quantum Computing Review (Demo)',
    publishedAt: 'September 20, 2026',
    readingTime: '6 min read',
    tags: ['Quantum Computing', 'Physics', 'Hardware']
  },
  {
    id: 'u8',
    category: 'AI',
    title: 'The Role of Synthetic Data in Model Training',
    summary: 'As the internet runs out of high-quality human text, AI companies are turning to synthetic data to train next-generation models.',
    content: `
      <h3>Overview</h3>
      <p>Training models on data generated by other models runs the risk of model collapse. However, careful filtering and reasoning-based synthetic data generation are proving highly effective.</p>
    `,
    source: 'Data Science Daily (Demo)',
    publishedAt: 'September 18, 2026',
    readingTime: '5 min read',
    tags: ['Synthetic Data', 'Training', 'Data Engineering']
  },
  {
    id: 'u9',
    category: 'Developer',
    title: 'Vector Databases: A Comprehensive Comparison',
    summary: 'Evaluating the performance, scalability, and developer experience of the top open-source vector databases.',
    content: `
      <h3>Overview</h3>
      <p>With RAG becoming standard practice, choosing the right vector database is critical. We benchmark Milvus, Qdrant, and Postgres+pgvector.</p>
    `,
    source: 'Database Engineering (Demo)',
    publishedAt: 'September 15, 2026',
    readingTime: '10 min read',
    tags: ['Databases', 'Vector Search', 'RAG']
  },
  {
    id: 'u10',
    category: 'Research',
    title: 'Aligning Models with Constitutional AI',
    summary: 'Exploring methods to embed safety and ethical principles directly into model weights during the training process.',
    content: `
      <h3>Overview</h3>
      <p>Instead of relying purely on RLHF (Reinforcement Learning from Human Feedback), researchers are using AI feedback based on a defined constitution of rules to guide model behavior.</p>
    `,
    source: 'AI Safety Research (Demo)',
    publishedAt: 'September 12, 2026',
    readingTime: '8 min read',
    tags: ['Alignment', 'Safety', 'Ethics']
  },
  {
    id: 'u11',
    category: 'AI Agents',
    title: 'Evaluating Multi-Agent Frameworks',
    summary: 'A practical guide to building systems where specialized agents collaborate to solve complex problems.',
    content: `
      <h3>Overview</h3>
      <p>We test several open-source multi-agent orchestration frameworks, analyzing how they handle state, memory, and conflict resolution between agents.</p>
    `,
    source: 'Agentic Engineering (Demo)',
    publishedAt: 'September 10, 2026',
    readingTime: '7 min read',
    tags: ['AI Agents', 'Orchestration', 'Engineering']
  },
  {
    id: 'u12',
    category: 'Generative AI',
    title: 'Audio Generation Reaches Near-Human Fidelity',
    summary: 'New text-to-speech and music generation models are producing audio indistinguishable from human recordings.',
    content: `
      <h3>Overview</h3>
      <p>Advancements in continuous-variable diffusion models are enabling highly expressive, zero-shot voice cloning and complex music composition.</p>
    `,
    source: 'AudioTech Trends (Demo)',
    publishedAt: 'September 5, 2026',
    readingTime: '4 min read',
    tags: ['Audio', 'Generative AI', 'Media']
  },
  {
    id: 'u13',
    category: 'Machine Learning',
    title: 'Optimizing Inference on Edge Devices',
    summary: 'Techniques for quantization and pruning to run powerful ML models on mobile phones and IoT devices.',
    content: `
      <h3>Overview</h3>
      <p>Running LLMs locally ensures privacy and reduces latency. This guide covers how to convert and quantize models to 4-bit precision for edge deployment.</p>
    `,
    source: 'Edge Computing Weekly (Demo)',
    publishedAt: 'September 2, 2026',
    readingTime: '6 min read',
    tags: ['Edge AI', 'Optimization', 'Quantization']
  },
  {
    id: 'u14',
    category: 'Open Source',
    title: 'The Rise of Open-Source Evaluation Benchmarks',
    summary: 'Why transparent, community-driven evaluation suites are essential for accurately measuring AI progress.',
    content: `
      <h3>Overview</h3>
      <p>As proprietary benchmarks become saturated or compromised, the open-source community is building dynamic evaluation tools that are harder to game.</p>
    `,
    source: 'Eval Lab (Demo)',
    publishedAt: 'August 30, 2026',
    readingTime: '5 min read',
    tags: ['Benchmarking', 'Evaluation', 'Open Source']
  }
];
