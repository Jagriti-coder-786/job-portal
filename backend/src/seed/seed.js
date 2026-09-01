import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import SavedJob from '../models/SavedJob.js';
import Notification from '../models/Notification.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobportal';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Company.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
      SavedJob.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@demo.com',
        password: 'Admin@123',
        role: 'admin',
        avatar: '',
        location: 'San Francisco, CA',
      },
      {
        name: 'Sarah Johnson',
        email: 'recruiter@demo.com',
        password: 'Demo@123',
        role: 'recruiter',
        phone: '+1-555-0101',
        location: 'New York, NY',
        bio: 'Senior Technical Recruiter with 8+ years of experience in tech hiring.',
      },
      {
        name: 'Michael Chen',
        email: 'recruiter2@demo.com',
        password: 'Demo@123',
        role: 'recruiter',
        phone: '+1-555-0102',
        location: 'San Francisco, CA',
        bio: 'HR Manager at DataFlow Systems, passionate about finding great talent.',
      },
      {
        name: 'Emily Rodriguez',
        email: 'recruiter3@demo.com',
        password: 'Demo@123',
        role: 'recruiter',
        phone: '+1-555-0103',
        location: 'Austin, TX',
        bio: 'Talent Acquisition Lead at CloudNine Solutions.',
      },
      {
        name: 'Ruhi',
        email: 'seeker@demo.com',
        password: 'Demo@123',
        role: 'seeker',
        phone: '+1-555-0201',
        location: 'New York, NY',
        bio: 'Passionate full-stack developer with 3 years of experience building web applications. Looking for opportunities to work with cutting-edge technologies.',
        headline: 'Full-Stack Developer | React | Node.js',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express.js', 'HTML', 'CSS', 'Git', 'REST APIs', 'TypeScript'],
        education: [
          {
            institution: 'MIT',
            degree: 'Bachelor of Science',
            field: 'Computer Science',
            startDate: new Date('2018-09-01'),
            endDate: new Date('2022-05-15'),
          },
        ],
        experience: [
          {
            company: 'StartupXYZ',
            title: 'Junior Full-Stack Developer',
            description: 'Developed and maintained web applications using React and Node.js. Implemented RESTful APIs and database schemas.',
            location: 'New York, NY',
            startDate: new Date('2022-06-01'),
            endDate: new Date('2024-01-15'),
          },
          {
            company: 'Freelance',
            title: 'Full-Stack Developer',
            description: 'Built custom web solutions for small businesses. Designed responsive interfaces and integrated payment systems.',
            location: 'Remote',
            startDate: new Date('2024-02-01'),
            current: true,
          },
        ],
      },
      {
        name: 'Jessica Park',
        email: 'seeker2@demo.com',
        password: 'Demo@123',
        role: 'seeker',
        phone: '+1-555-0202',
        location: 'San Francisco, CA',
        bio: 'UI/UX designer transitioning into front-end development. Passionate about creating beautiful, accessible interfaces.',
        headline: 'UI/UX Designer & Front-End Developer',
        skills: ['Figma', 'React', 'CSS', 'JavaScript', 'HTML', 'Adobe XD', 'Tailwind CSS', 'User Research'],
        education: [
          {
            institution: 'Stanford University',
            degree: 'Master of Fine Arts',
            field: 'Design',
            startDate: new Date('2019-09-01'),
            endDate: new Date('2021-06-15'),
          },
        ],
        experience: [
          {
            company: 'DesignCo',
            title: 'UI/UX Designer',
            description: 'Led design for mobile and web applications. Conducted user research and created design systems.',
            location: 'San Francisco, CA',
            startDate: new Date('2021-07-01'),
            current: true,
          },
        ],
      },
      {
        name: 'David Kim',
        email: 'seeker3@demo.com',
        password: 'Demo@123',
        role: 'seeker',
        phone: '+1-555-0203',
        location: 'Seattle, WA',
        bio: 'Backend engineer with expertise in distributed systems and cloud infrastructure.',
        headline: 'Senior Backend Engineer | Python | AWS',
        skills: ['Python', 'Django', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'GraphQL', 'CI/CD', 'Microservices'],
        education: [
          {
            institution: 'University of Washington',
            degree: 'Master of Science',
            field: 'Computer Science',
            startDate: new Date('2017-09-01'),
            endDate: new Date('2019-06-15'),
          },
        ],
        experience: [
          {
            company: 'Amazon',
            title: 'Software Development Engineer',
            description: 'Built scalable microservices handling millions of requests per day.',
            location: 'Seattle, WA',
            startDate: new Date('2019-07-01'),
            endDate: new Date('2023-12-31'),
          },
        ],
      },
      {
        name: 'Priya Sharma',
        email: 'seeker4@demo.com',
        password: 'Demo@123',
        role: 'seeker',
        phone: '+1-555-0204',
        location: 'Chicago, IL',
        bio: 'Data scientist with a passion for machine learning and AI. Published researcher in NLP.',
        headline: 'Data Scientist | ML Engineer',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'R', 'Machine Learning', 'NLP', 'Data Visualization', 'Pandas', 'Scikit-learn'],
        education: [
          {
            institution: 'University of Chicago',
            degree: 'Ph.D.',
            field: 'Data Science',
            startDate: new Date('2018-09-01'),
            endDate: new Date('2023-05-15'),
          },
        ],
        experience: [
          {
            company: 'Research Lab',
            title: 'Data Science Intern',
            description: 'Developed NLP models for sentiment analysis. Published 3 research papers.',
            location: 'Chicago, IL',
            startDate: new Date('2022-06-01'),
            endDate: new Date('2023-08-31'),
          },
        ],
      },
      {
        name: 'James Wilson',
        email: 'seeker5@demo.com',
        password: 'Demo@123',
        role: 'seeker',
        phone: '+1-555-0205',
        location: 'Austin, TX',
        bio: 'DevOps engineer focused on automation and cloud-native technologies.',
        headline: 'DevOps Engineer | Cloud | Automation',
        skills: ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'Jenkins', 'Linux', 'Python', 'Ansible', 'CI/CD', 'Monitoring'],
        education: [
          {
            institution: 'UT Austin',
            degree: 'Bachelor of Science',
            field: 'Information Technology',
            startDate: new Date('2016-09-01'),
            endDate: new Date('2020-05-15'),
          },
        ],
        experience: [
          {
            company: 'CloudFirst Inc.',
            title: 'DevOps Engineer',
            description: 'Managed cloud infrastructure on AWS. Implemented CI/CD pipelines and monitoring solutions.',
            location: 'Austin, TX',
            startDate: new Date('2020-06-01'),
            current: true,
          },
        ],
      },
      {
        name: 'Lisa Anderson',
        email: 'seeker6@demo.com',
        password: 'Demo@123',
        role: 'seeker',
        phone: '+1-555-0206',
        location: 'Boston, MA',
        bio: 'Mobile developer specializing in React Native and iOS development.',
        headline: 'Mobile Developer | React Native | Swift',
        skills: ['React Native', 'Swift', 'iOS', 'JavaScript', 'Redux', 'Firebase', 'REST APIs', 'Git', 'Agile'],
        education: [
          {
            institution: 'Boston University',
            degree: 'Bachelor of Science',
            field: 'Computer Engineering',
            startDate: new Date('2017-09-01'),
            endDate: new Date('2021-05-15'),
          },
        ],
        experience: [
          {
            company: 'MobileApp Studios',
            title: 'Mobile Developer',
            description: 'Built cross-platform mobile applications for startup clients.',
            location: 'Boston, MA',
            startDate: new Date('2021-06-01'),
            current: true,
          },
        ],
      },
    ]);

    console.log(`Created ${users.length} users`);

    // Find users by role
    const recruiter1 = users.find(u => u.email === 'recruiter@demo.com');
    const recruiter2 = users.find(u => u.email === 'recruiter2@demo.com');
    const recruiter3 = users.find(u => u.email === 'recruiter3@demo.com');
    const seekers = users.filter(u => u.role === 'seeker');

    // Create companies
    const companies = await Company.create([
      {
        name: 'TechCorp Solutions',
        description: 'TechCorp Solutions is a leading technology company specializing in enterprise software solutions, cloud computing, and digital transformation. With over 5,000 employees worldwide, we help Fortune 500 companies modernize their IT infrastructure and build innovative products.',
        website: 'https://techcorp.example.com',
        location: 'New York, NY',
        industry: 'Technology',
        size: '1000+',
        owner: recruiter1._id,
        status: 'approved',
      },
      {
        name: 'DataFlow Systems',
        description: 'DataFlow Systems is a data analytics and AI company that helps businesses make data-driven decisions. We provide cutting-edge data pipelines, machine learning solutions, and business intelligence tools to organizations worldwide.',
        website: 'https://dataflow.example.com',
        location: 'San Francisco, CA',
        industry: 'Data & Analytics',
        size: '201-500',
        owner: recruiter2._id,
        status: 'approved',
      },
      {
        name: 'CloudNine Solutions',
        description: 'CloudNine Solutions provides cloud infrastructure and DevOps services. We help startups and enterprises build, deploy, and scale their applications with modern cloud-native architectures on AWS, GCP, and Azure.',
        website: 'https://cloudnine.example.com',
        location: 'Austin, TX',
        industry: 'Cloud Computing',
        size: '51-200',
        owner: recruiter3._id,
        status: 'approved',
      },
      {
        name: 'InnovateTech Labs',
        description: 'InnovateTech Labs is a research-driven technology company focused on AI, blockchain, and quantum computing. We work on breakthrough innovations that shape the future of technology.',
        website: 'https://innovatetech.example.com',
        location: 'Boston, MA',
        industry: 'Research & Development',
        size: '51-200',
        owner: recruiter1._id,
        status: 'approved',
      },
      {
        name: 'StartupHub Ventures',
        description: 'StartupHub Ventures is a fast-growing startup accelerator and product studio. We build consumer and B2B products, invest in early-stage startups, and provide mentorship to founders.',
        website: 'https://startuphub.example.com',
        location: 'Los Angeles, CA',
        industry: 'Venture Capital',
        size: '11-50',
        owner: recruiter2._id,
        status: 'approved',
      },
    ]);

    console.log(`Created ${companies.length} companies`);

    // Create jobs
    const jobs = await Job.create([
      {
        title: 'Senior React Developer',
        description: 'We are looking for a Senior React Developer to join our front-end team. You will be responsible for building and maintaining complex web applications, mentoring junior developers, and contributing to our design system.\n\nResponsibilities:\n- Build reusable components and front-end libraries\n- Translate designs and wireframes into high-quality code\n- Optimize components for maximum performance\n- Collaborate with back-end developers and designers\n- Participate in code reviews and technical discussions',
        requirements: ['5+ years of JavaScript/TypeScript experience', '3+ years with React', 'Experience with state management (Redux/Zustand)', 'Strong understanding of web performance optimization', 'Experience with testing frameworks (Jest, RTL)'],
        skills: ['React', 'TypeScript', 'JavaScript', 'Redux', 'CSS', 'HTML', 'Jest', 'Git'],
        company: companies[0]._id,
        postedBy: recruiter1._id,
        location: 'New York, NY',
        salary: { min: 120000, max: 160000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'senior',
        workMode: 'hybrid',
        category: 'Technology',
        status: 'open',
      },
      {
        title: 'Full-Stack Node.js Engineer',
        description: 'Join our engineering team to build scalable web applications. You will work across the full stack using Node.js, React, and MongoDB.\n\nWhat you will do:\n- Design and implement RESTful APIs\n- Build responsive front-end interfaces\n- Write automated tests\n- Deploy and monitor applications\n- Collaborate with product and design teams',
        requirements: ['3+ years full-stack development experience', 'Proficient in Node.js and Express', 'Experience with React or Vue.js', 'MongoDB or PostgreSQL experience', 'Understanding of CI/CD pipelines'],
        skills: ['Node.js', 'React', 'MongoDB', 'Express.js', 'JavaScript', 'REST APIs', 'Git', 'Docker'],
        company: companies[0]._id,
        postedBy: recruiter1._id,
        location: 'New York, NY',
        salary: { min: 100000, max: 140000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'mid',
        workMode: 'remote',
        category: 'Technology',
        status: 'open',
      },
      {
        title: 'Junior Frontend Developer',
        description: 'Great opportunity for aspiring developers! We are looking for a Junior Frontend Developer eager to learn and grow. You will work alongside senior developers to build modern web interfaces.\n\nIdeal for someone who:\n- Has completed a bootcamp or CS degree\n- Has personal projects using React\n- Is passionate about clean UI/UX\n- Wants mentorship and career growth',
        requirements: ['1+ years of web development experience', 'Basic knowledge of React', 'HTML, CSS, JavaScript proficiency', 'Eagerness to learn', 'Strong communication skills'],
        skills: ['JavaScript', 'React', 'HTML', 'CSS', 'Git'],
        company: companies[0]._id,
        postedBy: recruiter1._id,
        location: 'New York, NY',
        salary: { min: 60000, max: 80000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'entry',
        workMode: 'on-site',
        category: 'Technology',
        status: 'open',
      },
      {
        title: 'Data Engineer',
        description: 'DataFlow Systems is seeking an experienced Data Engineer to build and maintain our data infrastructure. You will design data pipelines, optimize data storage, and ensure data quality across our platform.',
        requirements: ['3+ years of data engineering experience', 'Expert in SQL and Python', 'Experience with Apache Spark or similar', 'Cloud platform experience (AWS/GCP)', 'Knowledge of data warehousing concepts'],
        skills: ['Python', 'SQL', 'Apache Spark', 'AWS', 'ETL', 'Data Modeling', 'Airflow', 'Kafka'],
        company: companies[1]._id,
        postedBy: recruiter2._id,
        location: 'San Francisco, CA',
        salary: { min: 130000, max: 170000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'mid',
        workMode: 'hybrid',
        category: 'Data Science',
        status: 'open',
      },
      {
        title: 'Machine Learning Engineer',
        description: 'Join our AI team to develop and deploy machine learning models at scale. You will work on NLP, computer vision, and recommendation systems that process millions of data points daily.',
        requirements: ['MS/PhD in CS, Statistics, or related field', '3+ years ML experience', 'Deep understanding of ML algorithms', 'Experience with TensorFlow or PyTorch', 'Production ML deployment experience'],
        skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'NLP', 'Computer Vision', 'Docker', 'AWS'],
        company: companies[1]._id,
        postedBy: recruiter2._id,
        location: 'San Francisco, CA',
        salary: { min: 150000, max: 200000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'senior',
        workMode: 'remote',
        category: 'Data Science',
        status: 'open',
      },
      {
        title: 'DevOps Engineer',
        description: 'CloudNine Solutions needs a DevOps Engineer to manage our cloud infrastructure and automate deployment processes. You will work with cutting-edge technologies and help our clients scale their applications.',
        requirements: ['3+ years DevOps experience', 'AWS certification preferred', 'Strong Linux administration skills', 'Experience with Terraform or CloudFormation', 'Kubernetes experience required'],
        skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Linux', 'CI/CD', 'Python', 'Jenkins', 'Monitoring'],
        company: companies[2]._id,
        postedBy: recruiter3._id,
        location: 'Austin, TX',
        salary: { min: 110000, max: 150000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'mid',
        workMode: 'hybrid',
        category: 'Technology',
        status: 'open',
      },
      {
        title: 'Cloud Solutions Architect',
        description: 'Design and implement cloud architecture solutions for enterprise clients. Lead technical discussions, create architecture blueprints, and guide implementation teams.',
        requirements: ['7+ years in cloud computing', 'AWS Solutions Architect certification', 'Experience with multi-cloud environments', 'Strong client communication skills', 'Leadership experience'],
        skills: ['AWS', 'Azure', 'GCP', 'Architecture', 'Microservices', 'Networking', 'Security', 'Terraform'],
        company: companies[2]._id,
        postedBy: recruiter3._id,
        location: 'Austin, TX',
        salary: { min: 160000, max: 220000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'lead',
        workMode: 'remote',
        category: 'Technology',
        status: 'open',
      },
      {
        title: 'UI/UX Designer',
        description: 'We need a talented UI/UX Designer to create beautiful, intuitive interfaces for our products. You will conduct user research, create wireframes and prototypes, and collaborate closely with our development team.',
        requirements: ['3+ years UI/UX design experience', 'Expert in Figma or Sketch', 'Strong portfolio showcasing web/mobile designs', 'Understanding of design systems', 'User research experience'],
        skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Design Systems', 'Adobe Creative Suite', 'HTML', 'CSS'],
        company: companies[3]._id,
        postedBy: recruiter1._id,
        location: 'Boston, MA',
        salary: { min: 90000, max: 130000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'mid',
        workMode: 'on-site',
        category: 'Design',
        status: 'open',
      },
      {
        title: 'AI Research Scientist',
        description: 'InnovateTech Labs is looking for an AI Research Scientist to push the boundaries of artificial intelligence. Work on cutting-edge research in large language models, reinforcement learning, and multi-modal AI systems.',
        requirements: ['PhD in AI/ML or related field', 'Published research in top conferences', 'Strong mathematical foundations', 'Experience with large-scale distributed training', 'Excellent research skills'],
        skills: ['Python', 'PyTorch', 'Machine Learning', 'Deep Learning', 'NLP', 'Research', 'Mathematics', 'Statistics'],
        company: companies[3]._id,
        postedBy: recruiter1._id,
        location: 'Boston, MA',
        salary: { min: 180000, max: 250000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'senior',
        workMode: 'hybrid',
        category: 'Data Science',
        status: 'open',
      },
      {
        title: 'Product Manager',
        description: 'Drive product strategy and execution for our flagship SaaS platform. You will define product vision, prioritize features, and work cross-functionally with engineering, design, and marketing teams.',
        requirements: ['4+ years product management experience', 'Experience with B2B SaaS products', 'Strong analytical and data-driven mindset', 'Excellent communication skills', 'Technical background preferred'],
        skills: ['Product Strategy', 'Agile', 'Data Analysis', 'User Research', 'Roadmapping', 'Jira', 'SQL'],
        company: companies[4]._id,
        postedBy: recruiter2._id,
        location: 'Los Angeles, CA',
        salary: { min: 120000, max: 160000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'mid',
        workMode: 'hybrid',
        category: 'Product Management',
        status: 'open',
      },
      {
        title: 'React Native Mobile Developer',
        description: 'Build cross-platform mobile applications for our portfolio of startup products. You will architect, develop, and maintain React Native apps from concept to App Store deployment.',
        requirements: ['2+ years React Native experience', 'Published apps on App Store or Play Store', 'Understanding of native iOS/Android', 'Experience with mobile CI/CD', 'Strong JavaScript/TypeScript skills'],
        skills: ['React Native', 'JavaScript', 'TypeScript', 'iOS', 'Android', 'Redux', 'REST APIs', 'Firebase'],
        company: companies[4]._id,
        postedBy: recruiter2._id,
        location: 'Los Angeles, CA',
        salary: { min: 95000, max: 135000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'mid',
        workMode: 'remote',
        category: 'Technology',
        status: 'open',
      },
      {
        title: 'Marketing Intern',
        description: 'Exciting internship opportunity for a marketing enthusiast! Learn digital marketing strategies, content creation, and social media management from experienced professionals.',
        requirements: ['Currently enrolled in university', 'Interest in digital marketing', 'Strong writing skills', 'Familiarity with social media platforms', 'Creative thinking'],
        skills: ['Social Media', 'Content Writing', 'Marketing', 'Analytics', 'Creativity'],
        company: companies[4]._id,
        postedBy: recruiter2._id,
        location: 'Los Angeles, CA',
        salary: { min: 20000, max: 35000, currency: 'USD' },
        jobType: 'internship',
        experienceLevel: 'entry',
        workMode: 'on-site',
        category: 'Marketing',
        status: 'open',
      },
      {
        title: 'Backend Python Developer',
        description: 'Looking for a Python developer to build robust backend services. You will work with Django/FastAPI, design database schemas, and implement secure, performant APIs.',
        requirements: ['3+ years Python experience', 'Django or FastAPI proficiency', 'PostgreSQL experience', 'Understanding of software design patterns', 'API design skills'],
        skills: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'REST APIs', 'Docker', 'Git', 'Redis'],
        company: companies[1]._id,
        postedBy: recruiter2._id,
        location: 'San Francisco, CA',
        salary: { min: 110000, max: 150000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'mid',
        workMode: 'remote',
        category: 'Technology',
        status: 'open',
      },
      {
        title: 'QA Automation Engineer',
        description: 'Ensure quality across our products by building automated test suites. You will create end-to-end tests, integration tests, and performance tests for web and API applications.',
        requirements: ['2+ years QA automation experience', 'Experience with Selenium, Cypress, or Playwright', 'API testing experience', 'CI/CD integration knowledge', 'Strong attention to detail'],
        skills: ['Selenium', 'Cypress', 'JavaScript', 'Python', 'API Testing', 'CI/CD', 'Jira', 'Agile'],
        company: companies[0]._id,
        postedBy: recruiter1._id,
        location: 'New York, NY',
        salary: { min: 85000, max: 120000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'mid',
        workMode: 'hybrid',
        category: 'Technology',
        status: 'open',
      },
      {
        title: 'Part-Time Content Writer',
        description: 'Write engaging technical blog posts, documentation, and marketing copy. Ideal for writers who understand technology and can make complex topics accessible.',
        requirements: ['2+ years of content writing experience', 'Ability to write about tech topics', 'SEO knowledge', 'Strong editing skills', 'Portfolio of published work'],
        skills: ['Content Writing', 'SEO', 'Technical Writing', 'Editing', 'Blogging', 'Research'],
        company: companies[2]._id,
        postedBy: recruiter3._id,
        location: 'Remote',
        salary: { min: 30000, max: 50000, currency: 'USD' },
        jobType: 'part-time',
        experienceLevel: 'mid',
        workMode: 'remote',
        category: 'Marketing',
        status: 'open',
      },
      {
        title: 'Senior Financial Analyst',
        description: 'Lead financial planning, forecasting, and budgeting processes. Analyze market trends, financial statements, and performance metrics to support strategic decision making.',
        requirements: ['4+ years in financial analysis or corporate finance', 'Proficient in Excel, Financial Modeling, and SQL', 'CFA or MBA is a plus', 'Strong presentation and communication skills'],
        skills: ['Financial Analysis', 'Financial Modeling', 'Excel', 'Corporate Finance', 'Budgeting', 'SQL'],
        company: companies[4]._id,
        postedBy: recruiter2._id,
        location: 'New York, NY',
        salary: { min: 115000, max: 155000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'senior',
        workMode: 'hybrid',
        category: 'Finance',
        status: 'open',
      },
      {
        title: 'Investment Banking Associate',
        description: 'Evaluate investment opportunities, perform valuations, and assist with M&A transactions and capital raises for high-growth tech companies.',
        requirements: ['2+ years experience in investment banking or venture capital', 'Expertise in valuation methodologies (DCF, LBO, comps)', 'Strong analytical skills'],
        skills: ['Valuation', 'M&A', 'Financial Modeling', 'Corporate Finance', 'Investment Banking'],
        company: companies[4]._id,
        postedBy: recruiter2._id,
        location: 'New York, NY',
        salary: { min: 140000, max: 190000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'mid',
        workMode: 'on-site',
        category: 'Finance',
        status: 'open',
      },
      {
        title: 'Healthcare Systems Specialist',
        description: 'Coordinate digital health technology implementation and maintain compliance with HIPAA regulations across patient care operations.',
        requirements: ['3+ years in healthcare administration or health IT', 'Knowledge of EHR systems (Epic/Cerner)', 'HIPAA compliance certification preferred'],
        skills: ['Health IT', 'EHR', 'HIPAA', 'Healthcare Operations', 'Medical Records'],
        company: companies[0]._id,
        postedBy: recruiter1._id,
        location: 'Boston, MA',
        salary: { min: 90000, max: 125000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'mid',
        workMode: 'hybrid',
        category: 'Healthcare',
        status: 'open',
      },
      {
        title: 'Clinical Data Coordinator',
        description: 'Manage data entry, verification, and analysis for ongoing medical and clinical trials, ensuring compliance with FDA guidelines.',
        requirements: ['2+ years experience in clinical research or healthcare analytics', 'Proficiency with medical terminology and EDC systems'],
        skills: ['Clinical Trials', 'Data Analysis', 'Healthcare', 'FDA Regulations', 'EDC'],
        company: companies[3]._id,
        postedBy: recruiter1._id,
        location: 'Boston, MA',
        salary: { min: 75000, max: 105000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'entry',
        workMode: 'on-site',
        category: 'Healthcare',
        status: 'open',
      },
      {
        title: 'Senior Systems & Infrastructure Engineer',
        description: 'Design, build, and optimize hardware and cloud infrastructure systems to support high-throughput microservices.',
        requirements: ['5+ years in systems engineering or infrastructure', 'Strong background in Linux kernel, networking, and distributed systems'],
        skills: ['Infrastructure', 'Linux', 'Distributed Systems', 'Networking', 'C++', 'Go'],
        company: companies[2]._id,
        postedBy: recruiter3._id,
        location: 'Austin, TX',
        salary: { min: 145000, max: 195000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'senior',
        workMode: 'remote',
        category: 'Engineering',
        status: 'open',
      },
      {
        title: 'Enterprise Account Executive',
        description: 'Drive new business revenue by managing complex sales cycles with Fortune 500 enterprise clients.',
        requirements: ['4+ years B2B SaaS sales experience', 'Track record of exceeding sales quotas', 'Excellent negotiation skills'],
        skills: ['B2B Sales', 'Enterprise Sales', 'CRM', 'Salesforce', 'Negotiation', 'Lead Generation'],
        company: companies[1]._id,
        postedBy: recruiter2._id,
        location: 'Chicago, IL',
        salary: { min: 110000, max: 180000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'senior',
        workMode: 'remote',
        category: 'Sales',
        status: 'open',
      },
      {
        title: 'HR People Operations Partner',
        description: 'Manage employee relations, onboarding, benefits administration, and talent management programs across the company.',
        requirements: ['3+ years HR experience', 'Knowledge of labor laws and HRIS systems', 'SHRM or PHR certification preferred'],
        skills: ['Human Resources', 'People Operations', 'HRIS', 'Employee Relations', 'Onboarding'],
        company: companies[0]._id,
        postedBy: recruiter1._id,
        location: 'San Francisco, CA',
        salary: { min: 85000, max: 120000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'mid',
        workMode: 'hybrid',
        category: 'Human Resources',
        status: 'open',
      },
      {
        title: 'Customer Success Manager',
        description: 'Build long-term relationships with key SaaS accounts, driving customer satisfaction, retention, and product adoption.',
        requirements: ['3+ years in customer success or account management', 'Experience with CS tools like Gainsight or Zendesk'],
        skills: ['Customer Success', 'Account Management', 'SaaS', 'Zendesk', 'Client Retention'],
        company: companies[1]._id,
        postedBy: recruiter2._id,
        location: 'Seattle, WA',
        salary: { min: 80000, max: 115000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'mid',
        workMode: 'remote',
        category: 'Customer Service',
        status: 'open',
      },
      {
        title: 'Global Operations Manager',
        description: 'Optimize cross-departmental operations, logistics, vendor management, and internal process workflows.',
        requirements: ['5+ years in operations management', 'Six Sigma or Agile certification is a plus'],
        skills: ['Operations Management', 'Logistics', 'Process Improvement', 'Vendor Management', 'Project Management'],
        company: companies[2]._id,
        postedBy: recruiter3._id,
        location: 'Dallas, TX',
        salary: { min: 105000, max: 145000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'senior',
        workMode: 'on-site',
        category: 'Operations',
        status: 'open',
      },
      {
        title: 'Corporate Legal Counsel',
        description: 'Advise executive leadership on corporate law, commercial contracts, IP protection, and data privacy regulations.',
        requirements: ['JD degree from an accredited law school', 'Active state bar membership', '3+ years corporate legal experience'],
        skills: ['Corporate Law', 'Contract Negotiation', 'IP Law', 'Compliance', 'Data Privacy'],
        company: companies[4]._id,
        postedBy: recruiter2._id,
        location: 'Washington, DC',
        salary: { min: 150000, max: 210000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'senior',
        workMode: 'hybrid',
        category: 'Legal',
        status: 'open',
      },
      {
        title: 'Technical Curriculum & Learning Specialist',
        description: 'Develop technical training materials, online courses, and learning programs for software engineers and partners.',
        requirements: ['3+ years in instructional design or tech education', 'Experience creating online courses and workshops'],
        skills: ['Instructional Design', 'E-Learning', 'Technical Education', 'Curriculum Development'],
        company: companies[3]._id,
        postedBy: recruiter1._id,
        location: 'Remote',
        salary: { min: 80000, max: 110000, currency: 'USD' },
        jobType: 'full-time',
        experienceLevel: 'mid',
        workMode: 'remote',
        category: 'Education',
        status: 'open',
      },
    ]);

    console.log(`Created ${jobs.length} jobs`);

    // Create applications
    const applications = await Application.create([
      {
        job: jobs[0]._id, // Senior React Developer
        applicant: seekers[0]._id, // Alex
        resume: 'https://example.com/resume/alex.pdf',
        resumeOriginalName: 'alex_thompson_resume.pdf',
        coverLetter: 'I am excited to apply for the Senior React Developer position. With 3 years of experience building React applications and a strong foundation in JavaScript, I believe I can contribute to your team.',
        status: 'under-review',
      },
      {
        job: jobs[1]._id, // Full-Stack Node.js
        applicant: seekers[0]._id, // Alex
        resume: 'https://example.com/resume/alex.pdf',
        resumeOriginalName: 'alex_thompson_resume.pdf',
        coverLetter: 'As a full-stack developer with experience in Node.js and React, I am thrilled about this opportunity.',
        status: 'shortlisted',
      },
      {
        job: jobs[7]._id, // UI/UX Designer
        applicant: seekers[1]._id, // Jessica
        resume: 'https://example.com/resume/jessica.pdf',
        resumeOriginalName: 'jessica_park_resume.pdf',
        coverLetter: 'With my combined design and front-end development skills, I can bridge the gap between design and implementation.',
        status: 'interview',
      },
      {
        job: jobs[2]._id, // Junior Frontend
        applicant: seekers[1]._id, // Jessica
        resume: 'https://example.com/resume/jessica.pdf',
        resumeOriginalName: 'jessica_park_resume.pdf',
        status: 'applied',
      },
      {
        job: jobs[4]._id, // ML Engineer
        applicant: seekers[3]._id, // Priya
        resume: 'https://example.com/resume/priya.pdf',
        resumeOriginalName: 'priya_sharma_resume.pdf',
        coverLetter: 'As a PhD in Data Science with NLP research experience, I am confident I can contribute to your ML team.',
        status: 'shortlisted',
      },
      {
        job: jobs[8]._id, // AI Research Scientist
        applicant: seekers[3]._id, // Priya
        resume: 'https://example.com/resume/priya.pdf',
        resumeOriginalName: 'priya_sharma_resume.pdf',
        coverLetter: 'My research background and publication record align perfectly with this role.',
        status: 'interview',
      },
      {
        job: jobs[5]._id, // DevOps Engineer
        applicant: seekers[4]._id, // James
        resume: 'https://example.com/resume/james.pdf',
        resumeOriginalName: 'james_wilson_resume.pdf',
        coverLetter: 'I have extensive experience in cloud infrastructure and DevOps practices.',
        status: 'applied',
      },
      {
        job: jobs[6]._id, // Cloud Solutions Architect
        applicant: seekers[4]._id, // James
        resume: 'https://example.com/resume/james.pdf',
        resumeOriginalName: 'james_wilson_resume.pdf',
        status: 'rejected',
      },
      {
        job: jobs[10]._id, // React Native Mobile Dev
        applicant: seekers[5]._id, // Lisa
        resume: 'https://example.com/resume/lisa.pdf',
        resumeOriginalName: 'lisa_anderson_resume.pdf',
        coverLetter: 'I specialize in React Native development and have published several apps on the App Store.',
        status: 'hired',
      },
      {
        job: jobs[12]._id, // Backend Python Developer
        applicant: seekers[2]._id, // David
        resume: 'https://example.com/resume/david.pdf',
        resumeOriginalName: 'david_kim_resume.pdf',
        coverLetter: 'With 4+ years of backend engineering experience including Python and Django, I am a great fit.',
        status: 'under-review',
      },
      {
        job: jobs[3]._id, // Data Engineer
        applicant: seekers[2]._id, // David
        resume: 'https://example.com/resume/david.pdf',
        resumeOriginalName: 'david_kim_resume.pdf',
        status: 'applied',
      },
      {
        job: jobs[1]._id, // Full-Stack Node.js
        applicant: seekers[5]._id, // Lisa
        resume: 'https://example.com/resume/lisa.pdf',
        resumeOriginalName: 'lisa_anderson_resume.pdf',
        status: 'applied',
      },
    ]);

    // Update application counts
    const jobApplicationCounts = {};
    applications.forEach(app => {
      const jobId = app.job.toString();
      jobApplicationCounts[jobId] = (jobApplicationCounts[jobId] || 0) + 1;
    });

    for (const [jobId, count] of Object.entries(jobApplicationCounts)) {
      await Job.findByIdAndUpdate(jobId, { applicationsCount: count });
    }

    console.log(`Created ${applications.length} applications`);

    // Create some saved jobs
    await SavedJob.create([
      { user: seekers[0]._id, job: jobs[5]._id },
      { user: seekers[0]._id, job: jobs[9]._id },
      { user: seekers[0]._id, job: jobs[4]._id },
      { user: seekers[1]._id, job: jobs[0]._id },
      { user: seekers[1]._id, job: jobs[10]._id },
      { user: seekers[2]._id, job: jobs[6]._id },
    ]);

    console.log('Created saved jobs');

    // Create notifications
    await Notification.create([
      {
        user: seekers[0]._id,
        type: 'application-update',
        title: 'Application Update',
        message: 'Your application for Senior React Developer at TechCorp Solutions is now under review.',
        relatedJob: jobs[0]._id,
        relatedApplication: applications[0]._id,
        read: false,
      },
      {
        user: seekers[0]._id,
        type: 'application-update',
        title: 'Shortlisted!',
        message: 'Congratulations! You have been shortlisted for Full-Stack Node.js Engineer at TechCorp Solutions.',
        relatedJob: jobs[1]._id,
        relatedApplication: applications[1]._id,
        read: true,
      },
      {
        user: seekers[1]._id,
        type: 'application-update',
        title: 'Interview Scheduled',
        message: 'You have been selected for an interview for UI/UX Designer at InnovateTech Labs.',
        relatedJob: jobs[7]._id,
        relatedApplication: applications[2]._id,
        read: false,
      },
      {
        user: recruiter1._id,
        type: 'new-application',
        title: 'New Application',
        message: 'Alex Thompson applied for Senior React Developer.',
        relatedJob: jobs[0]._id,
        read: false,
      },
      {
        user: recruiter1._id,
        type: 'new-application',
        title: 'New Application',
        message: 'Alex Thompson applied for Full-Stack Node.js Engineer.',
        relatedJob: jobs[1]._id,
        read: true,
      },
      {
        user: seekers[5]._id,
        type: 'application-update',
        title: 'Congratulations! 🎉',
        message: 'You have been hired for React Native Mobile Developer at StartupHub Ventures!',
        relatedJob: jobs[10]._id,
        relatedApplication: applications[8]._id,
        read: false,
      },
    ]);

    console.log('Created notifications');

    console.log('\n✅ Seed data created successfully!\n');
    console.log('Demo Accounts:');
    console.log('──────────────────────────────────');
    console.log('Admin:     admin@demo.com     / Admin@123');
    console.log('Recruiter: recruiter@demo.com / Demo@123');
    console.log('Seeker:    seeker@demo.com    / Demo@123');
    console.log('──────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
