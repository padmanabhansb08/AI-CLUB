-- ==============================================================================
-- AI CLUB — 20261007000004_seed_questions_and_data.sql
-- Development Seed: 60+ Assessment Questions (9 Categories), 1 Admin,
-- 10 Applicants (All States), Memberships, Events, Courses, Projects, Achievements
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Assessment Question Bank (60+ high quality MCQs across all 9 categories)
-- ------------------------------------------------------------------------------

INSERT INTO public.assessment_questions (
  question, option_a, option_b, option_c, option_d, correct_option, category, difficulty, explanation, is_active
) VALUES
  -- AI_FUNDAMENTALS (7)
  (
    'Which foundational test was proposed in 1950 to evaluate whether a machine exhibits intelligent behavior indistinguishable from human intelligence?',
    'Voight-Kampff Test',
    'Turing Test',
    'Lovelace Criterion',
    'Searle Chinese Room Test',
    'B', 'AI_FUNDAMENTALS', 'EASY',
    'Alan Turing proposed the Turing Test in 1950 to evaluate machine intelligence based on natural language interaction.',
    true
  ),
  (
    'What defines an "agent" in classical Artificial Intelligence architecture?',
    'An algorithm that requires continuous manual human supervision',
    'An entity that perceives its environment through sensors and acts upon it through actuators',
    'A program that only executes fixed linear regression matrices',
    'A distributed database system without operational latency',
    'B', 'AI_FUNDAMENTALS', 'EASY',
    'An AI agent perceives its environment through sensors and acts through actuators toward achieving a goal.',
    true
  ),
  (
    'Which uninformed graph search algorithm guarantees finding the shortest path in an unweighted graph?',
    'Depth-First Search (DFS)',
    'Breadth-First Search (BFS)',
    'Greedy Best-First Search',
    'Iterative Deepening A*',
    'B', 'AI_FUNDAMENTALS', 'MEDIUM',
    'BFS explores nodes level-by-level, guaranteeing the shortest path in unweighted networks.',
    true
  ),
  (
    'In A* search, what must hold true for the heuristic function h(n) to guarantee admissibility and optimal solution paths?',
    'h(n) must equal zero for all non-terminal nodes',
    'h(n) must never overestimate the true cost to reach the goal node',
    'h(n) must always exceed the true path cost by a non-zero margin',
    'h(n) must strictly follow quadratic polynomial growth',
    'B', 'AI_FUNDAMENTALS', 'MEDIUM',
    'An admissible heuristic never overestimates the actual cost to reach the goal, guaranteeing optimal A* solutions.',
    true
  ),
  (
    'Which AI paradigm relies on formal logic, explicit symbols, and ontological rules rather than numerical statistical weights?',
    'Connectionist Artificial Intelligence',
    'Symbolic AI (GOFAI)',
    'Deep Reinforcement Learning',
    'Genetic Algorithmic Search',
    'B', 'AI_FUNDAMENTALS', 'EASY',
    'Symbolic AI (Good Old-Fashioned AI) uses rule-based systems and first-order predicate logic for formal reasoning.',
    true
  ),
  (
    'In adversarial search algorithms like Minimax, what is the exact computational benefit of Alpha-Beta pruning?',
    'It guarantees finding a better move than standard Minimax',
    'It prunes branches that cannot influence the final decision without affecting the minimax value',
    'It eliminates the need for any static heuristic evaluation function',
    'It approximates probabilistic Monte Carlo rollouts',
    'B', 'AI_FUNDAMENTALS', 'MEDIUM',
    'Alpha-Beta pruning skips evaluating subtrees that cannot affect the final minimax decision, cutting the effective branching factor.',
    true
  ),
  (
    'What does the "Chinese Room" thought experiment by John Searle attempt to argue against?',
    'Strong AI and the claim that syntactic manipulation of symbols implies genuine semantic understanding',
    'The physical feasibility of building quantum computers',
    'The convergence theorem of backpropagation',
    'The utility of heuristic state-space searches',
    'A', 'AI_FUNDAMENTALS', 'HARD',
    'Searle argued that running a formal program that manipulates symbols does not produce understanding or consciousness.',
    true
  ),

  -- MACHINE_LEARNING (7)
  (
    'What phenomenon is characterized by high variance and near-zero error on training data but poor generalization on unseen validation data?',
    'Underfitting',
    'Overfitting',
    'Concept Drift',
    'Data Leakage',
    'B', 'MACHINE_LEARNING', 'EASY',
    'Overfitting happens when a model learns training noise and specific samples rather than the underlying general distribution.',
    true
  ),
  (
    'In binary classification with severe class imbalance (e.g. 99% negative vs 1% positive), which evaluation metric is LEAST informative?',
    'Area Under ROC Curve (ROC-AUC)',
    'Precision-Recall AUC (PR-AUC)',
    'Raw Accuracy',
    'Balanced F1-Score',
    'C', 'MACHINE_LEARNING', 'EASY',
    'Raw accuracy is misleading in imbalanced datasets because a trivial model predicting only the majority class achieves 99% accuracy.',
    true
  ),
  (
    'Which regularization technique adds a penalty proportional to the absolute values of the weight coefficients (L1 penalty) to induce sparsity?',
    'Ridge Regularization',
    'Lasso Regularization',
    'Dropout',
    'Batch Normalization',
    'B', 'MACHINE_LEARNING', 'MEDIUM',
    'Lasso (L1 regularization) shrinks less important feature weights exactly to zero, performing automated feature selection.',
    true
  ),
  (
    'What is the fundamental difference between Bagging (e.g. Random Forest) and Boosting (e.g. XGBoost)?',
    'Bagging trains models sequentially; Boosting trains models in parallel',
    'Bagging trains independent models in parallel to reduce variance; Boosting trains sequential models focusing on earlier errors to reduce bias',
    'Bagging is only used for unsupervised clustering; Boosting is for supervised regression',
    'Bagging requires gradient calculations; Boosting does not',
    'B', 'MACHINE_LEARNING', 'MEDIUM',
    'Bagging reduces variance via bootstrap aggregation in parallel; Boosting builds sequential predictors focusing on previous errors.',
    true
  ),
  (
    'In Support Vector Machines (SVM), what is the "Kernel Trick"?',
    'Downsampling support vectors to reduce computational memory',
    'Implicitly computing the inner product in a high-dimensional feature space without explicitly calculating coordinates in that space',
    'Converting continuous output labels into discrete binary classes',
    'Replacing quadratic optimization with simple linear regression',
    'B', 'MACHINE_LEARNING', 'HARD',
    'The kernel trick computes inner products in high-dimensional feature spaces implicitly using kernel functions like RBF or polynomial.',
    true
  ),
  (
    'Which unsupervised clustering algorithm requires specifying the number of clusters k in advance and is sensitive to outliers?',
    'DBSCAN',
    'Agglomerative Hierarchical Clustering',
    'K-Means Clustering',
    'Mean-Shift Clustering',
    'C', 'MACHINE_LEARNING', 'EASY',
    'K-Means requires a predefined k and updates cluster centroids iteratively based on Euclidean mean distances, making it sensitive to outliers.',
    true
  ),
  (
    'What does Principal Component Analysis (PCA) mathematically maximize when projecting data onto orthogonal axes?',
    'The classification margin between distinct classes',
    'The variance of the projected data along each successive principal component',
    'The entropy of the target response variable',
    'The mutual information between non-linear features',
    'B', 'MACHINE_LEARNING', 'MEDIUM',
    'PCA computes orthogonal eigenvectors of the covariance matrix, choosing directions that maximize variance and minimize reconstruction loss.',
    true
  ),

  -- PYTHON (7)
  (
    'What is the computational time complexity of looking up a key in a standard Python dictionary in average case scenarios?',
    'O(1)',
    'O(log n)',
    'O(n)',
    'O(n log n)',
    'A', 'PYTHON', 'EASY',
    'Python dicts are implemented as hash tables with open addressing, providing O(1) average lookup and insertion time.',
    true
  ),
  (
    'What Python keyword turns a normal function into a generator that yields values lazily on demand?',
    'return',
    'yield',
    'defer',
    'async',
    'B', 'PYTHON', 'EASY',
    'The yield keyword produces a generator object, suspending execution state and resuming when __next__() is called.',
    true
  ),
  (
    'In Python, how does the Global Interpreter Lock (GIL) affect multithreaded CPU-bound programs in CPython?',
    'It distributes bytecode execution equally across all physical CPU cores',
    'It prevents multiple native OS threads from executing Python bytecodes concurrently in a single process',
    'It isolates thread memory spaces into distinct virtual machines',
    'It automatically compiles Python loops to native machine assembly',
    'B', 'PYTHON', 'MEDIUM',
    'The GIL in CPython ensures that only one thread executes Python bytecode at any given instant, limiting CPU-bound multithreading.',
    true
  ),
  (
    'What is the difference between shallow copy (copy.copy) and deep copy (copy.deepcopy) in Python?',
    'Shallow copy copies references to nested objects; deep copy recursively duplicates all nested objects',
    'Shallow copy only works on primitive types; deep copy only works on classes',
    'Shallow copy executes in O(n^2); deep copy executes in O(1)',
    'There is no difference in modern Python 3.12+',
    'A', 'PYTHON', 'MEDIUM',
    'A shallow copy constructs a new compound object but inserts references to the original nested elements; deep copy duplicates everything recursively.',
    true
  ),
  (
    'What does the `@functools.lru_cache` decorator do when applied to a Python function?',
    'Persists the function output to an external Redis cluster',
    'Memoizes the function results in an in-memory Least Recently Used cache to avoid redundant recalculation for identical arguments',
    'Compiles the Python function with Cython C-bindings',
    'Limits execution frequency to prevent system rate-limit throttling',
    'B', 'PYTHON', 'EASY',
    'lru_cache wraps a callable with a memoizing callable that saves up to maxsize recent calls.',
    true
  ),
  (
    'What is the primary benefit of Python''s `__slots__` attribute when defined on a class with millions of instances?',
    'It prevents any subclassing of the parent class',
    'It avoids the memory overhead of a per-instance `__dict__` by reserving fixed attribute descriptors',
    'It enables SIMD hardware vectorization on class methods',
    'It forces strict type checking at runtime',
    'B', 'PYTHON', 'HARD',
    '__slots__ reserves space for declared attributes, skipping the per-instance dictionary and drastically reducing memory consumption.',
    true
  ),
  (
    'Which built-in Python module provides data structures like `deque`, `Counter`, and `defaultdict`?',
    'itertools',
    'collections',
    'functools',
    'dataclasses',
    'B', 'PYTHON', 'EASY',
    'The collections module provides specialized container datatypes beyond dict, list, set, and tuple.',
    true
  ),

  -- PROGRAMMING (6)
  (
    'What does the SOLID design principle "L" stand for in software engineering?',
    'Linear Inheritance Principle',
    'Liskov Substitution Principle',
    'Lazy Initialization Principle',
    'Loose Coupling Principle',
    'B', 'PROGRAMMING', 'EASY',
    'Liskov Substitution Principle states that objects of a superclass should be replaceable with objects of a subclass without affecting program correctness.',
    true
  ),
  (
    'In database management systems, what does the ACID acronym stand for?',
    'Asynchronous, Concurrent, Isolated, Distributed',
    'Atomicity, Consistency, Isolation, Durability',
    'Authentication, Cryptography, Integrity, Decoupling',
    'Availability, Consistency, Invariance, Durability',
    'B', 'PROGRAMMING', 'EASY',
    'ACID guarantees transactional validity: Atomicity (all or nothing), Consistency, Isolation, and Durability.',
    true
  ),
  (
    'Which data structure is fundamentally used to implement Function Call Stacks and Depth-First Search traversal?',
    'Queue (FIFO)',
    'Stack (LIFO)',
    'Max-Heap',
    'B-Tree',
    'B', 'PROGRAMMING', 'EASY',
    'A Stack operates on Last-In, First-Out (LIFO) semantics, making it ideal for call traces and recursive backtracking.',
    true
  ),
  (
    'What is the worst-case time complexity of QuickSort when using a naive fixed pivot on already sorted data?',
    'O(log n)',
    'O(n log n)',
    'O(n^2)',
    'O(2^n)',
    'C', 'PROGRAMMING', 'MEDIUM',
    'QuickSort degrades to O(n^2) when poor pivot selection yields unbalanced 1-element and (n-1)-element partitions.',
    true
  ),
  (
    'In RESTful API design, which HTTP method is defined as idempotent and intended to update or replace an entire existing resource representation?',
    'POST',
    'PUT',
    'PATCH',
    'CONNECT',
    'B', 'PROGRAMMING', 'MEDIUM',
    'PUT is idempotent; sending the same PUT request multiple times leaves the server resource in the exact same state.',
    true
  ),
  (
    'What is the primary architectural problem solved by Connection Pooling in server-side database access layers?',
    'Eliminating the need for SQL query parsing',
    'Reusing established TCP/TLS database connections to avoid expensive connection handshake latency on every request',
    'Converting PostgreSQL queries into NoSQL JSON documents',
    'Providing automatic row-level encryption at rest',
    'B', 'PROGRAMMING', 'MEDIUM',
    'Connection pools maintain pre-warmed database connections, preventing the overhead of repeatedly opening and closing sockets.',
    true
  ),

  -- DATA_SCIENCE (7)
  (
    'In NumPy, what is "array broadcasting"?',
    'Sending array data over a WebSocket network stream',
    'A set of rules allowing arithmetic operations on arrays of differing shapes without making unnecessary data copies',
    'Splitting an array across multiple CPU threads',
    'Compressing floating-point arrays into 8-bit integers',
    'B', 'DATA_SCIENCE', 'MEDIUM',
    'Broadcasting describes how NumPy treats arrays with different shapes during arithmetic operations to vectorize loops without memory copies.',
    true
  ),
  (
    'What does the Central Limit Theorem state about sample means from any population distribution with finite variance?',
    'The sample mean will always equal the population median',
    'As sample size n increases, the distribution of sample means approaches a normal Gaussian distribution',
    'All sample data will eventually become uniform',
    'Standard deviation becomes zero as sample size reaches 30',
    'B', 'DATA_SCIENCE', 'MEDIUM',
    'The Central Limit Theorem proves that sample means converge to a normal distribution as sample size grows, regardless of parent distribution shape.',
    true
  ),
  (
    'In pandas, what is the key difference between `.loc` and `.iloc`?',
    '`.loc` is label-based indexing; `.iloc` is integer-position based indexing',
    '`.loc` operates on columns only; `.iloc` operates on rows only',
    '`.loc` creates a new DataFrame copy; `.iloc` creates a view',
    '`.loc` is deprecated in pandas 2.0+',
    'A', 'DATA_SCIENCE', 'EASY',
    '.loc accesses rows and columns by their index/column names; .iloc accesses elements by integer positional coordinates.',
    true
  ),
  (
    'What type of visualization is most suitable for evaluating the empirical distribution, median, quartiles, and outliers of a continuous numerical variable?',
    'Pie chart',
    'Box plot (Box-and-Whisker)',
    'Treemap',
    'Radar chart',
    'B', 'DATA_SCIENCE', 'EASY',
    'A box plot shows median, interquartile range (IQR), whiskers, and outlier data points concisely.',
    true
  ),
  (
    'What is the impact of Multicollinearity in Ordinary Least Squares (OLS) linear regression?',
    'It causes training errors to become infinite',
    'It inflates the variance of coefficient estimates, making them unstable and difficult to interpret',
    'It forces all coefficients to become exactly zero',
    'It invalidates the calculation of R-squared',
    'B', 'DATA_SCIENCE', 'HARD',
    'Multicollinearity does not reduce overall predictive power of the model, but makes individual coefficient estimations erratic and statistically insignificant.',
    true
  ),
  (
    'Which missing data imputation technique replaces missing values with the most frequently observed value in a categorical column?',
    'Mean imputation',
    'Mode imputation',
    'Median imputation',
    'K-Nearest Neighbors distance regression',
    'B', 'DATA_SCIENCE', 'EASY',
    'Mode represents the most frequent observation and is standard for categorical feature imputation.',
    true
  ),
  (
    'What does a p-value of 0.03 indicate when testing a null hypothesis at an alpha significance level of 0.05?',
    'The null hypothesis is definitely 100% true',
    'There is statistically significant evidence to reject the null hypothesis at the 5% level',
    'The experiment must be discarded due to high variance',
    'The effect size is exactly 0.03 units',
    'B', 'DATA_SCIENCE', 'MEDIUM',
    'Since p-value (0.03) is less than alpha (0.05), we reject the null hypothesis in favor of the alternative hypothesis.',
    true
  ),

  -- DEEP_LEARNING (7)
  (
    'Which activation function helps alleviate the Vanishing Gradient problem in deep networks by having a constant gradient of 1 for positive inputs?',
    'Sigmoid',
    'Hyperbolic Tangent (tanh)',
    'Rectified Linear Unit (ReLU)',
    'Softmax',
    'C', 'DEEP_LEARNING', 'EASY',
    'ReLU has a derivative of 1 for all positive inputs, preventing exponential decay of backpropagated gradients through many hidden layers.',
    true
  ),
  (
    'In Convolutional Neural Networks (CNNs), what is the primary role of a Max Pooling layer?',
    'To increase the channel depth of feature maps',
    'To downsample spatial dimensions (height/width), reducing parameters and conferring translation invariance',
    'To calculate cross-entropy loss gradients',
    'To normalize activations across mini-batches',
    'B', 'DEEP_LEARNING', 'MEDIUM',
    'Max pooling extracts maximum values within local windows to reduce spatial dimensions, computation, and provide spatial invariance.',
    true
  ),
  (
    'What is the fundamental purpose of Batch Normalization in deep neural networks?',
    'To normalize network weights before initialization',
    'To normalize layer activations across mini-batches, stabilizing internal covariate shift and accelerating convergence',
    'To prevent GPU memory leaks during asynchronous gradient descent',
    'To convert multi-class outputs into posterior probabilities',
    'B', 'DEEP_LEARNING', 'MEDIUM',
    'Batch Normalization standardizes intermediate activations per batch, allowing higher learning rates and reducing dependency on initialization.',
    true
  ),
  (
    'What mathematical mechanism in the Transformer architecture allows tokens to attend to other tokens regardless of distance without recurrence?',
    'Convolutional Residual Blocks',
    'Scaled Dot-Product Self-Attention',
    'Long Short-Term Memory Gating',
    'Markov State Transitions',
    'B', 'DEEP_LEARNING', 'MEDIUM',
    'Self-attention calculates compatibility scores between Query and Key vectors to compute weighted sums of Value vectors across the entire sequence in O(1) sequential steps.',
    true
  ),
  (
    'Why is Softmax used as the final layer activation for multi-class classification problems?',
    'It scales all logits into a valid probability distribution where values sum to 1',
    'It eliminates negative numbers by taking their absolute value',
    'It computes the gradient of the loss function directly',
    'It accelerates backward pass computations by 2x',
    'A', 'DEEP_LEARNING', 'EASY',
    'Softmax applies the normalized exponential function to convert real-valued logits into non-negative values that sum to 1.',
    true
  ),
  (
    'In recurrent networks, what architectural feature enables LSTMs to overcome the vanishing gradient problem over long sequences compared to vanilla RNNs?',
    'A dedicated additive Constant Error Carousel (Cell State) regulated by input, forget, and output gates',
    'Completely eliminating backward propagation through time',
    'Using exclusively linear activation functions',
    'Replacing matrix multiplications with lookup tables',
    'A', 'DEEP_LEARNING', 'HARD',
    'The LSTM cell state carries information down the sequence with linear additive updates modulated by forget and input gates.',
    true
  ),
  (
    'What does the Adam optimizer combine to achieve adaptive per-parameter learning rates?',
    'Momentum (first moment / moving average of gradients) and RMSprop (second moment / moving average of squared gradients)',
    'Simulated annealing and genetic cross-over',
    'L1 and L2 weight decay penalties',
    'Stochastic gradient descent and Newton-Raphson curvature',
    'A', 'DEEP_LEARNING', 'MEDIUM',
    'Adam maintains exponentially decaying averages of past gradients (momentum) and past squared gradients (RMSprop) with bias corrections.',
    true
  ),

  -- GENERATIVE_AI (7)
  (
    'What does "temperature" control when sampling from an Autoregressive Large Language Model?',
    'The speed of token generation per second',
    'The entropy of the probability distribution over candidate tokens (randomness vs determinism)',
    'The maximum number of tokens allowed in the prompt context',
    'The GPU hardware thermal threshold',
    'B', 'GENERATIVE_AI', 'EASY',
    'Temperature divides logits before softmax; lower temperature makes high-probability tokens more dominant (deterministic), while higher temperature flattens probabilities (more diverse/creative).',
    true
  ),
  (
    'What is the primary role of Retrieval-Augmented Generation (RAG) in enterprise AI applications?',
    'To retrain foundation model weights from scratch every night',
    'To fetch relevant factual context from external knowledge bases and inject it into the prompt to reduce hallucinations and ground answers',
    'To convert text responses into high-resolution images',
    'To compress model weights into INT4 quantization formats',
    'B', 'GENERATIVE_AI', 'EASY',
    'RAG retrieves relevant domain documents via vector/hybrid search and inserts them into prompt context so LLMs answer using fresh, verifiable facts.',
    true
  ),
  (
    'In LoRA (Low-Rank Adaptation) parameter-efficient fine-tuning (PEFT), how are model weights updated?',
    'By updating all parameters across every transformer block with full FP32 gradients',
    'By freezing base model weights and injecting trainable low-rank decomposition rank matrices (A and B) into attention projections',
    'By pruning 90% of model neurons before training',
    'By appending synthetic prefix tokens to user prompts',
    'B', 'GENERATIVE_AI', 'MEDIUM',
    'LoRA decomposes weight updates delta-W into two low-rank matrices A and B (rank r << d), drastically reducing memory and trainable parameter count.',
    true
  ),
  (
    'In generative diffusion models (e.g. Stable Diffusion), what does the reverse diffusion process accomplish?',
    'Adding Gaussian noise to clear images in 1000 scheduled timesteps',
    'Iteratively predicting and removing noise from a noisy latent representation to synthesize a clean, high-fidelity sample',
    'Extracting token embeddings from prompt text',
    'Downsampling image resolution by factor of 8',
    'B', 'GENERATIVE_AI', 'MEDIUM',
    'The forward process adds scheduled noise until pure Gaussian noise remains; the reverse process trains a U-Net to iteratively denoise and reconstruct images.',
    true
  ),
  (
    'What is the purpose of Reinforcement Learning from Human Feedback (RLHF) during LLM post-training alignment?',
    'To increase the raw parameter capacity of the model',
    'To align model outputs with human intentions regarding helpfulness, accuracy, and safety using learned reward functions',
    'To make the transformer architecture purely recurrent',
    'To translate foreign language tokens into English',
    'B', 'GENERATIVE_AI', 'MEDIUM',
    'RLHF uses human preference data to train a reward model, which then optimizes policy weights via PPO/DPO to produce helpful, honest, and harmless responses.',
    true
  ),
  (
    'What is a "hallucination" in the context of Large Language Models?',
    'An intentional poetic output generated by prompt instructions',
    'A generated response that sounds plausible and authoritative but is factually incorrect or ungrounded in source data',
    'A CUDA out-of-memory error during inference',
    'A token decode buffer overflow exception',
    'B', 'GENERATIVE_AI', 'EASY',
    'Hallucinations are fluent, confident, but factually fabricated statements generated because LLMs optimize next-token probabilities rather than factual ground truth.',
    true
  ),
  (
    'What is the computational benefit of KV-Caching (Key-Value caching) during LLM autoregressive inference generation?',
    'It caches computed Key and Value attention tensors of previous prompt tokens so they do not need to be recalculated at each new token generation step',
    'It compresses model weights into 2-bit quantization',
    'It replaces multi-head attention with single-head recurrent units',
    'It stores generated chat conversations into Redis databases',
    'A', 'GENERATIVE_AI', 'HARD',
    'KV caching avoids redundant O(N^2) calculations during token generation by preserving past Keys and Values, transforming token generation time from O(N^2) to O(N).',
    true
  ),

  -- LOGICAL_REASONING (6)
  (
    'If all Neural Networks are Function Approximators, and some Function Approximators are Convex Optimizers, which deduction is logically certain?',
    'All Neural Networks are definitely Convex Optimizers',
    'Some Function Approximators are Neural Networks',
    'No Neural Network can ever approximate non-linear data',
    'All Convex Optimizers are Neural Networks',
    'B', 'LOGICAL_REASONING', 'EASY',
    'Since all Neural Networks belong to the set of Function Approximators, the converse deduction that some Function Approximators are Neural Networks is necessarily true.',
    true
  ),
  (
    'Look at the number sequence: 2, 6, 12, 20, 30, ?. What is the logical subsequent term?',
    '38',
    '40',
    '42',
    '44',
    'C', 'LOGICAL_REASONING', 'MEDIUM',
    'The differences between terms are +4, +6, +8, +10. The next difference is +12; therefore, 30 + 12 = 42 (also n*(n+1): 1*2, 2*3, 3*4, 4*5, 5*6, 6*7=42).',
    true
  ),
  (
    'A neural network training batch finishes in 6 minutes when running on 2 GPUs. Assuming ideal linear parallel scaling with zero communication overhead, how long will it take on 6 GPUs?',
    '1 minute',
    '2 minutes',
    '3 minutes',
    '4 minutes',
    'B', 'LOGICAL_REASONING', 'EASY',
    'Moving from 2 GPUs to 6 GPUs represents a 3x speedup. 6 minutes divided by 3 equals 2 minutes.',
    true
  ),
  (
    'A machine learning test set contains 200 items. A model predicts 50 positive instances, and 45 of those are true positives. What is the Precision of the model?',
    '80%',
    '90%',
    '95%',
    '22.5%',
    'B', 'LOGICAL_REASONING', 'EASY',
    'Precision = True Positives / Total Predicted Positives = 45 / 50 = 0.90 or 90%.',
    true
  ),
  (
    'In formal logic, if "P implies Q" is true, which of the following statements is logically equivalent to it (its contrapositive)?',
    'Q implies P',
    'Not Q implies Not P',
    'Not P implies Not Q',
    'P and Q are always both true',
    'B', 'LOGICAL_REASONING', 'MEDIUM',
    'The contrapositive of an implication (Not Q -> Not P) is always logically equivalent to the original statement (P -> Q).',
    true
  ),
  (
    'If 5 workers can annotate 500 images in 5 hours, how many hours will it take 10 workers to annotate 1000 images at the exact same working rate?',
    '2.5 hours',
    '5 hours',
    '10 hours',
    '20 hours',
    'B', 'LOGICAL_REASONING', 'MEDIUM',
    'Each worker annotates 100 images in 5 hours (20 images/worker/hour). 10 workers annotate 200 images/hour. 1000 images / 200 images/hour = 5 hours.',
    true
  ),

  -- PROBLEM_SOLVING (6)
  (
    'You are designing a rate-limiting algorithm for an AI API. Which algorithmic structure efficiently tracks sliding window timestamps with minimal memory overhead?',
    'A doubly-linked list or ring buffer of epoch millisecond timestamps',
    'A full database table scan on every incoming HTTP call',
    'A fixed 24-hour sleep timer thread',
    'A static array of size 1,000,000 strings',
    'A', 'PROBLEM_SOLVING', 'MEDIUM',
    'A sliding window log using a ring buffer or sorted set tracks exact request timestamps within the active time window with minimal space.',
    true
  ),
  (
    'When training an LLM, GPU memory is overwhelmed by large batch sizes. Which technique accumulates gradients across multiple small micro-batches before updating weights?',
    'Stochastic Weight Averaging',
    'Gradient Accumulation',
    'Layer Freezing',
    'Early Stopping',
    'B', 'PROBLEM_SOLVING', 'EASY',
    'Gradient Accumulation calculates gradients in smaller micro-batches without updating weights until a target effective batch size is accumulated.',
    true
  ),
  (
    'A database query on a table with 10 million rows is taking 4.2 seconds to filter by `(department, year)`. What is the most effective immediate fix?',
    'Rebuilding the entire database server on bare metal hardware',
    'Creating a composite B-Tree index on `(department, year)`',
    'Replacing PostgreSQL with a CSV file reader',
    'Converting all text columns to JSON blobs',
    'B', 'PROBLEM_SOLVING', 'EASY',
    'A composite index on (department, year) allows the database query planner to perform index range scans in logarithmic time O(log N).',
    true
  ),
  (
    'In an AI club voting system, you must select the top 3 projects from an unsorted list of 100,000 student submissions without sorting the entire dataset. What is the most optimal approach?',
    'Full Quicksort of all 100,000 records',
    'A Min-Heap of size 3 that tracks the 3 largest elements in O(N log k) time',
    'Bubble Sort terminating after 10 passes',
    'Random sampling of 10 records',
    'B', 'PROBLEM_SOLVING', 'MEDIUM',
    'A min-heap of size k=3 processes N items in O(N log 3) = O(N) time and requires only O(k) additional memory space.',
    true
  ),
  (
    'A microservice architecture suffers from cascading failures when an external AI model provider experiences 504 Gateway Timeouts. What software resilience pattern should be implemented?',
    'Infinite Retry Loop Pattern',
    'Circuit Breaker Pattern with Fallback and Exponential Backoff',
    'Fire-and-Forget Pattern without error logging',
    'Single Point of Failure Pattern',
    'B', 'PROBLEM_SOLVING', 'MEDIUM',
    'The Circuit Breaker pattern trips open when downstream failures cross a threshold, failing fast with a fallback and preventing system-wide resource exhaustion.',
    true
  ),
  (
    'To guarantee that a student assessment attempt cannot be submitted after the 30-minute limit even if the student tampers with their local browser clock, what must be done?',
    'Rely on JavaScript `window.setInterval` in the React frontend',
    'Enforce the check server-side in PostgreSQL/API by comparing `CURRENT_TIMESTAMP` against `expires_at` stored in the database',
    'Disable developer tools in the user browser window',
    'Use local storage cookies to record time',
    'B', 'PROBLEM_SOLVING', 'EASY',
    'Server-authoritative timestamp validation guarantees security because the client cannot tamper with server or database clocks.',
    true
  )
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. Seed Admin & Student Applicant Profiles
-- ------------------------------------------------------------------------------

-- Pre-defined UUIDs for deterministic testing
-- Admin: a0000000-0000-0000-0000-000000000001
-- Students: s0000000-0000-0000-0000-000000000001 through s0000000-0000-0000-0000-000000000010

INSERT INTO public.profiles (
  id, user_id, full_name, email, phone, department, year, section, role, is_active, bio
) VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Dr. Vikram Sarabhai',
    'admin@aiclub.org',
    '+91 9876543210',
    'AI & Data Systems',
    4,
    'Faculty',
    'ADMIN',
    true,
    'Lead Faculty Advisor and AI Club Executive Administrator.'
  ),
  (
    'b0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Kavita Menon',
    'kavita.menon@college.edu',
    '+91 9876543211',
    'CSE',
    3,
    'A',
    'STUDENT',
    true,
    'Specializing in Deep Learning and Computer Vision algorithms.'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    'Arjun Das',
    'arjun.das@college.edu',
    '+91 9876543212',
    'AIML',
    2,
    'B',
    'STUDENT',
    true,
    'Passionate about Generative AI architectures and transformer models.'
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000003',
    'Meera Nambiar',
    'meera.n@college.edu',
    '+91 9876543213',
    'Data Science',
    1,
    'A',
    'STUDENT',
    true,
    'First-year researcher interested in statistical data modeling.'
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000004',
    'Rohan Verma',
    'rohan.v@college.edu',
    '+91 9876543214',
    'ECE',
    3,
    'C',
    'STUDENT',
    true,
    'Robotics and hardware acceleration of neural networks.'
  ),
  (
    'b0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000005',
    'Deepa Krishnan',
    'deepa.k@college.edu',
    '+91 9876543215',
    'IT',
    4,
    'A',
    'STUDENT',
    true,
    'Senior student working on distributed inference pipelines.'
  ),
  (
    'b0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000006',
    'Siddharth Rao',
    'siddharth.rao@college.edu',
    '+91 9876543216',
    'CSE',
    2,
    'A',
    'STUDENT',
    true,
    'Competitive programmer transitioning into reinforcement learning.'
  ),
  (
    'b0000000-0000-0000-0000-000000000007',
    'b0000000-0000-0000-0000-000000000007',
    'Nisha Agarwal',
    'nisha.a@college.edu',
    '+91 9876543217',
    'AIML',
    3,
    'B',
    'STUDENT',
    true,
    'NLP enthusiast focusing on multilingual language models.'
  ),
  (
    'b0000000-0000-0000-0000-000000000008',
    'b0000000-0000-0000-0000-000000000008',
    'Vikram Joshi',
    'vikram.j@college.edu',
    '+91 9876543218',
    'Mechanical',
    4,
    'A',
    'STUDENT',
    true,
    'Exploring physics-informed neural networks in thermo-fluids.'
  ),
  (
    'b0000000-0000-0000-0000-000000000009',
    'b0000000-0000-0000-0000-000000000009',
    'Pooja Hegde',
    'pooja.h@college.edu',
    '+91 9876543219',
    'AIML',
    1,
    'A',
    'STUDENT',
    true,
    'Undergraduate eager to collaborate on AI open-source projects.'
  ),
  (
    'b0000000-0000-0000-0000-000000000010',
    'b0000000-0000-0000-0000-000000000010',
    'Aditya Sen',
    'aditya.sen@college.edu',
    '+91 9876543220',
    'CSE',
    2,
    'C',
    'STUDENT',
    true,
    'Full-stack and cloud engineer looking to join AI Club teams.'
  )
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. Seed Membership Applications (All Workflow States)
-- ------------------------------------------------------------------------------

INSERT INTO public.membership_applications (
  id, user_id, application_number, status, final_score, score_percentage, passed,
  submitted_at, reviewed_at, reviewed_by, admin_notes, rejection_reason
) VALUES
  -- 1. UNDER_REVIEW (High score, awaiting final committee interview)
  (
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'AIC-2026-000001',
    'UNDER_REVIEW',
    23, 92.00, true,
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    NULL, NULL,
    'Exceptional performance across ML and Deep Learning sections. Candidate scheduled for final team matching.',
    NULL
  ),
  -- 2. APPROVED (Official Club Member)
  (
    'c0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    'AIC-2026-000002',
    'APPROVED',
    21, 84.00, true,
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    'a0000000-0000-0000-0000-000000000001',
    'Approved for Autonomous Systems Core Team.',
    NULL
  ),
  -- 3. WAITLISTED (Passed test, pool capacity reached)
  (
    'c0000000-0000-0000-0000-000000000003',
    'b0000000-0000-0000-0000-000000000003',
    'AIC-2026-000003',
    'WAITLISTED',
    19, 76.00, true,
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    'a0000000-0000-0000-0000-000000000001',
    'Promising first-year applicant. Put on batch 2 waitlist.',
    NULL
  ),
  -- 4. REJECTED (Score below 60% requirement)
  (
    'c0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000004',
    'AIC-2026-000004',
    'REJECTED',
    11, 44.00, false,
    CURRENT_TIMESTAMP - INTERVAL '4 days',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    'a0000000-0000-0000-0000-000000000001',
    'Assessment score below the mandatory 60% pass threshold.',
    'Assessment score below the minimum 60% requirement. Eligible to reapply next semester.'
  ),
  -- 5. APPROVED (Official Senior Member)
  (
    'c0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000005',
    'AIC-2026-000005',
    'APPROVED',
    24, 96.00, true,
    CURRENT_TIMESTAMP - INTERVAL '6 days',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    'a0000000-0000-0000-0000-000000000001',
    'Assigned as Research Lead for Cloud AI Infrastructure.',
    NULL
  ),
  -- 6. UNDER_REVIEW
  (
    'c0000000-0000-0000-0000-000000000006',
    'b0000000-0000-0000-0000-000000000006',
    'AIC-2026-000006',
    'UNDER_REVIEW',
    18, 72.00, true,
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    NULL, NULL,
    'Strong algorithmic background. Reviewing code portfolio.',
    NULL
  ),
  -- 7. WAITLISTED
  (
    'c0000000-0000-0000-0000-000000000007',
    'b0000000-0000-0000-0000-000000000007',
    'AIC-2026-000007',
    'WAITLISTED',
    16, 64.00, true,
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '12 hours',
    'a0000000-0000-0000-0000-000000000001',
    'Meets pass threshold. Waitlisted for NLP subgroup slot.',
    NULL
  ),
  -- 8. REJECTED
  (
    'c0000000-0000-0000-0000-000000000008',
    'b0000000-0000-0000-0000-000000000008',
    'AIC-2026-000008',
    'REJECTED',
    10, 40.00, false,
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    'a0000000-0000-0000-0000-000000000001',
    'Technical threshold not met.',
    'Did not meet the technical threshold in ML fundamentals.'
  ),
  -- 9. TEST_COMPLETED (Awaiting review queue)
  (
    'c0000000-0000-0000-0000-000000000009',
    'b0000000-0000-0000-0000-000000000009',
    'AIC-2026-000009',
    'TEST_COMPLETED',
    22, 88.00, true,
    CURRENT_TIMESTAMP - INTERVAL '4 hours',
    NULL, NULL,
    'Completed assessment today. Queued for admin committee evaluation.',
    NULL
  ),
  -- 10. TEST_REQUIRED (Applicant registered, ready to begin test)
  (
    'c0000000-0000-0000-0000-000000000010',
    'b0000000-0000-0000-0000-000000000010',
    'AIC-2026-000010',
    'TEST_REQUIRED',
    NULL, NULL, NULL,
    NULL, NULL, NULL,
    'Profile completed. 25-MCQ technical assessment pending.',
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. Seed Club Memberships for Approved Members
-- ------------------------------------------------------------------------------

INSERT INTO public.club_memberships (
  id, user_id, member_number, application_id, status, joined_at, approved_by
) VALUES
  (
    'd0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000002',
    'AIC-M-2026-00101',
    'c0000000-0000-0000-0000-000000000002',
    'ACTIVE',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    'a0000000-0000-0000-0000-000000000001'
  ),
  (
    'd0000000-0000-0000-0000-000000000005',
    'b0000000-0000-0000-0000-000000000005',
    'AIC-M-2026-00102',
    'c0000000-0000-0000-0000-000000000005',
    'ACTIVE',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    'a0000000-0000-0000-0000-000000000001'
  )
ON CONFLICT (user_id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. Seed Announcements
-- ------------------------------------------------------------------------------

INSERT INTO public.announcements (
  title, content, category, priority, target_audience, status, published_at, created_by
) VALUES
  (
    'Welcome to AI CLUB — 2026 Induction Cycle',
    'Welcome to all prospective applicants and members. The 2026 application cycle is now officially live. Complete your profile and proceed to the 25-MCQ technical assessment.',
    'GENERAL',
    'HIGH',
    'ALL_STUDENTS',
    'PUBLISHED',
    CURRENT_TIMESTAMP - INTERVAL '7 days',
    'a0000000-0000-0000-0000-000000000001'
  ),
  (
    'Technical Assessment Protocol & Time Guidelines',
    'The assessment consists of 25 randomized questions across 9 AI/ML/Coding domains. The timer is strictly 30 minutes and enforced server-side. Ensure a stable network connection before starting.',
    'ASSESSMENT',
    'HIGH',
    'APPLICANTS',
    'PUBLISHED',
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    'a0000000-0000-0000-0000-000000000001'
  ),
  (
    'All-Hands Orientation & Lab Keycard Distribution',
    'Approved members are requested to attend the Orientation on Friday at 4:30 PM in Lab 402 for GPU cluster onboarding and access keys.',
    'COMMUNITY',
    'MEDIUM',
    'APPROVED_MEMBERS',
    'PUBLISHED',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    'a0000000-0000-0000-0000-000000000001'
  )
ON CONFLICT DO NOTHING;
