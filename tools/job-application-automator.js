#!/usr/bin/env node

/**
 * Job Application Automator
 * 
 * This script helps automate the job application process by:
 * 1. Tracking job listings
 * 2. Customizing resumes based on job requirements
 * 3. Generating cover letters
 * 4. Tracking application status
 * 
 * Usage:
 *   node job-application-automator.js [command] [options]
 *   
 *   Commands:
 *     add       Add a new job listing
 *     match     Match your skills to job requirements
 *     generate  Generate a customized resume and cover letter
 *     track     Track application status
 *     list      List all job applications
 */

const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { v4: uuidv4 } = require('uuid');

// Default paths
const DATA_DIR = path.join(__dirname, '..', 'data');
const JOBS_FILE = path.join(DATA_DIR, 'job-listings.json');
const SKILLS_FILE = path.join(DATA_DIR, 'skills.json');
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');
const RESUME_TEMPLATE = path.join(__dirname, '..', 'templates', 'resume-template.md');
const COVER_LETTER_TEMPLATE = path.join(__dirname, '..', 'templates', 'cover-letter-template.md');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize job listings file if it doesn't exist
if (!fs.existsSync(JOBS_FILE)) {
  fs.writeFileSync(JOBS_FILE, JSON.stringify([], null, 2));
}

// Initialize applications file if it doesn't exist
if (!fs.existsSync(APPLICATIONS_FILE)) {
  fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify([], null, 2));
}

// Initialize skills file if it doesn't exist
if (!fs.existsSync(SKILLS_FILE)) {
  fs.writeFileSync(SKILLS_FILE, JSON.stringify({
    technical: [],
    soft: [],
    languages: [],
    tools: [],
    other: []
  }, null, 2));
}

/**
 * Load data from a JSON file
 */
function loadData(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Save data to a JSON file
 */
function saveData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error saving data to ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Add a new job listing
 */
async function addJobListing() {
  const jobs = loadData(JOBS_FILE);
  if (!jobs) return;

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'company',
      message: 'Company name:',
      validate: input => input ? true : 'Company name is required'
    },
    {
      type: 'input',
      name: 'position',
      message: 'Position title:',
      validate: input => input ? true : 'Position title is required'
    },
    {
      type: 'input',
      name: 'location',
      message: 'Location:'
    },
    {
      type: 'input',
      name: 'url',
      message: 'Job posting URL:'
    },
    {
      type: 'input',
      name: 'salary',
      message: 'Salary range (if known):'
    },
    {
      type: 'editor',
      name: 'description',
      message: 'Job description:',
      validate: input => input ? true : 'Job description is required'
    },
    {
      type: 'editor',
      name: 'requirements',
      message: 'Job requirements:',
      validate: input => input ? true : 'Job requirements are required'
    },
    {
      type: 'input',
      name: 'deadline',
      message: 'Application deadline (YYYY-MM-DD):'
    },
    {
      type: 'list',
      name: 'priority',
      message: 'Priority:',
      choices: ['High', 'Medium', 'Low'],
      default: 'Medium'
    }
  ]);

  // Extract skills from requirements
  const requirementsText = answers.requirements;
  const extractedSkills = extractSkillsFromText(requirementsText);

  const newJob = {
    id: uuidv4(),
    company: answers.company,
    position: answers.position,
    location: answers.location,
    url: answers.url,
    salary: answers.salary,
    description: answers.description,
    requirements: answers.requirements,
    deadline: answers.deadline,
    priority: answers.priority,
    dateAdded: new Date().toISOString(),
    extractedSkills: extractedSkills,
    status: 'New'
  };

  jobs.push(newJob);
  
  if (saveData(JOBS_FILE, jobs)) {
    console.log(chalk.green(`\nJob listing for ${answers.position} at ${answers.company} added successfully!`));
    console.log(chalk.yellow('\nExtracted skills:'));
    console.log(extractedSkills.join(', '));
    
    // Ask if user wants to match skills now
    const { matchNow } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'matchNow',
        message: 'Do you want to match your skills with this job now?',
        default: true
      }
    ]);
    
    if (matchNow) {
      await matchSkillsToJob(newJob.id);
    }
  }
}

/**
 * Extract skills from job description or requirements
 */
function extractSkillsFromText(text) {
  // This is a simple implementation - in a real application, 
  // you would use NLP or more sophisticated techniques
  
  // Common technical skills to look for
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 'Express',
    'HTML', 'CSS', 'SASS', 'LESS', 'Python', 'Java', 'C#', 'C++', 'Ruby', 'PHP',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'AWS', 'Azure', 'Google Cloud',
    'Docker', 'Kubernetes', 'DevOps', 'CI/CD', 'Git', 'GitHub', 'GitLab',
    'RESTful API', 'GraphQL', 'Agile', 'Scrum', 'Jira', 'Confluence', 'Linux',
    'Windows', 'macOS', 'iOS', 'Android', 'React Native', 'Flutter', 'Swift',
    'Kotlin', 'Unity', 'WebGL', 'Three.js', 'D3.js', 'Redux', 'MobX', 'Figma',
    'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'UI/UX', 'Responsive Design',
    'Accessibility', 'SEO', 'Performance Optimization', 'Testing', 'Jest', 'Mocha',
    'Chai', 'Cypress', 'Selenium', 'TDD', 'BDD', 'Machine Learning', 'AI',
    'Data Science', 'Big Data', 'Hadoop', 'Spark', 'ETL', 'Data Visualization',
    'Tableau', 'Power BI', 'Excel', 'VBA', 'SharePoint', 'Salesforce',
    'WordPress', 'Drupal', 'Magento', 'Shopify', 'E-commerce', 'CMS',
    'Marketing', 'SEO', 'SEM', 'Google Analytics', 'Google Ads', 'Facebook Ads',
    'Social Media', 'Content Creation', 'Content Strategy', 'UX Writing',
    'Technical Writing', 'Documentation', 'Requirements Gathering',
    'Business Analysis', 'Product Management', 'Project Management',
    'Team Leadership', 'Mentoring', 'Communication', 'Problem Solving',
    'Critical Thinking', 'Creativity', 'Time Management', 'Organization',
    'Attention to Detail', 'Adaptability', 'Flexibility', 'Collaboration'
  ];
  
  const extractedSkills = [];
  
  // Check for each common skill in the text
  commonSkills.forEach(skill => {
    const skillRegex = new RegExp(`\\b${skill}\\b`, 'i');
    if (skillRegex.test(text)) {
      extractedSkills.push(skill);
    }
  });
  
  return extractedSkills;
}

/**
 * Match your skills to job requirements
 */
async function matchSkillsToJob(jobId) {
  const jobs = loadData(JOBS_FILE);
  const skills = loadData(SKILLS_FILE);
  
  if (!jobs || !skills) return;
  
  // If no job ID provided, ask user to select a job
  if (!jobId) {
    const activeJobs = jobs.filter(job => job.status !== 'Applied' && job.status !== 'Rejected');
    
    if (activeJobs.length === 0) {
      console.log(chalk.yellow('No active job listings found.'));
      return;
    }
    
    const { selectedJobId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedJobId',
        message: 'Select a job to match your skills:',
        choices: activeJobs.map(job => ({
          name: `${job.position} at ${job.company} (${job.priority} priority)`,
          value: job.id
        }))
      }
    ]);
    
    jobId = selectedJobId;
  }
  
  // Find the selected job
  const job = jobs.find(j => j.id === jobId);
  if (!job) {
    console.log(chalk.red('Job not found.'));
    return;
  }
  
  // Flatten all skills
  const allSkills = [
    ...skills.technical,
    ...skills.soft,
    ...skills.languages,
    ...skills.tools,
    ...skills.other
  ];
  
  // Match skills
  const matches = [];
  const missing = [];
  
  job.extractedSkills.forEach(jobSkill => {
    const matchingSkill = allSkills.find(s => 
      s.toLowerCase() === jobSkill.toLowerCase() ||
      jobSkill.toLowerCase().includes(s.toLowerCase()) ||
      s.toLowerCase().includes(jobSkill.toLowerCase())
    );
    
    if (matchingSkill) {
      matches.push(jobSkill);
    } else {
      missing.push(jobSkill);
    }
  });
  
  // Calculate match percentage
  const matchPercentage = job.extractedSkills.length > 0 
    ? Math.round((matches.length / job.extractedSkills.length) * 100) 
    : 0;
  
  // Display results
  console.log(chalk.green(`\nSkill Match for ${job.position} at ${job.company}`));
  console.log(`Match Percentage: ${chalk.cyan(matchPercentage + '%')}`);
  
  console.log(chalk.green('\nMatching Skills:'));
  if (matches.length === 0) {
    console.log(chalk.yellow('None'));
  } else {
    matches.forEach(skill => console.log(`✅ ${skill}`));
  }
  
  console.log(chalk.yellow('\nMissing Skills:'));
  if (missing.length === 0) {
    console.log(chalk.green('None - You have all required skills!'));
  } else {
    missing.forEach(skill => console.log(`❌ ${skill}`));
  }
  
  // Update job with match information
  job.skillMatchPercentage = matchPercentage;
  job.matchingSkills = matches;
  job.missingSkills = missing;
  job.lastMatched = new Date().toISOString();
  
  saveData(JOBS_FILE, jobs);
  
  // Ask if user wants to generate application materials
  const { generateMaterials } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'generateMaterials',
      message: 'Do you want to generate a customized resume and cover letter for this job?',
      default: matchPercentage >= 50
    }
  ]);
  
  if (generateMaterials) {
    await generateApplicationMaterials(jobId);
  }
}

/**
 * Generate a customized resume and cover letter
 */
async function generateApplicationMaterials(jobId) {
  const jobs = loadData(JOBS_FILE);
  
  if (!jobs) return;
  
  // If no job ID provided, ask user to select a job
  if (!jobId) {
    const activeJobs = jobs.filter(job => job.status !== 'Applied' && job.status !== 'Rejected');
    
    if (activeJobs.length === 0) {
      console.log(chalk.yellow('No active job listings found.'));
      return;
    }
    
    const { selectedJobId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedJobId',
        message: 'Select a job to generate materials for:',
        choices: activeJobs.map(job => ({
          name: `${job.position} at ${job.company} (${job.priority} priority)`,
          value: job.id
        }))
      }
    ]);
    
    jobId = selectedJobId;
  }
  
  // Find the selected job
  const job = jobs.find(j => j.id === jobId);
  if (!job) {
    console.log(chalk.red('Job not found.'));
    return;
  }
  
  // Collect personal information for resume and cover letter
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Your full name:',
      validate: input => input ? true : 'Name is required'
    },
    {
      type: 'input',
      name: 'email',
      message: 'Your email:',
      validate: input => input ? true : 'Email is required'
    },
    {
      type: 'input',
      name: 'phone',
      message: 'Your phone:'
    },
    {
      type: 'input',
      name: 'linkedin',
      message: 'Your LinkedIn profile:'
    },
    {
      type: 'input',
      name: 'portfolio',
      message: 'Your portfolio website:'
    },
    {
      type: 'editor',
      name: 'summary',
      message: 'Professional summary (customize for this job):'
    }
  ]);
  
  // Load templates
  let resumeTemplate;
  let coverLetterTemplate;
  
  try {
    if (fs.existsSync(RESUME_TEMPLATE)) {
      resumeTemplate = fs.readFileSync(RESUME_TEMPLATE, 'utf8');
    } else {
      resumeTemplate = '# {{name}}\n\n**Email:** {{email}} | **Phone:** {{phone}}\n**LinkedIn:** {{linkedin}} | **Portfolio:** {{portfolio}}\n\n## Professional Summary\n\n{{summary}}\n\n## Skills\n\n{{skills}}\n\n## Experience\n\n{{experience}}\n\n## Education\n\n{{education}}\n';
    }
    
    if (fs.existsSync(COVER_LETTER_TEMPLATE)) {
      coverLetterTemplate = fs.readFileSync(COVER_LETTER_TEMPLATE, 'utf8');
    } else {
      coverLetterTemplate = '# {{name}}\n\n{{email}} | {{phone}}\n{{linkedin}} | {{portfolio}}\n\n{{date}}\n\n{{company}}\n{{company_address}}\n\nDear Hiring Manager,\n\nI am writing to express my interest in the {{position}} position at {{company}}. {{summary}}\n\n{{why_interested}}\n\n{{skills_paragraph}}\n\n{{closing}}\n\nSincerely,\n\n{{name}}';
    }
  } catch (error) {
    console.error('Error loading templates:', error.message);
    return;
  }
  
  // Get skills
  const skills = loadData(SKILLS_FILE);
  
  // Load skill lists based on matching skills
  let skillsList = '';
  
  if (job.matchingSkills && job.matchingSkills.length > 0) {
    // Prioritize matching skills
    skillsList = job.matchingSkills.map(skill => `* ${skill}`).join('\n');
    
    // Add other relevant skills
    const allSkills = [
      ...skills.technical,
      ...skills.soft,
      ...skills.languages,
      ...skills.tools,
      ...skills.other
    ];
    
    // Filter out skills already included in matching skills
    const otherSkills = allSkills.filter(skill => 
      !job.matchingSkills.find(match => 
        match.toLowerCase() === skill.toLowerCase() ||
        match.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(match.toLowerCase())
      )
    );
    
    // Add up to 5 additional skills
    if (otherSkills.length > 0) {
      skillsList += '\n' + otherSkills.slice(0, 5).map(skill => `* ${skill}`).join('\n');
    }
  } else {
    // No matching skills, use general skills
    skillsList = [
      ...skills.technical.slice(0, 5),
      ...skills.soft.slice(0, 3),
      ...skills.languages.slice(0, 2),
      ...skills.tools.slice(0, 3)
    ].map(skill => `* ${skill}`).join('\n');
  }
  
  // Replace placeholders in resume template
  let resume = resumeTemplate
    .replace(/{{name}}/g, answers.name)
    .replace(/{{email}}/g, answers.email)
    .replace(/{{phone}}/g, answers.phone)
    .replace(/{{linkedin}}/g, answers.linkedin)
    .replace(/{{portfolio}}/g, answers.portfolio)
    .replace(/{{summary}}/g, answers.summary)
    .replace(/{{skills}}/g, skillsList)
    .replace(/{{experience}}/g, 'Add your experience here')
    .replace(/{{education}}/g, 'Add your education here');
  
  // Generate skills paragraph for cover letter
  const skillsParagraph = `I bring a strong set of skills directly matching your requirements, including ${job.matchingSkills?.slice(0, 3).join(', ') || 'relevant skills'}. ${job.missingSkills?.length > 0 ? `I am also actively developing skills in ${job.missingSkills.slice(0, 2).join(' and ')}.` : ''}`;
  
  // Replace placeholders in cover letter template
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  let coverLetter = coverLetterTemplate
    .replace(/{{name}}/g, answers.name)
    .replace(/{{email}}/g, answers.email)
    .replace(/{{phone}}/g, answers.phone)
    .replace(/{{linkedin}}/g, answers.linkedin)
    .replace(/{{portfolio}}/g, answers.portfolio)
    .replace(/{{date}}/g, today)
    .replace(/{{company}}/g, job.company)
    .replace(/{{company_address}}/g, 'Company Address')
    .replace(/{{position}}/g, job.position)
    .replace(/{{summary}}/g, answers.summary)
    .replace(/{{why_interested}}/g, `I am particularly interested in this opportunity because of ${job.company}'s reputation for innovation and excellence in the field.`)
    .replace(/{{skills_paragraph}}/g, skillsParagraph)
    .replace(/{{closing}}/g, `I am excited about the possibility of joining ${job.company} and would welcome the opportunity to discuss how my background and skills would be a good match for this position. Thank you for considering my application.`);
  
  // Create output directory
  const outputDir = path.join(__dirname, '..', 'applications', jobId);
  fs.mkdirSync(outputDir, { recursive: true });
  
  // Save resume and cover letter
  const resumePath = path.join(outputDir, `resume_${job.company.replace(/\s+/g, '_')}.md`);
  const coverLetterPath = path.join(outputDir, `cover_letter_${job.company.replace(/\s+/g, '_')}.md`);
  
  try {
    fs.writeFileSync(resumePath, resume);
    fs.writeFileSync(coverLetterPath, coverLetter);
    
    console.log(chalk.green('\nApplication materials generated successfully!'));
    console.log(`Resume: ${resumePath}`);
    console.log(`Cover Letter: ${coverLetterPath}`);
    
    // Update job status
    job.status = 'Materials Ready';
    job.materials = {
      resume: resumePath,
      coverLetter: coverLetterPath,
      generatedAt: new Date().toISOString()
    };
    
    saveData(JOBS_FILE, jobs);
    
    // Ask if user wants to track this application
    const { trackNow } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'trackNow',
        message: 'Do you want to track this application now?',
        default: true
      }
    ]);
    
    if (trackNow) {
      await trackApplication(jobId);
    }
  } catch (error) {
    console.error('Error saving application materials:', error.message);
  }
}

/**
 * Track application status
 */
async function trackApplication(jobId) {
  const jobs = loadData(JOBS_FILE);
  const applications = loadData(APPLICATIONS_FILE);
  
  if (!jobs || !applications) return;
  
  // If no job ID provided, ask user to select a job
  if (!jobId) {
    const jobsWithMaterials = jobs.filter(job => job.status === 'Materials Ready');
    
    if (jobsWithMaterials.length === 0) {
      console.log(chalk.yellow('No jobs with ready materials found.'));
      return;
    }
    
    const { selectedJobId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedJobId',
        message: 'Select a job to track:',
        choices: jobsWithMaterials.map(job => ({
          name: `${job.position} at ${job.company}`,
          value: job.id
        }))
      }
    ]);
    
    jobId = selectedJobId;
  }
  
  // Find the selected job
  const job = jobs.find(j => j.id === jobId);
  if (!job) {
    console.log(chalk.red('Job not found.'));
    return;
  }
  
  // Collect application information
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'status',
      message: 'Application status:',
      choices: [
        'Applied',
        'To Apply',
        'Interview Scheduled',
        'Interview Completed',
        'Offer Received',
        'Rejected',
        'Withdrawn'
      ],
      default: 'Applied'
    },
    {
      type: 'input',
      name: 'applicationDate',
      message: 'Application date (YYYY-MM-DD):',
      default: new Date().toISOString().split('T')[0],
      when: answers => answers.status === 'Applied'
    },
    {
      type: 'input',
      name: 'contactPerson',
      message: 'Contact person (if any):'
    },
    {
      type: 'input',
      name: 'contactEmail',
      message: 'Contact email (if any):'
    },
    {
      type: 'input',
      name: 'applicationPortal',
      message: 'Application portal/website:'
    },
    {
      type: 'editor',
      name: 'notes',
      message: 'Notes:'
    }
  ]);
  
  // Create application record
  const applicationRecord = {
    id: uuidv4(),
    jobId: job.id,
    company: job.company,
    position: job.position,
    status: answers.status,
    applicationDate: answers.applicationDate || null,
    contactPerson: answers.contactPerson,
    contactEmail: answers.contactEmail,
    applicationPortal: answers.applicationPortal,
    notes: answers.notes,
    history: [
      {
        status: answers.status,
        date: new Date().toISOString(),
        notes: answers.notes
      }
    ],
    lastUpdated: new Date().toISOString()
  };
  
  // Add to applications
  applications.push(applicationRecord);
  
  // Update job status
  job.status = answers.status;
  job.applicationId = applicationRecord.id;
  
  if (saveData(APPLICATIONS_FILE, applications) && saveData(JOBS_FILE, jobs)) {
    console.log(chalk.green(`\nApplication for ${job.position} at ${job.company} tracked successfully!`));
  }
}

/**
 * List all job applications
 */
function listApplications() {
  const applications = loadData(APPLICATIONS_FILE);
  
  if (!applications) return;
  
  if (applications.length === 0) {
    console.log(chalk.yellow('No applications found.'));
    return;
  }
  
  console.log(chalk.green('\nJob Applications:\n'));
  
  // Group by status
  const grouped = applications.reduce((acc, app) => {
    if (!acc[app.status]) {
      acc[app.status] = [];
    }
    acc[app.status].push(app);
    return acc;
  }, {});
  
  // Define status order
  const statusOrder = [
    'To Apply',
    'Applied',
    'Interview Scheduled',
    'Interview Completed',
    'Offer Received',
    'Rejected',
    'Withdrawn'
  ];
  
  // Display by status
  statusOrder.forEach(status => {
    if (grouped[status] && grouped[status].length > 0) {
      console.log(chalk.cyan(`\n${status} (${grouped[status].length}):`));
      
      grouped[status].forEach(app => {
        console.log(`  ${chalk.bold(app.position)} at ${chalk.bold(app.company)}`);
        if (app.applicationDate) {
          console.log(`    Applied: ${app.applicationDate}`);
        }
        if (app.contactPerson) {
          console.log(`    Contact: ${app.contactPerson}${app.contactEmail ? ` (${app.contactEmail})` : ''}`);
        }
        if (app.lastUpdated) {
          console.log(`    Last Updated: ${new Date(app.lastUpdated).toLocaleDateString()}`);
        }
        console.log();
      });
    }
  });
  
  // Summary statistics
  console.log(chalk.green('\nSummary Statistics:'));
  console.log(`Total Applications: ${applications.length}`);
  
  Object.entries(grouped).forEach(([status, apps]) => {
    console.log(`${status}: ${apps.length}`);
  });
}

/**
 * Update skills file with skills from projects
 */
function updateSkillsFromProjects() {
  try {
    const projectsDir = path.join(__dirname, '..', 'data', 'projects.json');
    if (!fs.existsSync(projectsDir)) {
      console.log(chalk.yellow('No projects file found.'));
      return;
    }
    
    const projects = loadData(projectsDir);
    const skills = loadData(SKILLS_FILE);
    
    if (!projects || !skills) return;
    
    // Extract skills from projects
    const extractedSkills = new Set();
    
    projects.forEach(project => {
      if (project.skills && Array.isArray(project.skills)) {
        project.skills.forEach(skill => extractedSkills.add(skill));
      }
      
      if (project.technologies && Array.isArray(project.technologies)) {
        project.technologies.forEach(tech => extractedSkills.add(tech));
      }
    });
    
    // Add extracted skills to technical skills
    extractedSkills.forEach(skill => {
      if (!skills.technical.includes(skill)) {
        skills.technical.push(skill);
      }
    });
    
    if (saveData(SKILLS_FILE, skills)) {
      console.log(chalk.green(`\nSkills updated from projects successfully!`));
      console.log(`Added ${extractedSkills.size} skills to your profile.`);
    }
  } catch (error) {
    console.error('Error updating skills from projects:', error.message);
  }
}

// Configure CLI
program
  .version('1.0.0')
  .description('Job Application Automator');

program
  .command('add')
  .description('Add a new job listing')
  .action(addJobListing);

program
  .command('match')
  .description('Match your skills to job requirements')
  .option('-j, --job-id <id>', 'Job ID to match against')
  .action((options) => matchSkillsToJob(options.jobId));

program
  .command('generate')
  .description('Generate a customized resume and cover letter')
  .option('-j, --job-id <id>', 'Job ID to generate materials for')
  .action((options) => generateApplicationMaterials(options.jobId));

program
  .command('track')
  .description('Track application status')
  .option('-j, --job-id <id>', 'Job ID to track')
  .action((options) => trackApplication(options.jobId));

program
  .command('list')
  .description('List all job applications')
  .action(listApplications);

program
  .command('update-skills')
  .description('Update skills file with skills from projects')
  .action(updateSkillsFromProjects);

// Parse command line arguments
program.parse(process.argv);

// If no command is provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 