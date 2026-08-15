export interface SkillDefinition {
  canonical: string;
  category: 'Languages' | 'Frameworks & Libraries' | 'Databases' | 'Cloud & DevOps' | 'AI & ML' | 'Data Science' | 'Tools & Methods';
  aliases: string[];
}

export const SKILL_TAXONOMY: SkillDefinition[] = [
  // Languages
  { canonical: 'Python', category: 'Languages', aliases: ['python', 'py', 'python3', 'python 3'] },
  { canonical: 'Java', category: 'Languages', aliases: ['java', 'core java', 'j2ee'] },
  { canonical: 'C', category: 'Languages', aliases: ['c lang', 'c language'] },
  { canonical: 'C++', category: 'Languages', aliases: ['cpp', 'c++', 'c plus plus'] },
  { canonical: 'C#', category: 'Languages', aliases: ['c#', 'csharp', 'c sharp', '.net'] },
  { canonical: 'JavaScript', category: 'Languages', aliases: ['javascript', 'js', 'es6', 'es2020', 'ecmascript'] },
  { canonical: 'TypeScript', category: 'Languages', aliases: ['typescript', 'ts'] },
  { canonical: 'Go', category: 'Languages', aliases: ['golang', 'go lang'] },
  { canonical: 'Rust', category: 'Languages', aliases: ['rust', 'rustlang'] },
  { canonical: 'PHP', category: 'Languages', aliases: ['php', 'php7', 'php8'] },
  { canonical: 'Ruby', category: 'Languages', aliases: ['ruby', 'ruby on rails'] },
  { canonical: 'SQL', category: 'Languages', aliases: ['sql', 'structured query language', 't-sql', 'pl/sql'] },
  { canonical: 'HTML', category: 'Languages', aliases: ['html', 'html5'] },
  { canonical: 'CSS', category: 'Languages', aliases: ['css', 'css3'] },

  // Frameworks & Libraries
  { canonical: 'React', category: 'Frameworks & Libraries', aliases: ['react', 'reactjs', 'react.js', 'react native'] },
  { canonical: 'Node.js', category: 'Frameworks & Libraries', aliases: ['node', 'nodejs', 'node.js'] },
  { canonical: 'Express', category: 'Frameworks & Libraries', aliases: ['express', 'expressjs', 'express.js'] },
  { canonical: 'FastAPI', category: 'Frameworks & Libraries', aliases: ['fastapi', 'fast api'] },
  { canonical: 'Django', category: 'Frameworks & Libraries', aliases: ['django', 'django rest framework', 'drf'] },
  { canonical: 'Flask', category: 'Frameworks & Libraries', aliases: ['flask'] },
  { canonical: 'Spring Boot', category: 'Frameworks & Libraries', aliases: ['spring', 'spring boot', 'springboot'] },
  { canonical: 'Next.js', category: 'Frameworks & Libraries', aliases: ['nextjs', 'next.js', 'next'] },
  { canonical: 'Vue.js', category: 'Frameworks & Libraries', aliases: ['vue', 'vuejs', 'vue.js'] },
  { canonical: 'Angular', category: 'Frameworks & Libraries', aliases: ['angular', 'angularjs'] },
  { canonical: 'Tailwind CSS', category: 'Frameworks & Libraries', aliases: ['tailwind', 'tailwindcss', 'tailwind css'] },
  { canonical: 'Bootstrap', category: 'Frameworks & Libraries', aliases: ['bootstrap', 'bootstrap5'] },
  { canonical: 'REST API', category: 'Frameworks & Libraries', aliases: ['rest', 'rest api', 'restful api', 'rest apis', 'web api'] },
  { canonical: 'GraphQL', category: 'Frameworks & Libraries', aliases: ['graphql', 'apollo'] },

  // Databases
  { canonical: 'PostgreSQL', category: 'Databases', aliases: ['postgres', 'postgresql', 'psql'] },
  { canonical: 'MySQL', category: 'Databases', aliases: ['mysql'] },
  { canonical: 'MongoDB', category: 'Databases', aliases: ['mongodb', 'mongo'] },
  { canonical: 'Redis', category: 'Databases', aliases: ['redis'] },
  { canonical: 'SQLite', category: 'Databases', aliases: ['sqlite', 'sqlite3'] },
  { canonical: 'Oracle', category: 'Databases', aliases: ['oracle db', 'oracle sql'] },
  { canonical: 'Cassandra', category: 'Databases', aliases: ['cassandra'] },
  { canonical: 'Elasticsearch', category: 'Databases', aliases: ['elasticsearch', 'elastic search', 'elk'] },

  // AI & ML
  { canonical: 'Machine Learning', category: 'AI & ML', aliases: ['machine learning', 'ml', 'supervised learning', 'unsupervised learning'] },
  { canonical: 'Deep Learning', category: 'AI & ML', aliases: ['deep learning', 'dl', 'neural networks', 'ann', 'cnn', 'rnn', 'lstm'] },
  { canonical: 'NLP', category: 'AI & ML', aliases: ['nlp', 'natural language processing', 'text analytics', 'spacy', 'nltk', 'bert', 'transformers', 'llm', 'llms'] },
  { canonical: 'Computer Vision', category: 'AI & ML', aliases: ['computer vision', 'cv', 'opencv', 'image processing', 'yolo'] },
  { canonical: 'TensorFlow', category: 'AI & ML', aliases: ['tensorflow', 'tf', 'keras'] },
  { canonical: 'PyTorch', category: 'AI & ML', aliases: ['pytorch', 'torch'] },
  { canonical: 'Scikit-learn', category: 'AI & ML', aliases: ['scikit-learn', 'sklearn', 'scikit learn'] },
  { canonical: 'Pandas', category: 'Data Science', aliases: ['pandas'] },
  { canonical: 'NumPy', category: 'Data Science', aliases: ['numpy'] },
  { canonical: 'Matplotlib', category: 'Data Science', aliases: ['matplotlib', 'seaborn', 'data visualization'] },
  { canonical: 'Data Science', category: 'Data Science', aliases: ['data science', 'data analytics', 'eda', 'feature engineering'] },
  { canonical: 'Power BI', category: 'Data Science', aliases: ['power bi', 'powerbi'] },
  { canonical: 'Tableau', category: 'Data Science', aliases: ['tableau'] },

  // Cloud & DevOps
  { canonical: 'AWS', category: 'Cloud & DevOps', aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'cloudformation'] },
  { canonical: 'Azure', category: 'Cloud & DevOps', aliases: ['azure', 'microsoft azure'] },
  { canonical: 'GCP', category: 'Cloud & DevOps', aliases: ['gcp', 'google cloud', 'google cloud platform'] },
  { canonical: 'Docker', category: 'Cloud & DevOps', aliases: ['docker', 'containerization', 'docker compose'] },
  { canonical: 'Kubernetes', category: 'Cloud & DevOps', aliases: ['kubernetes', 'k8s'] },
  { canonical: 'CI/CD', category: 'Cloud & DevOps', aliases: ['ci/cd', 'cicd', 'jenkins', 'github actions', 'gitlab ci'] },
  { canonical: 'Linux', category: 'Cloud & DevOps', aliases: ['linux', 'unix', 'ubuntu', 'bash', 'shell scripting'] },
  { canonical: 'Git', category: 'Tools & Methods', aliases: ['git', 'version control'] },
  { canonical: 'GitHub', category: 'Tools & Methods', aliases: ['github', 'gitlab', 'bitbucket'] },
  { canonical: 'Agile', category: 'Tools & Methods', aliases: ['agile', 'scrum', 'jira', 'kanban'] },
];

export function extractSkillsFromText(text: string): string[] {
  if (!text) return [];
  const normalized = ` ${text.toLowerCase().replace(/[^a-z0-9+#./]/g, ' ')} `;
  const detected = new Set<string>();

  for (const skill of SKILL_TAXONOMY) {
    // Check canonical name
    const canonicalPattern = new RegExp(`\\b${escapeRegExp(skill.canonical.toLowerCase())}\\b`, 'i');
    if (canonicalPattern.test(normalized)) {
      detected.add(skill.canonical);
      continue;
    }

    // Check aliases
    for (const alias of skill.aliases) {
      // For short keywords like 'c' or 'r' or 'go' or 'ts', require strict word boundary
      const aliasPattern = new RegExp(`(?:^|\\s|[,;()/\\[\\]])${escapeRegExp(alias)}(?:$|\\s|[,;()/\\[\\]])`, 'i');
      if (aliasPattern.test(normalized)) {
        detected.add(skill.canonical);
        break;
      }
    }
  }

  return Array.from(detected);
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
