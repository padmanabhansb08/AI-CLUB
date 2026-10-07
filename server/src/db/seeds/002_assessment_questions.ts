import { pool } from '../index';
import bcrypt from 'bcrypt';

export async function seedQuestionsAndApplicants() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Seed Question Bank (40+ questions across 7 categories)
    const questions = [
      // AI FUNDAMENTALS (6)
      {
        question: 'Which test was proposed in 1950 to determine whether a machine can exhibit intelligent behavior indistinguishable from a human?',
        option_a: 'Voight-Kampff Test',
        option_b: 'Turing Test',
        option_c: 'Lovelace Criterion',
        option_d: 'Searle Chinese Room Test',
        correct_option: 'B',
        category: 'AI_FUNDAMENTALS',
        difficulty: 'EASY',
        explanation: 'Alan Turing proposed the Turing Test in 1950 to evaluate machine intelligence.'
      },
      {
        question: 'What is the primary characteristic of an "agent" in Artificial Intelligence?',
        option_a: 'It always executes deterministic linear equations',
        option_b: 'It perceives its environment through sensors and acts upon it through actuators',
        option_c: 'It requires continuous human feedback for every micro-operation',
        option_d: 'It stores infinite data without memory constraints',
        correct_option: 'B',
        category: 'AI_FUNDAMENTALS',
        difficulty: 'EASY',
        explanation: 'An AI agent perceives its environment via sensors and acts on it via actuators to achieve a goal.'
      },
      {
        question: 'Which search algorithm is guaranteed to find the shortest path in an unweighted graph?',
        option_a: 'Depth-First Search (DFS)',
        option_b: 'Breadth-First Search (BFS)',
        option_c: 'Best-First Search',
        option_d: 'Greedy Search',
        correct_option: 'B',
        category: 'AI_FUNDAMENTALS',
        difficulty: 'MEDIUM',
        explanation: 'BFS explores graph levels uniformly, guaranteeing the shortest path in unweighted graphs.'
      },
      {
        question: 'In the A* search algorithm, what condition must the heuristic function h(n) satisfy to guarantee an optimal path?',
        option_a: 'It must be completely non-monotonic',
        option_b: 'It must overestimate the true cost to the goal',
        option_c: 'It must be admissible (never overestimate the true cost)',
        option_d: 'It must equal zero for all non-goal nodes',
        correct_option: 'C',
        category: 'AI_FUNDAMENTALS',
        difficulty: 'MEDIUM',
        explanation: 'An admissible heuristic never overestimates the actual cost to reach the goal, guaranteeing A* optimality.'
      },
      {
        question: 'Which branch of AI focuses specifically on knowledge representation and logical deduction using formal rules?',
        option_a: 'Symbolic AI (Good Old-Fashioned AI)',
        option_b: 'Connectionist Neural Networks',
        option_c: 'Reinforcement Learning',
        option_d: 'Evolutionary Computation',
        correct_option: 'A',
        category: 'AI_FUNDAMENTALS',
        difficulty: 'MEDIUM',
        explanation: 'Symbolic AI represents knowledge explicitly through rules and symbols, using deduction engines.'
      },
      {
        question: 'What is the "Exploration vs. Exploitation" dilemma primarily associated with in AI?',
        option_a: 'Supervised Learning',
        option_b: 'Reinforcement Learning',
        option_c: 'Principal Component Analysis',
        option_d: 'Support Vector Machines',
        correct_option: 'B',
        category: 'AI_FUNDAMENTALS',
        difficulty: 'EASY',
        explanation: 'In Reinforcement Learning, an agent balances trying new unknown actions (exploration) with taking known high-reward actions (exploitation).'
      },

      // MACHINE LEARNING (6)
      {
        question: 'What is "overfitting" in supervised machine learning models?',
        option_a: 'The model has high bias and fails to capture patterns in both train and test data',
        option_b: 'The model learns noise and idiosyncrasies of training data, generalizing poorly to unseen data',
        option_c: 'The training time is unusually short compared to industry standards',
        option_d: 'The loss function converges to positive infinity',
        correct_option: 'B',
        category: 'MACHINE_LEARNING',
        difficulty: 'EASY',
        explanation: 'Overfitting occurs when a complex model fits the training set too closely including noise, harming test performance.'
      },
      {
        question: 'Which regularization technique adds the sum of absolute values of weights (L1 norm) to the loss function?',
        option_a: 'Ridge Regularization',
        option_b: 'Lasso Regularization',
        option_c: 'Dropout',
        option_d: 'Batch Normalization',
        correct_option: 'B',
        category: 'MACHINE_LEARNING',
        difficulty: 'MEDIUM',
        explanation: 'Lasso (L1) penalizes the absolute magnitude of coefficients, promoting sparsity in features.'
      },
      {
        question: 'In binary classification with imbalanced classes (e.g. 99% negative, 1% positive), which metric is LEAST informative?',
        option_a: 'F1-Score',
        option_b: 'Precision',
        option_c: 'Recall',
        option_d: 'Raw Accuracy',
        correct_option: 'D',
        category: 'MACHINE_LEARNING',
        difficulty: 'EASY',
        explanation: 'A naive model predicting all negatives achieves 99% accuracy while failing completely at detecting the positive class.'
      },
      {
        question: 'What is the primary difference between Bagging and Boosting ensemble algorithms?',
        option_a: 'Bagging trains learners sequentially; Boosting trains them independently in parallel',
        option_b: 'Bagging trains learners independently in parallel; Boosting trains learners sequentially focusing on errors',
        option_c: 'Bagging only works on neural networks; Boosting only works on decision trees',
        option_d: 'Bagging always increases variance; Boosting always increases bias',
        correct_option: 'B',
        category: 'MACHINE_LEARNING',
        difficulty: 'MEDIUM',
        explanation: 'Random Forest (Bagging) builds trees independently in parallel; Gradient Boosting builds trees sequentially correcting errors.'
      },
      {
        question: 'Which distance metric is standard in K-Nearest Neighbors for continuous variables without rotation sensitivity?',
        option_a: 'Euclidean distance',
        option_b: 'Hamming distance',
        option_c: 'Jaccard similarity',
        option_d: 'Levenshtein distance',
        correct_option: 'A',
        category: 'MACHINE_LEARNING',
        difficulty: 'EASY',
        explanation: 'Euclidean distance measures ordinary straight-line distance in Euclidean space.'
      },
      {
        question: 'What does the ROC-AUC curve evaluate for a classification model?',
        option_a: 'Training loss vs computational runtime',
        option_b: 'True Positive Rate versus False Positive Rate across various classification thresholds',
        option_c: 'Learning rate decay schedule over epochs',
        option_d: 'Ratio of parameters to memory footprint',
        correct_option: 'B',
        category: 'MACHINE_LEARNING',
        difficulty: 'MEDIUM',
        explanation: 'ROC curves plot sensitivity (TPR) against 1 - specificity (FPR) across all possible decision thresholds.'
      },

      // PYTHON / PROGRAMMING (6)
      {
        question: 'In Python, what is the time complexity of looking up a key in a standard dictionary (dict) on average?',
        option_a: 'O(n)',
        option_b: 'O(log n)',
        option_c: 'O(1)',
        option_d: 'O(n^2)',
        correct_option: 'C',
        category: 'PYTHON_PROGRAMMING',
        difficulty: 'EASY',
        explanation: 'Python dicts use hash tables, offering O(1) average-time complexity for key lookups.'
      },
      {
        question: 'What does the "yield" keyword in Python do when used inside a function definition?',
        option_a: 'Terminates the program immediately with an exit code',
        option_b: 'Converts the function into a generator that produces values lazily one at a time',
        option_c: 'Forces memory garbage collection on all local variables',
        option_d: 'Creates an asynchronous multithreaded daemon process',
        correct_option: 'B',
        category: 'PYTHON_PROGRAMMING',
        difficulty: 'MEDIUM',
        explanation: 'The yield keyword turns a standard function into a generator iterator that preserves state between calls.'
      },
      {
        question: 'In NumPy, what is the result of multiplying two 2D arrays A and B using the asterisk operator `A * B`?',
        option_a: 'Standard matrix multiplication (dot product)',
        option_b: 'Element-wise multiplication (Hadamard product)',
        option_c: 'Inverse cross product',
        option_d: 'Outer tensor product',
        correct_option: 'B',
        category: 'PYTHON_PROGRAMMING',
        difficulty: 'EASY',
        explanation: 'In NumPy, `A * B` performs element-wise multiplication. For matrix multiplication, `A @ B` or `np.dot(A, B)` is used.'
      },
      {
        question: 'Which Python standard library module provides tools for working with high-performance C-like arrays of homogeneous data?',
        option_a: 'itertools',
        option_b: 'array',
        option_c: 'functools',
        option_d: 'collections',
        correct_option: 'B',
        category: 'PYTHON_PROGRAMMING',
        difficulty: 'MEDIUM',
        explanation: 'The `array` module provides compact, homogeneous numerical arrays in the standard library.'
      },
      {
        question: 'What will `print([x**2 for x in range(5) if x % 2 == 1])` output in Python?',
        option_a: '[0, 4, 16]',
        option_b: '[1, 9]',
        option_c: '[1, 9, 25]',
        option_d: '[0, 1, 4, 9, 16]',
        correct_option: 'B',
        category: 'PYTHON_PROGRAMMING',
        difficulty: 'EASY',
        explanation: 'Odd numbers in range(5) are 1 and 3; squaring them yields 1 and 9.'
      },
      {
        question: 'How does Python handle memory management and cleanup of unreferenced objects?',
        option_a: 'Manual malloc and free directives required in code',
        option_b: 'Reference counting supplemented by a cyclic garbage collector',
        option_c: 'Periodic full OS process restart',
        option_d: 'Compile-time linear type borrow checker only',
        correct_option: 'B',
        category: 'PYTHON_PROGRAMMING',
        difficulty: 'MEDIUM',
        explanation: 'CPython relies primarily on reference counting with a cyclic garbage collector to detect and free circular references.'
      },

      // DATA SCIENCE (6)
      {
        question: 'What is the primary objective of Principal Component Analysis (PCA)?',
        option_a: 'To perform supervised classification on non-linear datasets',
        option_b: 'To reduce dimensionality while preserving maximum variance in orthogonal directions',
        option_c: 'To calculate synthetic labels for unlabeled clusters',
        option_d: 'To normalize tabular timestamps into epoch format',
        correct_option: 'B',
        category: 'DATA_SCIENCE',
        difficulty: 'MEDIUM',
        explanation: 'PCA projects high-dimensional data onto orthogonal axes that maximize sample variance.'
      },
      {
        question: 'When imputing missing values in a skewed feature with significant extreme outliers, which statistic is most robust?',
        option_a: 'Mean',
        option_b: 'Median',
        option_c: 'Variance',
        option_d: 'Root Mean Square',
        correct_option: 'B',
        category: 'DATA_SCIENCE',
        difficulty: 'EASY',
        explanation: 'The median is resistant to extreme outliers and skewed distributions, unlike the arithmetic mean.'
      },
      {
        question: 'What does a high Pearson correlation coefficient (e.g. r = +0.95) between two variables X and Y indicate?',
        option_a: 'X strictly causes Y to occur in all experimental trials',
        option_b: 'There is a strong positive linear relationship between X and Y',
        option_c: 'Y is guaranteed to be twice the value of X',
        option_d: 'Neither variable contains any variance or measurement noise',
        correct_option: 'B',
        category: 'DATA_SCIENCE',
        difficulty: 'EASY',
        explanation: 'Correlation quantifies linear association, not causation.'
      },
      {
        question: 'In pandas, which method is used to reshape tabular data from a wide format to a long tidy format?',
        option_a: 'DataFrame.pivot()',
        option_b: 'DataFrame.melt()',
        option_c: 'DataFrame.concat()',
        option_d: 'DataFrame.stack_only()',
        correct_option: 'B',
        category: 'DATA_SCIENCE',
        difficulty: 'MEDIUM',
        explanation: '`pd.melt()` unpivots a DataFrame from wide to long format, gathering columns into identifier-value pairs.'
      },
      {
        question: 'What is the Central Limit Theorem in statistics?',
        option_a: 'The variance of any distribution is always equal to its squared mean',
        option_b: 'The sampling distribution of the sample mean approaches a normal distribution as sample size grows',
        option_c: 'All real-world datasets conform exactly to Gaussian curves',
        option_d: 'P-values must always fall below 0.05 in scientific experiments',
        correct_option: 'B',
        category: 'DATA_SCIENCE',
        difficulty: 'MEDIUM',
        explanation: 'The CLT states that sums/means of independent random variables tend toward a normal distribution regardless of underlying distribution.'
      },
      {
        question: 'What does the VIF (Variance Inflation Factor) measure in multiple regression analysis?',
        option_a: 'Residual standard error over iterations',
        option_b: 'Multicollinearity among independent features',
        option_c: 'Overfitting in decision boundaries',
        option_d: 'Sample kurtosis of the target vector',
        correct_option: 'B',
        category: 'DATA_SCIENCE',
        difficulty: 'HARD',
        explanation: 'VIF assesses how much the variance of an estimated regression coefficient increases due to collinearity with other predictors.'
      },

      // DEEP LEARNING (6)
      {
        question: 'Why does the ReLU (Rectified Linear Unit) activation function help mitigate the vanishing gradient problem in deep networks?',
        option_a: 'It compresses all outputs strictly between 0 and 1',
        option_b: 'Its gradient is constant (1) for all positive inputs, preventing exponential decay through layers',
        option_c: 'It computes smooth trigonometric oscillations across negative domains',
        option_d: 'It eliminates the need for backpropagation entirely',
        correct_option: 'B',
        category: 'DEEP_LEARNING',
        difficulty: 'MEDIUM',
        explanation: 'For x > 0, d/dx(ReLU) = 1, ensuring gradients pass through layers without diminishing toward zero.'
      },
      {
        question: 'What is the primary role of convolutional layers in a Convolutional Neural Network (CNN)?',
        option_a: 'To perform sequence-to-sequence translation of text tokens',
        option_b: 'To extract local spatial features (edges, textures, shapes) through learnable filters with parameter sharing',
        option_c: 'To store sequential hidden state transitions across time steps',
        option_d: 'To sort feature maps by descending variance',
        correct_option: 'B',
        category: 'DEEP_LEARNING',
        difficulty: 'EASY',
        explanation: 'Convolutional layers apply spatial filters to detect translational invariant features efficiently.'
      },
      {
        question: 'Which neural network architecture introduced Gated Recurrent Units (GRU) and Long Short-Term Memory (LSTM) cells?',
        option_a: 'Recurrent Neural Networks (RNN)',
        option_b: 'Multi-Layer Perceptrons (MLP)',
        option_c: 'Self-Organizing Maps (SOM)',
        option_d: 'Restricted Boltzmann Machines (RBM)',
        correct_option: 'A',
        category: 'DEEP_LEARNING',
        difficulty: 'EASY',
        explanation: 'LSTMs and GRUs were developed to mitigate the vanishing gradient problem in sequential RNNs.'
      },
      {
        question: 'What mechanism in the Transformer architecture allows tokens to attend to other tokens regardless of distance without recurrent steps?',
        option_a: 'Max Pooling',
        option_b: 'Multi-Head Self-Attention',
        option_c: 'Markov Decision Process',
        option_d: 'Backpropagation Through Time',
        correct_option: 'B',
        category: 'DEEP_LEARNING',
        difficulty: 'MEDIUM',
        explanation: 'Self-attention calculates pairwise relevance scores between all token positions in parallel using Queries, Keys, and Values.'
      },
      {
        question: 'What is the function of Dropout during deep neural network training?',
        option_a: 'It temporarily zeros out randomly selected neurons to prevent co-adaptation and act as ensemble regularization',
        option_b: 'It drops slow CPU cores from the distributed training cluster',
        option_c: 'It discards gradient steps that have small learning rates',
        option_d: 'It removes negative weights from the final projection head',
        correct_option: 'A',
        category: 'DEEP_LEARNING',
        difficulty: 'MEDIUM',
        explanation: 'Dropout randomly deactivates a fraction of units during each training pass to prevent fragile co-dependence.'
      },
      {
        question: 'In deep learning optimizers, what does Adam combine to achieve rapid and stable convergence?',
        option_a: 'Simulated Annealing and Genetic Selection',
        option_b: 'Momentum (1st moment of gradients) and RMSProp (2nd raw moment of gradients)',
        option_c: 'Linear Programming and Simplex Matrix Operations',
        option_d: 'Newton-Raphson second derivatives only',
        correct_option: 'B',
        category: 'DEEP_LEARNING',
        difficulty: 'HARD',
        explanation: 'Adam computes adaptive learning rates from estimates of first and second moments of gradients.'
      },

      // GENERATIVE AI (6)
      {
        question: 'In Generative Adversarial Networks (GANs), what are the two competing neural networks called?',
        option_a: 'Encoder and Decoder',
        option_b: 'Generator and Discriminator',
        option_c: 'Actor and Critic',
        option_d: 'Transformer and Attention Head',
        correct_option: 'B',
        category: 'GENERATIVE_AI',
        difficulty: 'EASY',
        explanation: 'The Generator synthesizes candidate data while the Discriminator evaluates whether samples are real or generated.'
      },
      {
        question: 'What does "temperature" control when sampling text from a Large Language Model (LLM)?',
        option_a: 'The physical heat generated by the GPU during inference',
        option_b: 'The randomness/entropy of the next-token probability distribution',
        option_c: 'The maximum context window token length',
        option_d: 'The quantization bit width of the model weights',
        correct_option: 'B',
        category: 'GENERATIVE_AI',
        difficulty: 'MEDIUM',
        explanation: 'Lower temperature sharpens the probability distribution (more deterministic); higher temperature flattens it (more diverse).'
      },
      {
        question: 'What is RAG (Retrieval-Augmented Generation) in modern AI architectures?',
        option_a: 'Fine-tuning a neural network by modifying all weights from scratch',
        option_b: 'Retrieving relevant external documents from a knowledge base to ground the LLM prompt with factual context',
        option_c: 'Compressing model weights into 4-bit integers using quantization',
        option_d: 'Generating audio waveforms directly from raw RGB pixel frames',
        correct_option: 'B',
        category: 'GENERATIVE_AI',
        difficulty: 'EASY',
        explanation: 'RAG augments LLM prompts with semantically retrieved factual context to reduce hallucinations and provide fresh data.'
      },
      {
        question: 'What is RLHF (Reinforcement Learning from Human Feedback) primarily used for in foundation models?',
        option_a: 'Aligning model behavior, safety, and helpfulness with human preferences',
        option_b: 'Speeding up token generation latency by 10x',
        option_c: 'Converting dense text models into vision-only models',
        option_d: 'Translating Python code into hardware assembly',
        correct_option: 'A',
        category: 'GENERATIVE_AI',
        difficulty: 'MEDIUM',
        explanation: 'RLHF uses reward models trained on human preferences to steer foundation models toward safe, helpful responses.'
      },
      {
        question: 'In diffusion models (e.g. Stable Diffusion), what is the forward diffusion process?',
        option_a: 'Gradually adding Gaussian noise to an image step-by-step until it becomes pure random noise',
        option_b: 'Iteratively sharpening a blurry image using edge detection filters',
        option_c: 'Downscaling an image to 8x8 resolution',
        option_d: 'Extracting semantic CLIP embeddings from a text prompt',
        correct_option: 'A',
        category: 'GENERATIVE_AI',
        difficulty: 'MEDIUM',
        explanation: 'Forward diffusion adds scheduled Gaussian noise; the reverse process trains a network to denoise and synthesize clean images.'
      },
      {
        question: 'What is the role of Vector Databases (e.g. Pinecone, Chroma, pgvector) in generative AI workflows?',
        option_a: 'Executing fast SQL transactions with relational ACID guarantees',
        option_b: 'Storing high-dimensional embeddings and performing approximate nearest neighbor (ANN) similarity search',
        option_c: 'Compiling neural network kernels for edge microcontrollers',
        option_d: 'Rendering 3D vector graphics in WebGL viewports',
        correct_option: 'B',
        category: 'GENERATIVE_AI',
        difficulty: 'MEDIUM',
        explanation: 'Vector databases store embeddings and compute cosine/dot product similarity to retrieve semantically close content.'
      },

      // LOGICAL REASONING & PROBLEM SOLVING (5)
      {
        question: 'If all Machine Learning models are Algorithms, and some Algorithms are Open Source, which statement is logically sound?',
        option_a: 'All Machine Learning models are definitely Open Source',
        option_b: 'Some Algorithms could be Machine Learning models that are Open Source',
        option_c: 'No Machine Learning models can ever be Open Source',
        option_d: 'All Open Source software is a Machine Learning model',
        correct_option: 'B',
        category: 'LOGICAL_REASONING',
        difficulty: 'EASY',
        explanation: 'Because ML models are a subset of Algorithms and some Algorithms are Open Source, the intersection can include Open Source ML models.'
      },
      {
        question: 'Look at the sequence: 2, 6, 12, 20, 30, ?. What is the next number in the pattern?',
        option_a: '40',
        option_b: '42',
        option_c: '44',
        option_d: '46',
        correct_option: 'B',
        category: 'LOGICAL_REASONING',
        difficulty: 'MEDIUM',
        explanation: 'The differences between consecutive terms are +4, +6, +8, +10. The next difference is +12, so 30 + 12 = 42 (also n*(n+1): 1*2, 2*3, 3*4, 4*5, 5*6, 6*7=42).'
      },
      {
        question: 'A neural network training batch finishes in 4 minutes on 2 GPUs. Assuming linear scaling with no overhead, how long would it take on 8 GPUs?',
        option_a: '30 seconds',
        option_b: '1 minute',
        option_c: '2 minutes',
        option_d: '16 minutes',
        correct_option: 'B',
        category: 'LOGICAL_REASONING',
        difficulty: 'EASY',
        explanation: 'Going from 2 GPUs to 8 GPUs is a 4x increase in compute, reducing time from 4 minutes to 1 minute (4 / 4 = 1).'
      },
      {
        question: 'A classifier has 90% precision and a test set contains 100 positive predictions. How many of those predictions are true positives?',
        option_a: '10',
        option_b: '50',
        option_c: '90',
        option_d: '100',
        correct_option: 'C',
        category: 'LOGICAL_REASONING',
        difficulty: 'EASY',
        explanation: 'Precision = TP / (TP + FP). With 100 positive predictions and 90% precision, 90 are true positives.'
      },
      {
        question: 'If A implies B, and B implies C, but C is false, what can be logically inferred about A?',
        option_a: 'A is true',
        option_b: 'A is false',
        option_c: 'A can be either true or false',
        option_d: 'No inference can be made without knowing B',
        correct_option: 'B',
        category: 'LOGICAL_REASONING',
        difficulty: 'MEDIUM',
        explanation: 'By modus tollens, if C is false then B is false, and if B is false then A must be false.'
      },

      // PROBLEM SOLVING & ADVANCED DOMAINS
      {
        question: 'You are designing a rate-limiting algorithm for an AI API. Which algorithmic structure efficiently tracks sliding window timestamps with minimal memory overhead?',
        option_a: 'A doubly-linked ring buffer of epoch millisecond timestamps',
        option_b: 'A full database table scan on every incoming HTTP call',
        option_c: 'A fixed 24-hour sleep timer thread',
        option_d: 'A static array of size 1,000,000 strings',
        correct_option: 'A',
        category: 'PROBLEM_SOLVING',
        difficulty: 'MEDIUM',
        explanation: 'A sliding window log using a ring buffer or sorted set tracks exact request timestamps within the active time window with minimal space.'
      },
      {
        question: 'When training an LLM, GPU memory is overwhelmed by large batch sizes. Which technique accumulates gradients across multiple small micro-batches before updating weights?',
        option_a: 'Stochastic Weight Averaging',
        option_b: 'Gradient Accumulation',
        option_c: 'Layer Freezing',
        option_d: 'Early Stopping',
        correct_option: 'B',
        category: 'PROBLEM_SOLVING',
        difficulty: 'EASY',
        explanation: 'Gradient Accumulation calculates gradients in smaller micro-batches without updating weights until a target effective batch size is accumulated.'
      },
      {
        question: 'A database query on a table with 10 million rows is taking 4.2 seconds to filter by (department, year). What is the most effective immediate fix?',
        option_a: 'Rebuilding the entire database server on bare metal hardware',
        option_b: 'Creating a composite B-Tree index on (department, year)',
        option_c: 'Replacing PostgreSQL with a CSV file reader',
        option_d: 'Converting all text columns to JSON blobs',
        correct_option: 'B',
        category: 'PROBLEM_SOLVING',
        difficulty: 'EASY',
        explanation: 'A composite index on (department, year) allows the database query planner to perform index range scans in logarithmic time O(log N).'
      },
      {
        question: 'In an AI club voting system, you must select the top 3 projects from an unsorted list of 100,000 student submissions without sorting the entire dataset. What is the most optimal approach?',
        option_a: 'Full Quicksort of all 100,000 records',
        option_b: 'A Min-Heap of size 3 that tracks the 3 largest elements in O(N log k) time',
        option_c: 'Bubble Sort terminating after 10 passes',
        option_d: 'Random sampling of 10 records',
        correct_option: 'B',
        category: 'PROBLEM_SOLVING',
        difficulty: 'MEDIUM',
        explanation: 'A min-heap of size k=3 processes N items in O(N log 3) = O(N) time and requires only O(k) additional memory space.'
      },
      {
        question: 'A microservice architecture suffers from cascading failures when an external AI model provider experiences 504 Gateway Timeouts. What software resilience pattern should be implemented?',
        option_a: 'Infinite Retry Loop Pattern',
        option_b: 'Circuit Breaker Pattern with Fallback and Exponential Backoff',
        option_c: 'Fire-and-Forget Pattern without error logging',
        option_d: 'Single Point of Failure Pattern',
        correct_option: 'B',
        category: 'PROBLEM_SOLVING',
        difficulty: 'MEDIUM',
        explanation: 'The Circuit Breaker pattern trips open when downstream failures cross a threshold, failing fast with a fallback and preventing system-wide resource exhaustion.'
      },
      {
        question: 'To guarantee that a student assessment attempt cannot be submitted after the 30-minute limit even if the student tampers with their local browser clock, what must be done?',
        option_a: 'Rely on JavaScript window.setInterval in the React frontend',
        option_b: 'Enforce the check server-side in PostgreSQL/API by comparing CURRENT_TIMESTAMP against expires_at stored in the database',
        option_c: 'Disable developer tools in the user browser window',
        option_d: 'Use local storage cookies to record time',
        correct_option: 'B',
        category: 'PROBLEM_SOLVING',
        difficulty: 'EASY',
        explanation: 'Server-authoritative timestamp validation guarantees security because the client cannot tamper with server or database clocks.'
      },
      {
        question: 'In LoRA (Low-Rank Adaptation) parameter-efficient fine-tuning (PEFT), how are model weights updated?',
        option_a: 'By updating all parameters across every transformer block with full FP32 gradients',
        option_b: 'By freezing base model weights and injecting trainable low-rank decomposition rank matrices (A and B) into attention projections',
        option_c: 'By pruning 90% of model neurons before training',
        option_d: 'By appending synthetic prefix tokens to user prompts',
        correct_option: 'B',
        category: 'GENERATIVE_AI',
        difficulty: 'MEDIUM',
        explanation: 'LoRA decomposes weight updates delta-W into two low-rank matrices A and B (rank r << d), drastically reducing memory and trainable parameter count.'
      },
      {
        question: 'What is the computational benefit of KV-Caching (Key-Value caching) during LLM autoregressive inference generation?',
        option_a: 'It caches computed Key and Value attention tensors of previous prompt tokens so they do not need to be recalculated at each new token generation step',
        option_b: 'It compresses model weights into 2-bit quantization',
        option_c: 'It replaces multi-head attention with single-head recurrent units',
        option_d: 'It stores generated chat conversations into Redis databases',
        correct_option: 'A',
        category: 'GENERATIVE_AI',
        difficulty: 'HARD',
        explanation: 'KV caching avoids redundant O(N^2) calculations during token generation by preserving past Keys and Values, transforming token generation time from O(N^2) to O(N).'
      },
      {
        question: 'In modern frontend architecture, why should the Supabase Service Role key NEVER be exposed to the browser client?',
        option_a: 'Because it slows down Vite bundling performance',
        option_b: 'Because the Service Role key bypasses all Row Level Security (RLS) policies and grants complete unrestricted admin access to all tables',
        option_c: 'Because browsers do not support 256-bit cryptographic keys',
        option_d: 'Because PostgreSQL only permits connections from Linux servers',
        correct_option: 'B',
        category: 'PROGRAMMING',
        difficulty: 'EASY',
        explanation: 'The Supabase Service Role key bypasses all RLS checks and can read, write, or delete any table in the database; it must remain strictly server-side.'
      },
      {
        question: 'In PostgreSQL, what is the role of Row Level Security (RLS)?',
        option_a: 'It compresses table rows into zip files on disk',
        option_b: 'It restricts which rows an authenticated user can select, insert, update, or delete based on evaluated SQL security policies',
        option_c: 'It prevents SQL syntax errors by auto-correcting queries',
        option_d: 'It converts relational tables into GraphQL schemas',
        correct_option: 'B',
        category: 'PROGRAMMING',
        difficulty: 'EASY',
        explanation: 'RLS evaluates declarative policies on each row to ensure users can only access records they are authorized to see or modify.'
      }
    ];

    console.log(`[seed] Inserting ${questions.length} assessment questions...`);
    for (const q of questions) {
      await client.query(`
        INSERT INTO assessment_questions (
          question, option_a, option_b, option_c, option_d, correct_option, category, difficulty, explanation, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
        ON CONFLICT DO NOTHING;
      `, [
        q.question,
        q.option_a,
        q.option_b,
        q.option_c,
        q.option_d,
        q.correct_option,
        q.category,
        q.difficulty,
        q.explanation
      ]);
    }

    // 2. Seed 10 realistic applicants with different statuses for admin dashboard testing
    const applicantProfiles = [
      { name: 'Kavita Menon', email: 'kavita.menon@college.edu', reg: '22BCE1042', dept: 'CSE', year: 3, score: 23, status: 'UNDER_REVIEW', pass: true },
      { name: 'Arjun Das', email: 'arjun.das@college.edu', reg: '22BAI2011', dept: 'AIML', year: 2, score: 21, status: 'APPROVED', pass: true },
      { name: 'Meera Nambiar', email: 'meera.n@college.edu', reg: '23BDS3014', dept: 'Data Science', year: 1, score: 19, status: 'WAITLISTED', pass: true },
      { name: 'Rohan Verma', email: 'rohan.v@college.edu', reg: '22BEC4019', dept: 'ECE', year: 3, score: 11, status: 'REJECTED', pass: false, reason: 'Assessment score below the minimum 60% requirement.' },
      { name: 'Deepa Krishnan', email: 'deepa.k@college.edu', reg: '21BIT5022', dept: 'IT', year: 4, score: 24, status: 'APPROVED', pass: true },
      { name: 'Siddharth Rao', email: 'siddharth.rao@college.edu', reg: '23BCE1089', dept: 'CSE', year: 2, score: 18, status: 'UNDER_REVIEW', pass: true },
      { name: 'Nisha Agarwal', email: 'nisha.a@college.edu', reg: '22BAI2080', dept: 'AIML', year: 3, score: 15, status: 'WAITLISTED', pass: true },
      { name: 'Vikram Joshi', email: 'vikram.j@college.edu', reg: '21BME6011', dept: 'Mechanical', year: 4, score: 10, status: 'REJECTED', pass: false, reason: 'Did not meet the technical threshold in ML fundamentals.' },
      { name: 'Pooja Hegde', email: 'pooja.h@college.edu', reg: '23BAI2104', dept: 'AIML', year: 1, score: 22, status: 'TEST_COMPLETED', pass: true },
      { name: 'Aditya Sen', email: 'aditya.sen@college.edu', reg: '23BCE1120', dept: 'CSE', year: 2, score: null, status: 'TEST_REQUIRED', pass: null }
    ];

    const studentHash = await bcrypt.hash('student123', 10);

    for (let i = 0; i < applicantProfiles.length; i++) {
      const p = applicantProfiles[i];
      // Create user
      const userRes = await client.query(`
        INSERT INTO users (email, password_hash, role)
        VALUES ($1, $2, 'student')
        ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
        RETURNING id
      `, [p.email, studentHash]);
      const userId = userRes.rows[0].id;

      // Create member profile
      const memRes = await client.query(`
        INSERT INTO members (
          user_id, full_name, register_number, department, class_section, year, college_email, phone, status
        )
        VALUES ($1, $2, $3, $4, 'A', $5, $6, '+91 98765432' || $7, $8)
        ON CONFLICT (register_number) DO UPDATE SET full_name = EXCLUDED.full_name
        RETURNING id
      `, [
        userId, p.name, p.reg, p.dept, p.year, p.email,
        (10 + i).toString(),
        p.status === 'APPROVED' ? 'Active' : 'Applicant'
      ]);
      const memberId = memRes.rows[0].id;

      // Create application
      const appNumber = `AIC-2026-${(1001 + i).toString().padStart(6, '0')}`;
      const percentage = p.score !== null ? (p.score / 25 * 100).toFixed(2) : null;
      
      const appRes = await client.query(`
        INSERT INTO membership_applications (
          user_id, member_id, application_number, status, final_score, score_percentage, passed, 
          submitted_at, rejection_reason
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 
          $8, $9)
        ON CONFLICT (application_number) DO UPDATE SET status = EXCLUDED.status, final_score = EXCLUDED.final_score
        RETURNING id
      `, [
        userId, memberId, appNumber, p.status, p.score, percentage, p.pass,
        p.status !== 'TEST_REQUIRED' ? new Date(Date.now() - (10 - i) * 86400000) : null,
        p.reason || null
      ]);
      const appId = appRes.rows[0].id;

      // If approved, create club membership
      if (p.status === 'APPROVED') {
        const memNumber = `AIC-M-2026-${(101 + i).toString().padStart(5, '0')}`;
        await client.query(`
          INSERT INTO club_memberships (user_id, member_id, member_number, status, joined_at, application_id)
          VALUES ($1, $2, $3, 'ACTIVE', CURRENT_TIMESTAMP, $4)
          ON CONFLICT (user_id) DO UPDATE SET status = 'ACTIVE'
        `, [userId, memberId, memNumber, appId]);
      }
    }

    await client.query('COMMIT');
    console.log('[seed] Questions and applicants successfully seeded.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[seed] Error seeding questions and applicants:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Allow direct CLI execution
if (require.main === module) {
  seedQuestionsAndApplicants()
    .then(() => {
      console.log('Done');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
