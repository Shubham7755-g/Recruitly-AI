import { Candidate, JobDescription } from '../types';

export const SAMPLE_JOBS: JobDescription[] = [
  {
    id: 'job_ml_python',
    title: 'Senior Python & Machine Learning Engineer',
    description: `We are looking for a Senior Python & Machine Learning Engineer to design and deploy scalable predictive pipelines, NLP models, and RESTful microservices. 
The ideal candidate will have hands-on expertise in Python, PyTorch/TensorFlow, Scikit-learn, Pandas, NumPy, SQL, FastAPI, Docker, and AWS cloud infrastructure.
Responsibilities:
- Build and evaluate machine learning, deep learning, and NLP models.
- Deploy real-time inference APIs with FastAPI and Docker on AWS/Kubernetes.
- Optimize database queries and feature engineering pipelines using SQL and Pandas.
- Collaborate with engineering teams using Git/GitHub and CI/CD pipelines.`,
    required_experience: 3,
    required_education: "Bachelor's or Master's in Computer Science / Data Science",
    required_skills: ['Python', 'Machine Learning', 'PyTorch', 'Scikit-learn', 'SQL', 'FastAPI', 'Docker', 'AWS'],
    created_at: '2026-08-10T09:00:00.000Z'
  },
  {
    id: 'job_fullstack_react',
    title: 'Full Stack React & Node.js Developer',
    description: `We are seeking a talented Full Stack Developer to build modern responsive web applications and scalable backend APIs.
Key Requirements:
- Deep knowledge of React, JavaScript/TypeScript, HTML, CSS, Tailwind CSS, and REST APIs.
- Experience with Node.js, Express, PostgreSQL / MongoDB, and Redis.
- Knowledge of containerization with Docker and cloud hosting (AWS or Azure).
- Proven experience with Git, CI/CD, and agile engineering practices.`,
    required_experience: 2,
    required_education: "B.Tech / B.S. in Computer Science or relevant degree",
    required_skills: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'REST API', 'Git'],
    created_at: '2026-08-12T14:30:00.000Z'
  },
  {
    id: 'job_devops_cloud',
    title: 'DevOps & Cloud Infrastructure Engineer',
    description: `Join our cloud operations team to build automated CI/CD pipelines, Kubernetes clusters, and secure cloud environments.
Required Skills & Background:
- Strong Linux administration, Bash/Python scripting.
- Deep hands-on experience with Docker, Kubernetes, Helm, and Terraform.
- Cloud expertise in AWS (EC2, S3, IAM, EKS) or GCP / Azure.
- Proven track record with CI/CD tools like GitHub Actions, Jenkins, and GitLab CI.`,
    required_experience: 3,
    required_education: "Bachelor's Degree in Engineering or IT",
    required_skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Python', 'Git', 'GitHub'],
    created_at: '2026-08-13T11:15:00.000Z'
  }
];

export const INITIAL_MOCK_CANDIDATES: Candidate[] = [
  {
    candidate_id: 'cand_101',
    candidate_name: 'Dr. Johnathan Vance',
    email: 'j.vance@techcorp.io',
    phone: '+1 (415) 882-9014',
    location: 'San Francisco, CA',
    rank: 1,
    match_score: 95,
    matched_skills: ['Python', 'Machine Learning', 'PyTorch', 'Scikit-learn', 'SQL', 'FastAPI', 'Docker', 'AWS'],
    missing_skills: [],
    additional_skills: ['NLP', 'Pandas', 'NumPy', 'Deep Learning', 'Git', 'Linux'],
    experience: {
      years: 4.5,
      required_years: 3,
      meets_requirement: true,
      roles: ['Lead ML Engineer', 'Senior Python Developer'],
      companies: ['Synthetix AI', 'Apex Data Labs'],
    },
    education: {
      degree: 'Ph.D. in Computer Science',
      institution: 'Stanford University',
      graduation_year: '2022',
      meets_requirement: true,
    },
    recommendation: 'Excellent Match',
    recommendation_reason: 'Exceptional alignment across all required ML and cloud frameworks with senior level tenure.',
    summary: 'Outstanding candidate with 4.5 years of industry experience developing end-to-end Machine Learning systems, PyTorch pipelines, and FastAPI microservices on AWS.',
    ai_generated_summary: true,
    interview_questions: [
      'Describe how you optimized low-latency model inference in FastAPI with Docker.',
      'How did you structure your feature store and batch pipelines using SQL and Pandas?',
      'Walk us through your PyTorch training strategy for handling imbalanced datasets.'
    ],
    strengths: [
      '100% coverage of required skills including AWS, Docker, and FastAPI',
      'Advanced degree (Ph.D. in Computer Science)',
      '4.5 years of verifiable production ML deployment experience'
    ],
    weaknesses: [
      'High seniority level; may require competitive salary alignment'
    ],
    projects: [
      {
        name: 'Distributed LLM Inference Engine',
        description: 'Engineered PyTorch and FastAPI microservices handling 400+ req/sec with Docker on AWS EKS.',
        technologies: ['Python', 'PyTorch', 'FastAPI', 'Docker', 'AWS'],
        relevance: 'High',
      },
      {
        name: 'Predictive Churn Classifier',
        description: 'Trained XGBoost and Scikit-learn models over 50M records utilizing SQL and Pandas.',
        technologies: ['Scikit-learn', 'SQL', 'Pandas', 'NumPy'],
        relevance: 'High',
      }
    ],
    score_breakdown: {
      skills: 40.0,
      semantic_similarity: 27.5,
      experience: 15.0,
      education: 10.0,
      projects: 5.0,
      total: 95,
    },
    resume_filename: 'Johnathan_Vance_Staff_ML_Resume.pdf',
    analyzed_at: '2026-08-14T08:30:00.000Z',
    status: 'Shortlisted',
  },
  {
    candidate_id: 'cand_102',
    candidate_name: 'Priya Sharma',
    email: 'priya.sharma@mlengineer.net',
    phone: '+1 (206) 555-0199',
    location: 'Seattle, WA',
    rank: 2,
    match_score: 89,
    matched_skills: ['Python', 'Machine Learning', 'Scikit-learn', 'SQL', 'FastAPI', 'Docker', 'AWS'],
    missing_skills: ['PyTorch'],
    additional_skills: ['TensorFlow', 'Pandas', 'NumPy', 'Git', 'REST API', 'MySQL'],
    experience: {
      years: 3.2,
      required_years: 3,
      meets_requirement: true,
      roles: ['Machine Learning Engineer', 'Data Analyst'],
      companies: ['Cascade Tech Systems', 'InnoData'],
    },
    education: {
      degree: 'M.S. in Computer Science / Data Science',
      institution: 'University of Washington',
      graduation_year: '2023',
      meets_requirement: true,
    },
    recommendation: 'Strong Match',
    recommendation_reason: 'Exceeds experience requirements and covers 7 of 8 core skills with solid TensorFlow/Scikit-learn foundation.',
    summary: 'Strong candidate with 3.2 years in applied Machine Learning, model serving via FastAPI, and AWS cloud workflows. Uses TensorFlow instead of PyTorch, which is a minor transition.',
    ai_generated_summary: true,
    interview_questions: [
      'How would your TensorFlow modeling workflow transfer to PyTorch?',
      'Can you discuss an AWS pipeline you built for training data extraction?',
      'Explain your approach to Docker containerization for ML APIs.'
    ],
    strengths: [
      'Strong knowledge of FastAPI, Docker, and AWS',
      'Solid Master’s degree background in Data Science',
      'Practical production experience with automated REST endpoints'
    ],
    weaknesses: [
      'Primarily uses TensorFlow instead of required PyTorch framework'
    ],
    projects: [
      {
        name: 'Real-time NLP Sentiment Pipeline',
        description: 'Built containerized FastAPI REST APIs deploying Scikit-learn and TensorFlow models to AWS EC2.',
        technologies: ['Python', 'FastAPI', 'Docker', 'AWS', 'TensorFlow'],
        relevance: 'High',
      }
    ],
    score_breakdown: {
      skills: 35.0,
      semantic_similarity: 25.5,
      experience: 15.0,
      education: 9.5,
      projects: 4.5,
      total: 89,
    },
    resume_filename: 'Priya_Sharma_Resume.pdf',
    analyzed_at: '2026-08-14T08:35:00.000Z',
    status: 'Shortlisted',
  },
  {
    candidate_id: 'cand_103',
    candidate_name: 'Marcus Chen',
    email: 'marcus.chen@devmail.org',
    phone: '+1 (512) 349-8812',
    location: 'Austin, TX',
    rank: 3,
    match_score: 82,
    matched_skills: ['Python', 'Machine Learning', 'PyTorch', 'SQL', 'FastAPI', 'Git'],
    missing_skills: ['Docker', 'AWS', 'Scikit-learn'],
    additional_skills: ['Deep Learning', 'Computer Vision', 'Pandas', 'NumPy', 'Linux'],
    experience: {
      years: 3.0,
      required_years: 3,
      meets_requirement: true,
      roles: ['AI Research Engineer', 'Python Developer'],
      companies: ['NeuralVision AI'],
    },
    education: {
      degree: 'B.Tech / B.S. in Computer Science',
      institution: 'UT Austin',
      graduation_year: '2023',
      meets_requirement: true,
    },
    recommendation: 'Strong Match',
    recommendation_reason: 'Strong PyTorch and Deep Learning background with exactly 3 years experience; needs ramp-up on Docker and AWS.',
    summary: 'Candidate demonstrates heavy PyTorch deep learning modeling capabilities and FastAPI development. Would benefit from AWS and containerization training.',
    ai_generated_summary: false,
    interview_questions: [
      'What is your familiarity with cloud infrastructure deployments on AWS?',
      'How have you collaborated with DevOps teams for model packaging?'
    ],
    strengths: [
      'Exceptional PyTorch and deep learning foundation',
      'Solid API development experience with FastAPI'
    ],
    weaknesses: [
      'Missing Docker and AWS containerization skills from resume'
    ],
    projects: [
      {
        name: 'Vision Transformer Object Tracker',
        description: 'Trained custom PyTorch models for video object detection with NumPy preprocessing.',
        technologies: ['Python', 'PyTorch', 'NumPy', 'Linux'],
        relevance: 'High',
      }
    ],
    score_breakdown: {
      skills: 30.0,
      semantic_similarity: 24.0,
      experience: 15.0,
      education: 8.5,
      projects: 4.5,
      total: 82,
    },
    resume_filename: 'Marcus_Chen_CV.docx',
    analyzed_at: '2026-08-14T08:40:00.000Z',
    status: 'Screened',
  },
  {
    candidate_id: 'cand_104',
    candidate_name: 'Elena Rostova',
    email: 'elena.rostova@datawave.com',
    phone: '+1 (617) 902-3341',
    location: 'Boston, MA',
    rank: 4,
    match_score: 76,
    matched_skills: ['Python', 'SQL', 'FastAPI', 'Docker', 'AWS'],
    missing_skills: ['Machine Learning', 'PyTorch', 'Scikit-learn'],
    additional_skills: ['PostgreSQL', 'Redis', 'CI/CD', 'Git', 'Linux'],
    experience: {
      years: 3.8,
      required_years: 3,
      meets_requirement: true,
      roles: ['Senior Backend Engineer', 'Python Specialist'],
      companies: ['FinScale Technologies'],
    },
    education: {
      degree: 'B.Tech / B.S. in Computer Science',
      institution: 'Northeastern University',
      graduation_year: '2022',
      meets_requirement: true,
    },
    recommendation: 'Good Match',
    recommendation_reason: 'Superb Python backend, Docker, and AWS skills, but lacks dedicated ML/PyTorch modeling depth.',
    summary: 'Proficient Python backend engineer with great AWS and Docker architectural credentials. Good fit if the role leans heavily towards backend serving rather than algorithmic modeling.',
    ai_generated_summary: false,
    strengths: [
      'High backend infrastructure competence (FastAPI, Docker, AWS)',
      'Exceeds minimum experience threshold with 3.8 years'
    ],
    weaknesses: [
      'Lacks core ML/PyTorch modeling coursework and portfolio projects'
    ],
    projects: [
      {
        name: 'High-Throughput Payment Ingestion Gateway',
        description: 'Architected async FastAPI services with Redis and PostgreSQL on AWS ECS.',
        technologies: ['Python', 'FastAPI', 'Docker', 'AWS', 'PostgreSQL'],
        relevance: 'Medium',
      }
    ],
    score_breakdown: {
      skills: 25.0,
      semantic_similarity: 22.0,
      experience: 15.0,
      education: 9.0,
      projects: 5.0,
      total: 76,
    },
    resume_filename: 'Elena_Rostova_Senior_Backend.pdf',
    analyzed_at: '2026-08-14T08:45:00.000Z',
    status: 'Screened',
  },
  {
    candidate_id: 'cand_105',
    candidate_name: 'David Kim',
    email: 'david.kim@gradmail.edu',
    phone: '+1 (408) 771-6523',
    location: 'San Jose, CA',
    rank: 5,
    match_score: 68,
    matched_skills: ['Python', 'Machine Learning', 'PyTorch', 'Scikit-learn', 'SQL'],
    missing_skills: ['FastAPI', 'Docker', 'AWS'],
    additional_skills: ['Pandas', 'NumPy', 'Matplotlib', 'Git'],
    experience: {
      years: 1.2,
      required_years: 3,
      meets_requirement: false,
      roles: ['Junior ML Engineer', 'Research Assistant'],
      companies: ['AI Campus Lab'],
    },
    education: {
      degree: 'M.S. in Computer Science / Data Science',
      institution: 'UC Berkeley',
      graduation_year: '2025',
      meets_requirement: true,
    },
    recommendation: 'Moderate Match',
    recommendation_reason: 'Strong academic ML knowledge and PyTorch skills, but junior tenure (1.2 years) and lacks cloud/Docker experience.',
    summary: 'Junior candidate with solid theoretical machine learning and PyTorch capabilities. Does not satisfy the 3-year experience target and needs cloud infra mentoring.',
    ai_generated_summary: false,
    strengths: [
      'Recent top-tier Master’s degree with ML focus',
      'Solid PyTorch and Scikit-learn fundamentals'
    ],
    weaknesses: [
      'Experience (1.2 years) is substantially below 3.0 years requirement',
      'Missing Docker and AWS production deployment experience'
    ],
    projects: [
      {
        name: 'Biomedical Image Segmentation',
        description: 'Trained U-Net PyTorch model on Kaggle competition dataset achieving 0.88 Dice coefficient.',
        technologies: ['Python', 'PyTorch', 'NumPy', 'Matplotlib'],
        relevance: 'Medium',
      }
    ],
    score_breakdown: {
      skills: 25.0,
      semantic_similarity: 20.0,
      experience: 6.0,
      education: 10.0,
      projects: 7.0,
      total: 68,
    },
    resume_filename: 'David_Kim_ML_Resume.pdf',
    analyzed_at: '2026-08-14T08:50:00.000Z',
    status: 'Screened',
  },
  {
    candidate_id: 'cand_106',
    candidate_name: 'Sarah Jenkins',
    email: 'sarah.j@frontendhub.io',
    phone: '+1 (312) 441-9980',
    location: 'Chicago, IL',
    rank: 6,
    match_score: 52,
    matched_skills: ['Python', 'SQL', 'Git'],
    missing_skills: ['Machine Learning', 'PyTorch', 'Scikit-learn', 'FastAPI', 'Docker', 'AWS'],
    additional_skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'],
    experience: {
      years: 2.5,
      required_years: 3,
      meets_requirement: false,
      roles: ['Frontend Engineer', 'UI Developer'],
      companies: ['PixelCraft Studio'],
    },
    education: {
      degree: 'B.Tech / B.S. in Computer Science',
      institution: 'UIUC',
      graduation_year: '2023',
      meets_requirement: true,
    },
    recommendation: 'Low Match',
    recommendation_reason: 'Candidate background is predominantly UI/React frontend with limited overlap with ML and cloud requirements.',
    summary: 'Candidate is experienced in frontend web development (React, UI) with introductory Python scripting. Not aligned with this Machine Learning role.',
    ai_generated_summary: false,
    strengths: [
      'Competent UI and web developer'
    ],
    weaknesses: [
      'Missing 6 out of 8 required machine learning and cloud skills',
      'No deep learning or ML modeling background'
    ],
    projects: [
      {
        name: 'E-commerce React Storefront',
        description: 'Developed responsive user interfaces with React and Tailwind CSS.',
        technologies: ['React', 'JavaScript', 'Tailwind CSS'],
        relevance: 'Low',
      }
    ],
    score_breakdown: {
      skills: 15.0,
      semantic_similarity: 14.0,
      experience: 10.0,
      education: 9.0,
      projects: 4.0,
      total: 52,
    },
    resume_filename: 'Sarah_Jenkins_Frontend_CV.pdf',
    analyzed_at: '2026-08-14T08:55:00.000Z',
    status: 'Rejected',
  },
  {
    candidate_id: 'cand_107',
    candidate_name: 'Ananya Rao',
    email: 'ananya.rao@cloudscale.net',
    phone: '+1 (404) 932-1176',
    location: 'Atlanta, GA',
    rank: 7,
    match_score: 86,
    matched_skills: ['Python', 'SQL', 'FastAPI', 'Docker', 'AWS', 'Machine Learning', 'Scikit-learn'],
    missing_skills: ['PyTorch'],
    additional_skills: ['PostgreSQL', 'CI/CD', 'Pandas', 'NumPy', 'Linux', 'Kubernetes'],
    experience: {
      years: 3.5,
      required_years: 3,
      meets_requirement: true,
      roles: ['MLOps Engineer', 'Cloud Systems Developer'],
      companies: ['ScaleVertex Data'],
    },
    education: {
      degree: 'B.Tech / B.S. in Computer Science',
      institution: 'Georgia Tech',
      graduation_year: '2022',
      meets_requirement: true,
    },
    recommendation: 'Strong Match',
    recommendation_reason: 'Exceptional MLOps profile with strong Docker, Kubernetes, AWS, and FastAPI experience. Ideal for ML infrastructure.',
    summary: 'Candidate offers strong MLOps background with 3.5 years managing automated ML deployment pipelines on AWS and Docker.',
    ai_generated_summary: true,
    strengths: [
      '3.5 years of verifiable MLOps and cloud engineering experience',
      'Solid command of FastAPI, Docker, Kubernetes, and AWS'
    ],
    weaknesses: [
      'PyTorch is not explicitly listed, though candidate has deep Scikit-learn and ML pipeline tooling experience'
    ],
    projects: [
      {
        name: 'Automated Model Registry & CI/CD Pipeline',
        description: 'Orchestrated automated model validation and Docker containerization using AWS Lambda and EKS.',
        technologies: ['Python', 'Docker', 'AWS', 'Kubernetes', 'CI/CD'],
        relevance: 'High',
      }
    ],
    score_breakdown: {
      skills: 35.0,
      semantic_similarity: 24.5,
      experience: 15.0,
      education: 8.5,
      projects: 3.0,
      total: 86,
    },
    resume_filename: 'Ananya_Rao_MLOps_Resume.docx',
    analyzed_at: '2026-08-14T09:00:00.000Z',
    status: 'Shortlisted',
  },
  {
    candidate_id: 'cand_108',
    candidate_name: 'Carlos Mendez',
    email: 'carlos.mendez@aiengineering.co',
    phone: '+1 (786) 402-8877',
    location: 'Miami, FL',
    rank: 8,
    match_score: 91,
    matched_skills: ['Python', 'Machine Learning', 'PyTorch', 'Scikit-learn', 'SQL', 'FastAPI', 'Docker', 'AWS'],
    missing_skills: [],
    additional_skills: ['NLP', 'Deep Learning', 'Pandas', 'NumPy', 'Git', 'Linux'],
    experience: {
      years: 3.6,
      required_years: 3,
      meets_requirement: true,
      roles: ['Senior AI Engineer', 'Python Developer'],
      companies: ['Cortex Intelligence', 'DataSprint Inc'],
    },
    education: {
      degree: 'M.S. in Computer Science / Data Science',
      institution: 'University of Florida',
      graduation_year: '2022',
      meets_requirement: true,
    },
    recommendation: 'Excellent Match',
    recommendation_reason: '100% skill match with 3.6 years of high-performing AI engineering and AWS model hosting.',
    summary: 'Top-tier candidate possessing comprehensive proficiency across Python, PyTorch, Scikit-learn, FastAPI, Docker, and AWS with 3.6 years in production AI engineering.',
    ai_generated_summary: true,
    interview_questions: [
      'Can you discuss how you architected fault-tolerant model serving in AWS with Docker?',
      'How do you manage continuous feature engineering in SQL and Pandas for real-time inference?'
    ],
    strengths: [
      'Comprehensive match for all 8 mandatory technical skills',
      'Solid 3.6 years production tenure with Master’s degree credentials'
    ],
    weaknesses: [
      'No critical deficiencies detected'
    ],
    projects: [
      {
        name: 'Enterprise NLP Classification Engine',
        description: 'Trained and deployed PyTorch transformer models to AWS ECS via FastAPI with sub-30ms latency.',
        technologies: ['Python', 'PyTorch', 'FastAPI', 'Docker', 'AWS'],
        relevance: 'High',
      }
    ],
    score_breakdown: {
      skills: 40.0,
      semantic_similarity: 26.5,
      experience: 15.0,
      education: 9.5,
      projects: 0.0,
      total: 91,
    },
    resume_filename: 'Carlos_Mendez_Senior_AI_Resume.pdf',
    analyzed_at: '2026-08-14T09:05:00.000Z',
    status: 'Shortlisted',
  }
];

export const SAMPLE_RESUME_TEXTS = [
  {
    filename: 'Sample_ML_Specialist_Alex_Rivera.pdf',
    name: 'Alex Rivera',
    text: `Alex Rivera
Email: alex.rivera@neuraltech.com | Phone: +1 (555) 392-1084 | San Francisco, CA
GitHub: github.com/alexrivera-ml | LinkedIn: linkedin.com/in/alex-rivera-ml

PROFESSIONAL SUMMARY
Senior Machine Learning Engineer with 4+ years of industry experience designing, training, and deploying large-scale NLP and deep learning models. Proficient in Python, PyTorch, Scikit-learn, FastAPI, SQL, Docker, and AWS cloud infrastructures.

TECHNICAL SKILLS
- Languages: Python, SQL, C++, Bash
- ML/AI: PyTorch, TensorFlow, Scikit-learn, NLP, Deep Learning, Computer Vision, Transformers
- Data: Pandas, NumPy, Matplotlib, PostgreSQL, MySQL
- Cloud & DevOps: AWS (EC2, S3, SageMaker), Docker, Kubernetes, Git, CI/CD, Linux
- Web/APIs: FastAPI, REST API, Flask

WORK EXPERIENCE
Senior Machine Learning Engineer | NeuralScale AI (2023 - Present)
- Designed and scaled real-time NLP classification models in PyTorch, reducing inference latency by 45%.
- Implemented high-throughput REST APIs using FastAPI and containerized microservices with Docker on AWS EKS.
- Built automated feature engineering pipelines utilizing SQL and Pandas over 20M+ user interaction logs.

Machine Learning Developer | DataPoint Solutions (2021 - 2023)
- Developed customer churn and recommendation systems using Scikit-learn and Python.
- Containerized model training workflows with Docker and managed deployment on AWS EC2.

EDUCATION
Master of Science (M.S.) in Computer Science & Artificial Intelligence
Stanford University (Graduated 2021)

KEY PROJECTS
- Project: Real-time LLM Inference Gateway with FastAPI, Docker, and AWS SageMaker.
- Project: Predictive Anomaly Detection using PyTorch and Scikit-learn on distributed sensor data.`,
  },
  {
    filename: 'Sample_FullStack_Jordan_Lee.docx',
    name: 'Jordan Lee',
    text: `Jordan Lee
Email: jordan.lee@fullstackpro.dev | Phone: +1 (555) 819-2044 | Austin, TX

SUMMARY
Full Stack Engineer with 3+ years of experience engineering responsive web applications and scalable backend APIs using React, TypeScript, Node.js, Express, PostgreSQL, and Docker.

CORE COMPETENCIES
- Frontend: React, TypeScript, JavaScript, HTML, CSS, Tailwind CSS, Redux
- Backend: Node.js, Express, REST API, GraphQL
- Databases: PostgreSQL, MongoDB, Redis, SQL
- DevOps & Tools: Docker, AWS, Git, GitHub Actions, CI/CD, Linux

EXPERIENCE
Full Stack Developer | CloudOrbit Tech (2022 - Present)
- Engineered responsive recruiter dashboards in React, TypeScript, and Tailwind CSS.
- Built scalable Node.js and Express REST APIs with PostgreSQL backend.
- Deployed Docker containers via automated CI/CD pipelines to AWS ECS.

Junior Web Developer | AgileByte Studio (2021 - 2022)
- Built interactive frontend components in React and integrated third-party REST APIs.

EDUCATION
B.Tech in Computer Science & Engineering
University of Texas at Austin (Class of 2021)`,
  },
  {
    filename: 'Sample_DevOps_Cloud_Maya_Patel.pdf',
    name: 'Maya Patel',
    text: `Maya Patel
Email: maya.patel@cloudops.io | Phone: +1 (555) 912-3344 | Seattle, WA

PROFESSIONAL SUMMARY
DevOps & Cloud Infrastructure Engineer with 4 years of experience building resilient cloud infrastructure on AWS, Kubernetes clusters, and automated CI/CD pipelines.

TECHNICAL SKILLS
- Cloud: AWS (EC2, S3, IAM, EKS, CloudFormation), Azure
- Containerization & Orchestration: Docker, Kubernetes, Helm
- Scripting & Languages: Python, Bash, Linux, SQL
- CI/CD & Version Control: Git, GitHub Actions, Jenkins, GitLab CI, Linux

EXPERIENCE
DevOps Engineer | CloudGrid Systems (2022 - Present)
- Architected Kubernetes clusters on AWS EKS managing 60+ containerized microservices.
- Developed automated Python and Bash deployment scripts for CI/CD pipeline automation.
- Maintained infrastructure-as-code and Docker container security compliance.

Cloud Support Specialist | Alpha Infra (2020 - 2022)
- Monitored AWS cloud workloads and managed Linux server configuration.

EDUCATION
B.S. in Information Technology & Computer Systems
University of Washington (2020)`,
  },
  {
    filename: 'Sample_Junior_DataAnalyst_Sam_Taylor.pdf',
    name: 'Sam Taylor',
    text: `Sam Taylor
Email: sam.taylor@analyticsmail.com | Phone: +1 (555) 601-7789 | Chicago, IL

SUMMARY
Enthusiastic Junior Data Analyst with 1 year of experience performing exploratory data analysis, reporting with Power BI and SQL, and Python data manipulation.

SKILLS
- Languages & Tools: Python, SQL, Excel, Power BI, Tableau, Git
- Libraries: Pandas, NumPy, Matplotlib
- Foundations: Basic Machine Learning, Statistics

EXPERIENCE
Junior Data Analyst | MetricFlow Analytics (2025 - Present)
- Executed SQL queries and extracted business metrics from PostgreSQL databases.
- Created visualizations using Pandas, Matplotlib, and Power BI dashboards.

EDUCATION
Bachelor of Science (B.S.) in Mathematics & Statistics
University of Illinois Urbana-Champaign (2024)`,
  },
  {
    filename: 'Sample_Backend_Python_Victor_Hugo.docx',
    name: 'Victor Hugo',
    text: `Victor Hugo
Email: victor.hugo@backenddev.co | Phone: +1 (555) 234-8890 | New York, NY

SUMMARY
Senior Python Backend Developer with 5 years experience designing resilient microservices, FastAPI applications, database architecture, and Docker deployments on AWS.

TECHNICAL EXPERTISE
- Languages: Python, SQL, Go
- Frameworks: FastAPI, Django, Flask, REST API
- Databases: PostgreSQL, MySQL, Redis
- Cloud & DevOps: AWS, Docker, Git, CI/CD, Linux

EXPERIENCE
Lead Backend Engineer | FinTech Velocity (2022 - Present)
- Built high-performance microservices with FastAPI and PostgreSQL serving 10,000 requests/minute.
- Containerized all internal services with Docker and configured AWS deployment scripts.

EDUCATION
B.Tech in Computer Science
Columbia University (2020)`,
  }
];
