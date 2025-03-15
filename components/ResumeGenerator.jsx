import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Input, Select, Tag, Divider, Typography, Alert } from 'antd';
import { PlusOutlined, DownloadOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/**
 * ResumeGenerator Component
 * 
 * A component for generating resumes based on skills gained from projects.
 * It extracts skills from project work and formats them for a resume.
 */
const ResumeGenerator = ({ projects = [], milestones = [] }) => {
  // State for form data
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    phone: '',
    linkedIn: '',
    github: '',
    website: '',
    summary: '',
  });
  
  // State for skills and projects
  const [skills, setSkills] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [resumeContent, setResumeContent] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [generateStep, setGenerateStep] = useState(1);

  // Extract skills from projects
  useEffect(() => {
    if (projects.length > 0) {
      const extractedSkills = new Set();
      
      projects.forEach(project => {
        if (project.skills && Array.isArray(project.skills)) {
          project.skills.forEach(skill => extractedSkills.add(skill));
        }
        
        // Extract skills from technologies used
        if (project.technologies && Array.isArray(project.technologies)) {
          project.technologies.forEach(tech => extractedSkills.add(tech));
        }
      });
      
      // Extract skills from milestones
      milestones.forEach(milestone => {
        if (milestone.skills && Array.isArray(milestone.skills)) {
          milestone.skills.forEach(skill => extractedSkills.add(skill));
        }
      });
      
      setSkills(Array.from(extractedSkills));
    }
  }, [projects, milestones]);

  // Handler for personal info form changes
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
  };

  // Handler for adding new skill
  const handleAddSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill('');
    }
  };

  // Handler for removing a skill
  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // Handler for project selection changes
  const handleProjectSelectionChange = (selectedProjectIds) => {
    const selected = projects.filter(project => selectedProjectIds.includes(project.id));
    setSelectedProjects(selected);
  };

  // Handler for generating the resume
  const handleGenerateResume = () => {
    // Template for the resume
    const resumeTemplate = `# ${personalInfo.name}

**Email:** ${personalInfo.email} | **Phone:** ${personalInfo.phone}
${personalInfo.linkedIn ? `**LinkedIn:** ${personalInfo.linkedIn}` : ''} ${personalInfo.github ? `| **GitHub:** ${personalInfo.github}` : ''} ${personalInfo.website ? `| **Website:** ${personalInfo.website}` : ''}

## Professional Summary

${personalInfo.summary}

## Skills

${skills.map(skill => `- ${skill}`).join('\n')}

## Project Experience

${selectedProjects.map(project => `
### ${project.name}
**Duration:** ${project.duration || 'N/A'}

${project.description || 'No description available.'}

**Key Contributions:**
${project.contributions ? project.contributions.map(contribution => `- ${contribution}`).join('\n') : '- N/A'}

**Technologies Used:**
${project.technologies ? project.technologies.map(tech => `- ${tech}`).join('\n') : '- N/A'}
`).join('\n')}

## Education

- Add your education details here

## Certifications

- Add your certifications here
`;

    setResumeContent(resumeTemplate);
    setGenerateStep(2);
    setIsPreviewMode(true);
  };

  // Handler for downloading the resume
  const handleDownloadResume = () => {
    const element = document.createElement('a');
    const file = new Blob([resumeContent], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `${personalInfo.name.replace(/\s+/g, '_')}_Resume.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Handler for editing the resume
  const handleEditResume = () => {
    setIsPreviewMode(false);
  };

  // Handler for saving the resume
  const handleSaveResume = () => {
    // Save to localStorage for now
    localStorage.setItem('savedResume', resumeContent);
    setIsPreviewMode(true);
    alert('Resume saved successfully!');
  };

  // Step 1: Collect information and select projects
  const renderStepOne = () => (
    <div>
      <Title level={3}>Personal Information</Title>
      <Form layout="vertical">
        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item label="Full Name" style={{ flex: 1 }}>
            <Input 
              name="name" 
              value={personalInfo.name} 
              onChange={handlePersonalInfoChange} 
              placeholder="John Doe"
            />
          </Form.Item>
          <Form.Item label="Email" style={{ flex: 1 }}>
            <Input 
              name="email" 
              value={personalInfo.email} 
              onChange={handlePersonalInfoChange} 
              placeholder="john.doe@example.com"
            />
          </Form.Item>
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item label="Phone" style={{ flex: 1 }}>
            <Input 
              name="phone" 
              value={personalInfo.phone} 
              onChange={handlePersonalInfoChange} 
              placeholder="(123) 456-7890"
            />
          </Form.Item>
          <Form.Item label="LinkedIn" style={{ flex: 1 }}>
            <Input 
              name="linkedIn" 
              value={personalInfo.linkedIn} 
              onChange={handlePersonalInfoChange} 
              placeholder="linkedin.com/in/johndoe"
            />
          </Form.Item>
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <Form.Item label="GitHub" style={{ flex: 1 }}>
            <Input 
              name="github" 
              value={personalInfo.github} 
              onChange={handlePersonalInfoChange} 
              placeholder="github.com/johndoe"
            />
          </Form.Item>
          <Form.Item label="Personal Website" style={{ flex: 1 }}>
            <Input 
              name="website" 
              value={personalInfo.website} 
              onChange={handlePersonalInfoChange} 
              placeholder="johndoe.com"
            />
          </Form.Item>
        </div>
        
        <Form.Item label="Professional Summary">
          <TextArea 
            name="summary" 
            value={personalInfo.summary} 
            onChange={handlePersonalInfoChange} 
            placeholder="Write a brief professional summary..."
            rows={4}
          />
        </Form.Item>
      </Form>
      
      <Divider />
      
      <Title level={3}>Skills</Title>
      <div style={{ marginBottom: '16px' }}>
        {skills.map(skill => (
          <Tag 
            key={skill}
            closable
            onClose={() => handleRemoveSkill(skill)}
            style={{ margin: '4px' }}
          >
            {skill}
          </Tag>
        ))}
      </div>
      <div style={{ display: 'flex', marginBottom: '24px' }}>
        <Input 
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="Add a skill"
          onPressEnter={handleAddSkill}
          style={{ marginRight: '8px' }}
        />
        <Button 
          icon={<PlusOutlined />} 
          onClick={handleAddSkill}
        >
          Add
        </Button>
      </div>
      
      <Divider />
      
      <Title level={3}>Select Projects</Title>
      <Form.Item>
        <Select
          mode="multiple"
          placeholder="Select projects to include"
          style={{ width: '100%' }}
          onChange={handleProjectSelectionChange}
        >
          {projects.map(project => (
            <Option key={project.id} value={project.id}>
              {project.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      
      <div style={{ marginTop: '24px', textAlign: 'right' }}>
        <Button 
          type="primary" 
          onClick={handleGenerateResume}
          disabled={!personalInfo.name || !personalInfo.email || skills.length === 0}
        >
          Generate Resume
        </Button>
      </div>
    </div>
  );

  // Step 2: Edit and download resume
  const renderStepTwo = () => (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <Title level={3}>Resume Preview</Title>
        <div>
          {isPreviewMode ? (
            <>
              <Button 
                icon={<EditOutlined />} 
                onClick={handleEditResume} 
                style={{ marginRight: '8px' }}
              >
                Edit
              </Button>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />} 
                onClick={handleDownloadResume}
              >
                Download
              </Button>
            </>
          ) : (
            <>
              <Button 
                icon={<SaveOutlined />} 
                onClick={handleSaveResume} 
                type="primary" 
                style={{ marginRight: '8px' }}
              >
                Save
              </Button>
              <Button 
                onClick={() => setIsPreviewMode(true)}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
      
      {isPreviewMode ? (
        <Card style={{ marginBottom: '16px' }}>
          <div 
            dangerouslySetInnerHTML={{ __html: marked(resumeContent) }}
            style={{ maxHeight: '600px', overflow: 'auto' }}
          />
        </Card>
      ) : (
        <TextArea 
          value={resumeContent}
          onChange={(e) => setResumeContent(e.target.value)}
          rows={20}
          style={{ marginBottom: '16px' }}
        />
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={() => setGenerateStep(1)}>Back</Button>
        <Alert
          message="Tip: The resume is in Markdown format. You can convert it to PDF using online Markdown to PDF converters."
          type="info"
          showIcon
          style={{ flex: 1, marginLeft: '16px' }}
        />
      </div>
    </div>
  );

  return (
    <div className="resume-generator">
      <Card title="Resume Generator" style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
        {generateStep === 1 ? renderStepOne() : renderStepTwo()}
      </Card>
    </div>
  );
};

export default ResumeGenerator; 