/* =========================================================
   RESUME & COVER LETTER BUILDER v1.0
   ========================================================= */

// ==================== GLOBAL VARIABLES ====================
let skills = [];
let languages = [];
let experiences = [];
let education = [];
let customSections = [];
let references = [];
let profilePicData = null;
let currentDocType = 'resume';
let coverLetterBody = '';

// temporarily added to remove localStorage during testing
//localStorage.removeItem('resumeBuilderData');

// Section order management
let sectionOrder = {
    left: ["contact", "skills", "languages", "references"],
    right: ["summary", "experience", "education"]
};

const defaultSectionOrder = {
    left: ["contact", "skills", "languages", "references"],
    right: ["summary", "experience", "education"]
};

// Memory storage for form data
let formData = {
    firstName: '',
    lastName: '',
    jobTitle: '',
    phone: '',
    email: '',
    linkedin: '',
    location: '',
    dob: '',              
    nationality: '',      
    summary: '',
    aboutType: 'summary',
    contactHeading: 'CONTACT',
    summaryHeading: 'auto',
    experienceHeading: 'PROFESSIONAL EXPERIENCE',
    educationHeading: 'EDUCATION',
    skillsHeading: 'TECHNICAL SKILLS',
    languagesHeading: 'LANGUAGES',
    referencesHeading: 'REFERENCES',
    mainColor: '#008c8c',
    gradientColor: '#8c8c00',
    rightBgColor: '#e6ebf0',
    rightContentColor: '#ffffff',
    useGradient: true,
    fontFamily: "'Segoe UI', sans-serif",
    fontSize: '11',
    bulletStyle: '•',  // ✓ FIXED: proper bullet character
    leftWidth: '35',
    rightWidth: '65',
    rightHeaderPadding: '15',
    rightBodyPadding: '17'
};

const SECTION_HEADING_VARIANTS = {
    contact: [
        'CONTACT',
        'CONTACT INFORMATION',
        'CONTACT DETAILS',
        'PERSONAL DETAILS',
        'GET IN TOUCH',
        'REACH ME',
        "LET'S CONNECT"
    ],
    summary: [
        'auto',
        'PROFESSIONAL PROFILE',
        'PROFESSIONAL SUMMARY',
        'CAREER SUMMARY',
        'EXECUTIVE SUMMARY',
        'ABOUT ME',
        'PROFILE',
        'CAREER OBJECTIVE',
        'OBJECTIVE',
        'PROFESSIONAL OVERVIEW',
        'SUMMARY OF QUALIFICATIONS',
        'CAREER HIGHLIGHTS',
        'WHO I AM',
        'INTRODUCTION',
        'SNAPSHOT'
    ],
    experience: [
        'PROFESSIONAL EXPERIENCE',
        'WORK EXPERIENCE',
        'EMPLOYMENT HISTORY',
        'CAREER HISTORY',
        'WORK HISTORY',
        'PROFESSIONAL BACKGROUND',
        'EXPERIENCE',
        'EMPLOYMENT',
        'CAREER EXPERIENCE',
        'RELEVANT EXPERIENCE',
        'PROFESSIONAL JOURNEY'
    ],
    education: [
        'EDUCATION',
        'ACADEMIC BACKGROUND',
        'EDUCATIONAL QUALIFICATIONS',
        'ACADEMIC CREDENTIALS',
        'QUALIFICATIONS',
        'ACADEMIC HISTORY',
        'TRAINING & EDUCATION',
        'ACADEMIC PROFILE',
        'EDUCATIONAL BACKGROUND'
    ],
    skills: [
        'TECHNICAL SKILLS',
        'CORE COMPETENCIES',
        'PROFESSIONAL SKILLS',
        'KEY SKILLS',
        'SKILLS & EXPERTISE',
        'AREAS OF EXPERTISE',
        'COMPETENCIES',
        'SKILL SET',
        'CORE SKILLS',
        'EXPERTISE',
        'PROFICIENCIES',
        'TECHNICAL PROFICIENCIES',
        'CAPABILITIES'
    ],
    languages: [
        'LANGUAGES',
        'LANGUAGE PROFICIENCY',
        'LANGUAGE SKILLS',
        'MULTILINGUAL SKILLS',
        'LINGUISTIC ABILITIES',
        'SPOKEN LANGUAGES'
    ],
    references: [
        'REFERENCES',
        'PROFESSIONAL REFERENCES',
        'REFERENCES AVAILABLE',
        'REFEREE DETAILS',
        'RECOMMENDATIONS'
    ]
};

// ==================== UNIFIED DATA MANAGEMENT ====================
function collectAllData() {
    const fields = ['firstName', 'lastName', 'jobTitle', 'phone', 'email', 'linkedin', 'location', 'summary', 'aboutType',
                    'mainColor', 'gradientColor', 'rightBgColor', 'rightContentColor', 'fontFamily', 'fontSize', 
                    'bulletStyle', 'leftWidth', 'rightWidth', 'rightHeaderPadding', 'rightBodyPadding'];
    
    fields.forEach(field => {
        const el = document.getElementById(field);
        if (el) {
            formData[field] = el.type === 'checkbox' ? el.checked : el.value;
        }
    });
    
    const useGradientEl = document.getElementById('useGradient');
    if (useGradientEl) formData.useGradient = useGradientEl.checked;
    
    const clBodyEl = document.getElementById('clBody');
    if (clBodyEl) coverLetterBody = clBodyEl.value;

    return {
        version: '1.0',
        timestamp: new Date().toISOString(),
        formData,
        coverLetterBody,
        profilePicData,
        profilePicPlacement: ProfilePicManager.placement,
        skills,
        languages,
        experiences,
        education,
        customSections,
        references,
        sectionOrder,
        currentDocType
    };
}

function restoreAllData(data) {
    if (!data) return;
    if (data.profilePicPlacement) {
         ProfilePicManager.placement = data.profilePicPlacement;
     }
     ProfilePicManager.updateStatus();
    
    if (data.formData) {
        formData = { ...formData, ...data.formData };
    }
    
    Object.keys(formData).forEach(key => {
        const el = document.getElementById(key);
        if (el) {
            if (el.type === 'checkbox') {
                el.checked = formData[key];
            } else {
                el.value = formData[key];
            }
        }
    });
    
    skills = data.skills || [];
    languages = data.languages || [];
    experiences = data.experiences || [];
    education = data.education || [];
    customSections = data.customSections || [];
    references = data.references || [];
    
    profilePicData = data.profilePicData || null;
    coverLetterBody = data.coverLetterBody || '';
    currentDocType = data.currentDocType || 'resume';
    
    // Migrate old sectionOrder format
    if (data.sectionOrder) {
        sectionOrder = { left: [], right: [] };
        
        // Copy non-custom sections
        ['left', 'right'].forEach(side => {
            if (Array.isArray(data.sectionOrder[side])) {
                sectionOrder[side] = data.sectionOrder[side].filter(k => k !== 'custom');
            }
        });
        
        // Add individual custom sections
        customSections.forEach(section => {
            const customKey = `custom_${section.id}`;
            const placement = section.placement || 'right';
            if (!sectionOrder[placement].includes(customKey)) {
                sectionOrder[placement].push(customKey);
            }
        });
    } else {
        sectionOrder = {
            left: ["contact", "skills", "languages", "references"],
            right: ["summary", "experience", "education"]
        };
        
        // Add custom sections
        customSections.forEach(section => {
            const customKey = `custom_${section.id}`;
            const placement = section.placement || 'right';
            sectionOrder[placement].push(customKey);
        });
    }
    
    const clBodyEl = document.getElementById('clBody');
    if (clBodyEl) clBodyEl.value = coverLetterBody;
}

function saveToLocalStorage() {
    const data = collectAllData();
    localStorage.setItem('resumeBuilderData', JSON.stringify(data));
    console.log('💾 Saved to localStorage');
}

function loadFromLocalStorage() {
    const stored = localStorage.getItem('resumeBuilderData');
    if (stored) {
        try {
            const data = JSON.parse(stored);
            restoreAllData(data);
            cleanupSectionOrder(); // 
            console.log('✅ Loaded from localStorage');
            return true;
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return false;
        }
    }
    return false;
}

// ==================== INITIALIZATION ====================
window.addEventListener('load', () => {
    console.log("=== Application Loading ===");
    
    loadFromLocalStorage();
    
    renderSkills();
    renderLanguages();
    renderExperiences();
    renderEducation();
    renderCustomSections();
    renderReferences();
    
    HistoryManager.init();
    
    updatePreview();
    updateCoverLetterPreview();
    updateAllToggleButtons();
    
    setInterval(saveToLocalStorage, 10000);
    
    console.log("=== Application Loaded Successfully ===");
});

window.addEventListener('beforeunload', () => {
    saveToLocalStorage();
});

// ==================== RIBBON & NAVIGATION ====================
function switchRibbonTab(tabName) {
    document.querySelectorAll('.ribbon-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.ribbon-tab').forEach(t => t.classList.remove('active'));
    
    const content = document.querySelector(`.ribbon-content[data-tab="${tabName}"]`);
    if (content) content.classList.add('active');
    
    if (event && event.target) {
        const tab = event.target.closest('.ribbon-tab');
        if (tab) tab.classList.add('active');
    }
}

function switchDocument(type) {
    currentDocType = type;
    const resumePreview = document.getElementById('resumePreview');
    const coverLetterPreview = document.getElementById('coverLetterPreview');
    const statusDocType = document.getElementById('statusDocType');
    const resumeSections = document.getElementById('resumeSections');
    const coverLetterSections = document.getElementById('coverLetterSections');
    
    if (type === 'resume') {
        if (resumePreview) resumePreview.style.display = 'flex';
        if (coverLetterPreview) coverLetterPreview.style.display = 'none';
        if (statusDocType) statusDocType.textContent = 'Resume';
        if (resumeSections) resumeSections.style.display = 'block';
        if (coverLetterSections) coverLetterSections.style.display = 'none';
        updatePreview();
    } else {
        if (resumePreview) resumePreview.style.display = 'none';
        if (coverLetterPreview) coverLetterPreview.style.display = 'block';
        if (statusDocType) statusDocType.textContent = 'Cover Letter';
        if (resumeSections) resumeSections.style.display = 'none';
        if (coverLetterSections) coverLetterSections.style.display = 'block';
        updateCoverLetterPreview();
    }
    closeFormPanel();
    saveToLocalStorage();
}

function switchToCoverLetter() {
    switchDocument('cover');
    openFormPanel('coverLetter');
}

// ==================== FORM PANEL MANAGEMENT ====================
function openFormPanel(section) {
    const panel = document.getElementById('formPanel');
    const title = document.getElementById('formPanelTitle');
    const content = document.getElementById('formPanelContent');

    if (!panel || !title || !content) return;

    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    if (event && event.target) {
        const sidebarItem = event.target.closest('.sidebar-item');
        if (sidebarItem) sidebarItem.classList.add('active');
    }

    const titles = {
        personal: 'Personal Information',
        about: 'About Me / Summary',
        experience: 'Professional Experience',
        education: 'Education',
        skills: 'Technical Skills',
        languages: 'Languages',
        custom: 'Custom Sections',
        references: 'References',
        coverLetter: 'Cover Letter'
    };
    title.textContent = titles[section] || 'Edit Section';

    content.innerHTML = getFormContent(section);
    restoreFormValues(section);
    if (section === 'personal') {
    setTimeout(() => ProfilePicManager.updateStatus(), 50);
}
    if (section === 'skills') renderSkills();
    if (section === 'languages') renderLanguages();
    if (section === 'experience') renderExperiences();
    if (section === 'education') renderEducation();
    if (section === 'custom') {
    // Delay rendering until DOM is ready
    setTimeout(() => renderCustomSections(),50 );
}
    if (section === 'references') renderReferences();

    panel.classList.add('open');
}

function closeFormPanel() {
    collectAllData();
    const panel = document.getElementById('formPanel');
    if (panel) panel.classList.remove('open');
}

function restoreFormValues(section) {
    setTimeout(() => {
        Object.keys(formData).forEach(key => {
            const el = document.getElementById(key);
            if (el) {
                if (el.type === 'checkbox') {
                    el.checked = formData[key];
                } else {
                    el.value = formData[key];
                }
            }
        });
        
        // ✅ ADD THIS: Restore section heading dropdowns
        const headingFields = ['contactHeading', 'summaryHeading', 'experienceHeading', 
                               'educationHeading', 'skillsHeading', 'languagesHeading', 'referencesHeading'];
        headingFields.forEach(field => {
            const el = document.getElementById(field);
            if (el && formData[field]) {
                el.value = formData[field];
            }
        });
        
        if (section === 'coverLetter') {
            const clBodyEl = document.getElementById('clBody');
            if (clBodyEl) clBodyEl.value = coverLetterBody;
        }
    }, 50);
}

function getFormContent(section) {
    switch(section) {
        case 'coverLetter':
            return `
                <div class="info-box">
                    <i class="fas fa-info-circle"></i>
                    <span>Write your complete cover letter below.</span>
                </div>
                <div class="form-group">
                    <label>Cover Letter Body:</label>
                    <textarea id="clBody" placeholder="Write your full cover letter here..." 
                              onchange="coverLetterBody=this.value; updateCoverLetterPreview(); saveToLocalStorage();" 
                              style="min-height: 500px; font-family: inherit; line-height: 1.6;"></textarea>
                </div>
            `;
            
        case 'personal':
    return `
        <div class="form-group">
            <label>Profile Picture:</label>
            <input type="file" id="profilePic" accept="image/*" onchange="loadProfilePic()">
        </div>
        <div class="form-group" style="display: flex; gap: 10px; align-items: center;">
            <button type="button" class="ribbon-btn small" onclick="ProfilePicManager.moveLeft()" 
                    style="flex: 1;" title="Move profile picture to left column">
                <i class="fas fa-arrow-left"></i>
                <span>Move Left</span>
            </button>
            <button type="button" class="ribbon-btn small" onclick="ProfilePicManager.moveRight()" 
                    style="flex: 1;" title="Move profile picture to right header">
                <i class="fas fa-arrow-right"></i>
                <span>Move Right</span>
            </button>
            <button type="button" class="ribbon-btn small" onclick="ProfilePicManager.remove()" 
                    style="flex: 1; border-color: #dc3545;" title="Remove profile picture">
                <i class="fas fa-trash" style="color: #dc3545;"></i>
                <span style="color: #dc3545;">Remove</span>
            </button>
        </div>
        <div id="profilePicStatus" style="font-size: 12px; color: #666; margin-top: 5px; text-align: center;">
            <!-- Status will be shown here -->
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>First & Middle Name:</label>
                <input type="text" id="firstName" placeholder="John" onchange="updatePreview(); saveToLocalStorage();">
            </div>
            <div class="form-group">
                <label>Last Name:</label>
                <input type="text" id="lastName" placeholder="Doe" onchange="updatePreview(); saveToLocalStorage();">
            </div>
        </div>
        <div class="form-group">
            <label>Job Title:</label>
            <input type="text" id="jobTitle" placeholder="Software Engineer" onchange="updatePreview(); saveToLocalStorage();">
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label>Date of Birth:</label>
                <input type="text" id="dob" placeholder="e.g., 15 March 1990" onchange="updatePreview(); saveToLocalStorage();">
            </div>
            <div class="form-group">
                <label>Nationality:</label>
                <input type="text" id="nationality" placeholder="e.g., Finnish" onchange="updatePreview(); saveToLocalStorage();">
            </div>
        </div>
        
        <h4 style="margin: 20px 0 10px; color: #2b579a;">Contact Information</h4>
        
        ${generateHeadingSelector('contact', formData.contactHeading)}
        
        <div class="placement-control">
            <button id="contactToggle" class="toggle-btn" onclick="ResumeManager.toggleSectionPlacement('contact')" title="Move left/right">⇄</button>
            <button class="order-btn" onclick="ResumeManager.reorderSection('contact', 'up')" title="Move up">↑</button>
            <button class="order-btn" onclick="ResumeManager.reorderSection('contact', 'down')" title="Move down">↓</button>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Phone:</label>
                <input type="tel" id="phone" placeholder="+1 234 567 8900" onchange="updatePreview(); saveToLocalStorage();">
            </div>
            <div class="form-group">
                <label>Email:</label>
                <input type="email" id="email" placeholder="john@example.com" onchange="updatePreview(); saveToLocalStorage();">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>LinkedIn:</label>
                <input type="text" id="linkedin" placeholder="linkedin.com/in/johndoe" onchange="updatePreview(); saveToLocalStorage();">
            </div>
            <div class="form-group">
                <label>Location:</label>
                <input type="text" id="location" placeholder="New York, USA" onchange="updatePreview(); saveToLocalStorage();">
            </div>
        </div>
    `;
        case 'about':
            return `
                <div class="form-group">
                    <label>Section Type:</label>
                    <select id="aboutType" onchange="updateAboutLabel(); updatePreview(); saveToLocalStorage();">
                        <option value="about">About Me</option>
                        <option value="summary">Professional Profile</option>
                        <option value="objective">Career Objective</option>
                    </select>
                </div>
                
                ${generateHeadingSelector('summary', formData.summaryHeading)}
                
                <div class="placement-control">
                    <button id="summaryToggle" class="toggle-btn" onclick="ResumeManager.toggleSectionPlacement('summary')" title="Move left/right">⇄</button>
                    <button class="order-btn" onclick="ResumeManager.reorderSection('summary', 'up')" title="Move up">↑</button>
                    <button class="order-btn" onclick="ResumeManager.reorderSection('summary', 'down')" title="Move down">↓</button>
                </div>
                <div class="form-group">
                    <label id="aboutLabel">Summary:</label>
                    <textarea id="summary" placeholder="Write a brief professional summary..." 
                            onchange="updatePreview(); saveToLocalStorage();" 
                            style="min-height: 250px;"></textarea>
                </div>
            `;

        case 'experience':
            return `
                ${generateHeadingSelector('experience', formData.experienceHeading)}
                
                <div class="placement-control">
                    <button id="experienceToggle" class="toggle-btn" onclick="ResumeManager.toggleSectionPlacement('experience')" title="Move left/right">⇄</button>
                    <button class="order-btn" onclick="ResumeManager.reorderSection('experience', 'up')" title="Move up">↑</button>
                    <button class="order-btn" onclick="ResumeManager.reorderSection('experience', 'down')" title="Move down">↓</button>
                </div>
                <div id="experienceContainer"></div>
                <button class="add-btn" onclick="addExperience()"><i class="fas fa-plus"></i> Add Experience</button>
            `;

        case 'education':
            return `
                ${generateHeadingSelector('education', formData.educationHeading)}
                
                <div class="placement-control">
                    <button id="educationToggle" class="toggle-btn" onclick="ResumeManager.toggleSectionPlacement('education')" title="Move left/right">⇄</button>
                    <button class="order-btn" onclick="ResumeManager.reorderSection('education', 'up')" title="Move up">↑</button>
                    <button class="order-btn" onclick="ResumeManager.reorderSection('education', 'down')" title="Move down">↓</button>
                </div>
                <div id="educationContainer"></div>
                <button class="add-btn" onclick="addEducation()"><i class="fas fa-plus"></i> Add Education</button>
            `;

        case 'skills':
            return `
                ${generateHeadingSelector('skills', formData.skillsHeading)}
                
                <div class="placement-control">
                    <button id="skillsToggle" class="toggle-btn" onclick="ResumeManager.toggleSectionPlacement('skills')" title="Move left/right">⇄</button>
                    <button class="order-btn" onclick="ResumeManager.reorderSection('skills', 'up')" title="Move up">↑</button>
                    <button class="order-btn" onclick="ResumeManager.reorderSection('skills', 'down')" title="Move down">↓</button>
                </div>
                <div id="skillsContainer"></div>
                <button class="add-btn" onclick="addSkill()"><i class="fas fa-plus"></i> Add Skill Category</button>
            `;

        case 'languages':
            return `
                ${generateHeadingSelector('languages', formData.languagesHeading)}
                
                <div class="placement-control">
                    <button id="languagesToggle" class="toggle-btn" onclick="ResumeManager.toggleSectionPlacement('languages')" title="Move left/right">⇄</button>
                    <button class="order-btn" onclick="ResumeManager.reorderSection('languages', 'up')" title="Move up">↑</button>
                    <button class="order-btn" onclick="ResumeManager.reorderSection('languages', 'down')" title="Move down">↓</button>
                </div>
                <div id="languagesContainer"></div>
                <button class="add-btn" onclick="addLanguage()"><i class="fas fa-plus"></i> Add Language</button>
            `;

        case 'custom':
            return `
                <div style="background: #fff3cd; padding: 12px; border-radius: 4px; margin-bottom: 20px;">
                    <i class="fas fa-lightbulb"></i> Create custom sections like Certifications, Publications, Awards, etc.
                </div>
                <div id="customContainer"></div>
                <button class="add-btn" onclick="addCustomSection()"><i class="fas fa-plus"></i> Add Custom Section</button>
            `;

        case 'references':
            return `
                ${generateHeadingSelector('references', formData.referencesHeading)}
                        
                <div class="placement-control">
                    <button id="referencesToggle" class="toggle-btn" onclick="ResumeManager.toggleSectionPlacement('references')" title="Move left/right">⇄</button>
                    <button class="order-btn" onclick="ResumeManager.reorderSection('references', 'up')" title="Move up">↑</button>
                    <button class="order-btn" onclick="ResumeManager.reorderSection('references', 'down')" title="Move down">↓</button>
                </div>
                <div id="referencesContainer"></div>
                <button class="add-btn" onclick="addReference()"><i class="fas fa-plus"></i> Add Reference</button>
            `;
    }
}

function updateAboutLabel() {
    const aboutType = document.getElementById('aboutType');
    const aboutLabel = document.getElementById('aboutLabel');
    
    if (!aboutType || !aboutLabel) return;
    
    const labels = {
        'about': 'About Me:',
        'summary': 'Professional Summary:',
        'objective': 'Career Objective:'
    };
    
    aboutLabel.textContent = labels[aboutType.value] || 'Summary:';
}

// ==================== PROFILE PICTURE ====================
function loadProfilePic() {
    const file = document.getElementById('profilePic')?.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            profilePicData = e.target.result;
            updatePreview();
            saveToLocalStorage();
        };
        reader.readAsDataURL(file);
    }
}

// ==================== DYNAMIC SECTIONS ====================
function addSkill() {
    skills.push({ id: Date.now(), category: '', items: '', order: skills.length });
    renderSkills();
}

function removeSkill(id) {
    skills = skills.filter(s => s.id !== id);
    renderSkills();
    updatePreview();
    saveToLocalStorage();
}

function moveSkillUp(id) {
    const index = skills.findIndex(s => s.id === id);
    if (index > 0) {
        [skills[index - 1], skills[index]] = [skills[index], skills[index - 1]];
        renderSkills();
        updatePreview();
        saveToLocalStorage();
    }
}

function moveSkillDown(id) {
    const index = skills.findIndex(s => s.id === id);
    if (index < skills.length - 1 && index !== -1) {
        [skills[index + 1], skills[index]] = [skills[index], skills[index + 1]];
        renderSkills();
        updatePreview();
        saveToLocalStorage();
    }
}

function renderSkills() {
    const container = document.getElementById('skillsContainer');
    if (!container) return;
    
    container.innerHTML = skills.map((skill, index) => `
        <div class="dynamic-item">
            <div class="dynamic-item-header">
                <strong>Skill Category ${index + 1}</strong>
                <button class="order-btn" onclick="moveSkillUp(${skill.id})" ${index === 0 ? 'disabled' : ''} title="Move up">↑</button>
                <button class="order-btn" onclick="moveSkillDown(${skill.id})" ${index === skills.length - 1 ? 'disabled' : ''} title="Move down">↓</button>
                <button class="delete-btn" onclick="removeSkill(${skill.id})">Delete</button>
            </div>
            <div class="form-group">
                <label>Category Name:</label>
                <input type="text" value="${skill.category}" 
                    placeholder="e.g., CAD Modeling"
                    onchange="skills.find(s=>s.id===${skill.id}).category=this.value; updatePreview(); saveToLocalStorage();">
            </div>
            <div class="form-group">
                <label>Skills (comma separated):</label>
                <input type="text" value="${skill.items}" 
                    placeholder="e.g., SolidWorks, CATIA V5, AutoCAD"
                    onchange="skills.find(s=>s.id===${skill.id}).items=this.value; updatePreview(); saveToLocalStorage();">
            </div>
        </div>
    `).join('');
}

function addLanguage() {
    languages.push({ id: Date.now(), name: '', level: '', order: languages.length });
    renderLanguages();
}

function removeLanguage(id) {
    languages = languages.filter(l => l.id !== id);
    renderLanguages();
    updatePreview();
    saveToLocalStorage();
}

function moveLanguageUp(id) {
    const index = languages.findIndex(s => s.id === id);
    if (index > 0) {
        [languages[index - 1], languages[index]] = [languages[index], languages[index - 1]];
        renderLanguages();
        updatePreview();
        saveToLocalStorage();
    }
}

function moveLanguageDown(id) {
    const index = languages.findIndex(s => s.id === id);
    if (index < languages.length - 1 && index !== -1) {
        [languages[index + 1], languages[index]] = [languages[index], languages[index + 1]];
        renderLanguages();
        updatePreview();
        saveToLocalStorage();
    }
}

function renderLanguages() {
    const container = document.getElementById('languagesContainer');
    if (!container) return;
    
    container.innerHTML = languages.map((lang, index) => `
        <div class="dynamic-item">
            <div class="dynamic-item-header">
                <strong>Language ${index + 1}</strong>
                <button class="order-btn" onclick="moveLanguageUp(${lang.id})" ${index === 0 ? 'disabled' : ''} title="Move up">↑</button>
                <button class="order-btn" onclick="moveLanguageDown(${lang.id})" ${index === languages.length - 1 ? 'disabled' : ''} title="Move down">↓</button>
                <button class="delete-btn" onclick="removeLanguage(${lang.id})">Delete</button>
            </div>
            <div class="form-group">
                <label>Language:</label>
                <input type="text" value="${lang.name}" 
                    placeholder="e.g., English"
                    onchange="languages.find(l=>l.id===${lang.id}).name=this.value; updatePreview(); saveToLocalStorage();">
            </div>
            <div class="form-group">
                <label>Level:</label>
                <input type="text" value="${lang.level}" 
                    placeholder="e.g., Fluent"
                    onchange="languages.find(l=>l.id===${lang.id}).level=this.value; updatePreview(); saveToLocalStorage();">
            </div>
        </div>
    `).join('');
}

function addExperience() {
    experiences.push({ 
        id: Date.now(), 
        company: '', 
        location: '', 
        position: '', 
        startDate: '', 
        endDate: '', 
        description: '', 
        order: experiences.length 
    });
    renderExperiences();
}

function removeExperience(id) {
    experiences = experiences.filter(e => e.id !== id);
    renderExperiences();
    updatePreview();
    saveToLocalStorage();
}

function moveExperienceUp(id) {
    const index = experiences.findIndex(s => s.id === id);
    if (index > 0) {
        [experiences[index - 1], experiences[index]] = [experiences[index], experiences[index - 1]];
        renderExperiences();
        updatePreview();
        saveToLocalStorage();
    }
}

function moveExperienceDown(id) {
    const index = experiences.findIndex(s => s.id === id);
    if (index < experiences.length - 1 && index !== -1) {
        [experiences[index + 1], experiences[index]] = [experiences[index], experiences[index + 1]];
        renderExperiences();
        updatePreview();
        saveToLocalStorage();
    }
}

function renderExperiences() {
    const container = document.getElementById('experienceContainer');
    if (!container) return;
    
    container.innerHTML = experiences.map((exp, index) => `
        <div class="dynamic-item">
            <div class="dynamic-item-header">
                <strong>Experience ${index + 1}</strong>
                <button class="order-btn" onclick="moveExperienceUp(${exp.id})" ${index === 0 ? 'disabled' : ''} title="Move up">↑</button>
                <button class="order-btn" onclick="moveExperienceDown(${exp.id})" ${index === experiences.length - 1 ? 'disabled' : ''} title="Move down">↓</button>
                <button class="delete-btn" onclick="removeExperience(${exp.id})">Delete</button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Company/Organization:</label>
                    <input type="text" value="${exp.company}" 
                        placeholder="e.g., Tech Company Inc."
                        onchange="experiences.find(e=>e.id===${exp.id}).company=this.value; updatePreview(); saveToLocalStorage();">
                </div>
                <div class="form-group">
                    <label>Location:</label>
                    <input type="text" value="${exp.location}" 
                        placeholder="e.g., FI"
                        onchange="experiences.find(e=>e.id===${exp.id}).location=this.value; updatePreview(); saveToLocalStorage();">
                </div>
            </div>
            <div class="form-group">
                <label>Position:</label>
                <input type="text" value="${exp.position}" 
                    placeholder="e.g., Senior Engineer"
                    onchange="experiences.find(e=>e.id===${exp.id}).position=this.value; updatePreview(); saveToLocalStorage();">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Start Date:</label>
                    <input type="text" value="${exp.startDate}" 
                        placeholder="e.g., Jun. 2019"
                        onchange="experiences.find(e=>e.id===${exp.id}).startDate=this.value; updatePreview(); saveToLocalStorage();">
                </div>
                <div class="form-group">
                    <label>End Date:</label>
                    <input type="text" value="${exp.endDate}" 
                        placeholder="e.g., Oct. 2023 or Present"
                        onchange="experiences.find(e=>e.id===${exp.id}).endDate=this.value; updatePreview(); saveToLocalStorage();">
                </div>
            </div>
            <div class="form-group">
                <label>Description (one bullet per line):</label>
                <textarea 
                    placeholder="• Achievement one&#10;• Achievement two&#10;• Achievement three"
                    onchange="experiences.find(e=>e.id===${exp.id}).description=this.value; updatePreview(); saveToLocalStorage();">${exp.description}</textarea>
            </div>
        </div>
    `).join('');
}

function addEducation() {
    education.push({ 
        id: Date.now(), 
        school: '', 
        degree: '', 
        location: '', 
        startDate: '', 
        endDate: '',
        specialization: '',
        coursework: '',
        thesis: '',
        thesisLink: '',
        order: education.length 
    });
    renderEducation();
}
function removeEducation(id) {
    education = education.filter(e => e.id !== id);
    renderEducation();
    updatePreview();
    saveToLocalStorage();
}

function moveEducationUp(id) {
    const index = education.findIndex(s => s.id === id);
    if (index > 0) {
        [education[index - 1], education[index]] = [education[index], education[index - 1]];
        renderEducation();
        updatePreview();
        saveToLocalStorage();
    }
}

function moveEducationDown(id) {
    const index = education.findIndex(s => s.id === id);
    if (index < education.length - 1 && index !== -1) {
        [education[index + 1], education[index]] = [education[index], education[index + 1]];
        renderEducation();
        updatePreview();
        saveToLocalStorage();
    }
}

function renderEducation() {
    const container = document.getElementById('educationContainer');
    if (!container) return;
    
    container.innerHTML = education.map((edu, index) => `
        <div class="dynamic-item">
            <div class="dynamic-item-header">
                <strong>Education ${index + 1}</strong>
                <button class="order-btn" onclick="moveEducationUp(${edu.id})" ${index === 0 ? 'disabled' : ''} title="Move up">↑</button>
                <button class="order-btn" onclick="moveEducationDown(${edu.id})" ${index === education.length - 1 ? 'disabled' : ''} title="Move down">↓</button>
                <button class="delete-btn" onclick="removeEducation(${edu.id})">Delete</button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>School/University:</label>
                    <input type="text" value="${edu.school || ''}" 
                        placeholder="e.g., Aalto University"
                        onchange="education.find(e=>e.id===${edu.id}).school=this.value; updatePreview(); saveToLocalStorage();">
                </div>
                <div class="form-group">
                    <label>Location:</label>
                    <input type="text" value="${edu.location || ''}" 
                        placeholder="e.g., Espoo, Finland"
                        onchange="education.find(e=>e.id===${edu.id}).location=this.value; updatePreview(); saveToLocalStorage();">
                </div>
            </div>
            <div class="form-group">
                <label>Degree:</label>
                <input type="text" value="${edu.degree || ''}" 
                    placeholder="e.g., B.Eng. in Industrial Engineering"
                    onchange="education.find(e=>e.id===${edu.id}).degree=this.value; updatePreview(); saveToLocalStorage();">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Start Date:</label>
                    <input type="text" value="${edu.startDate || ''}" 
                        placeholder="e.g., Aug 2019"
                        onchange="education.find(e=>e.id===${edu.id}).startDate=this.value; updatePreview(); saveToLocalStorage();">
                </div>
                <div class="form-group">
                    <label>End Date:</label>
                    <input type="text" value="${edu.endDate || ''}" 
                        placeholder="e.g., May 2023"
                        onchange="education.find(e=>e.id===${edu.id}).endDate=this.value; updatePreview(); saveToLocalStorage();">
                </div>
            </div>
            <div class="form-group">
                <label>Specialization:</label>
                <input type="text" value="${edu.specialization || ''}" 
                    placeholder="e.g., Automation and Manufacturing Systems"
                    onchange="education.find(e=>e.id===${edu.id}).specialization=this.value; updatePreview(); saveToLocalStorage();">
            </div>
            <div class="form-group">
                <label>Relevant Coursework (use • to separate):</label>
                <textarea 
                    placeholder="e.g., Manufacturing Processes • Control Systems • Product Design"
                    onchange="education.find(e=>e.id===${edu.id}).coursework=this.value; updatePreview(); saveToLocalStorage();">${edu.coursework || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Thesis Title:</label>
                <input type="text" value="${edu.thesis || ''}" 
                    placeholder="e.g., Analysis of fatigue strength in welded steel structures"
                    onchange="education.find(e=>e.id===${edu.id}).thesis=this.value; updatePreview(); saveToLocalStorage();">
            </div>
            <div class="form-group">
                <label>Thesis Link (optional):</label>
                <input type="text" value="${edu.thesisLink || ''}" 
                    placeholder="e.g., https://exampleuniversity.edu/thesis/12345"
                    onchange="education.find(e=>e.id===${edu.id}).thesisLink=this.value; updatePreview(); saveToLocalStorage();">
            </div>
        </div>
    `).join('');
}
function addCustomSection() {
    const newSection = { 
        id: Date.now(), 
        title: '', 
        items: [],
        placement: 'right',
        order: customSections.length 
    };
    
    customSections.push(newSection);
    
    // Add to sectionOrder with unique key
    const customKey = `custom_${newSection.id}`;
    if (!sectionOrder.right.includes(customKey)) {
        sectionOrder.right.push(customKey);
    }
    
    renderCustomSections();
    updatePreview();
    saveToLocalStorage();
}

function removeCustomSection(id) {
    if (!confirm('Delete this custom section?')) return;
    
    customSections = customSections.filter(c => c.id !== id);
    
    // Remove from sectionOrder
    const customKey = `custom_${id}`;
    sectionOrder.left = sectionOrder.left.filter(k => k !== customKey);
    sectionOrder.right = sectionOrder.right.filter(k => k !== customKey);
    
    renderCustomSections();
    updatePreview();
    saveToLocalStorage();
}

function addCustomItem(sectionId) {
    const section = customSections.find(s => s.id === sectionId);
    if (!section) {
        console.error('❌ Section not found:', sectionId);
        return;
    }
    
    if (!section.items) {
        section.items = [];
    }
    
    section.items.push({
        id: Date.now(),
        subtitle: '',
        startDate: '',
        endDate: '',
        description: '',
        placement: 'right'    
    });
    
    renderCustomSections();
    updatePreview();
    saveToLocalStorage();
    
    console.log('✅ Item added to section:', section.title);
}

function removeCustomItem(sectionId, itemId) {
    const section = customSections.find(s => s.id === sectionId);
    if (section) {
        section.items = section.items.filter(i => i.id !== itemId);
        renderCustomSections();
        updatePreview();
        saveToLocalStorage();
    }
}

function normalizeCustomSectionPlacement() {
    // Ensure "custom" key is at the end of each side in sectionOrder
    if (!sectionOrder.left.includes('custom')) {
        sectionOrder.left.push('custom');
    }
    if (!sectionOrder.right.includes('custom')) {
        sectionOrder.right.push('custom');
    }

    // Always keep 'custom' as the last section on both sides
    sectionOrder.left = sectionOrder.left.filter((v, i, a) => a.indexOf(v) === i && v !== '').filter(v => v !== 'custom');
    sectionOrder.left.push('custom');

    sectionOrder.right = sectionOrder.right.filter((v, i, a) => a.indexOf(v) === i && v !== '').filter(v => v !== 'custom');
    sectionOrder.right.push('custom');
}


function toggleCustomSectionPlacement(sectionId) {
    const section = customSections.find(s => s.id === sectionId);
    if (!section) return;

    const customKey = `custom_${sectionId}`;
    const oldPlacement = section.placement || 'right';
    const newPlacement = oldPlacement === 'left' ? 'right' : 'left';
    
    section.placement = newPlacement;
    
    // Remove from old side
    sectionOrder[oldPlacement] = sectionOrder[oldPlacement].filter(k => k !== customKey);
    
    // Add to new side
    sectionOrder[newPlacement].push(customKey);
    
    // Update child items
    if (Array.isArray(section.items)) {
        section.items.forEach(item => {
            item.placement = newPlacement;
        });
    }

    renderCustomSections();
    updatePreview();
    saveToLocalStorage();
}


function moveCustomSectionUp(sectionId) {
    const section = customSections.find(s => s.id === sectionId);
    if (!section) {
        console.error('❌ Section not found:', sectionId);
        return;
    }
    
    const customKey = `custom_${sectionId}`;
    const placement = section.placement || 'right';
    const targetArray = sectionOrder[placement];
    const index = targetArray.indexOf(customKey);
    
    console.log(`Moving up: ${customKey}, index=${index}`);
    
    if (index > 0) {
        [targetArray[index - 1], targetArray[index]] = [targetArray[index], targetArray[index - 1]];
        console.log('✅ Moved up successfully');
        renderCustomSections(); // Re-render to update button states
        updatePreview();
        saveToLocalStorage();
    } else {
        console.warn('⚠️ Cannot move up - already at top or not found');
    }
}

function moveCustomSectionDown(sectionId) {
    const section = customSections.find(s => s.id === sectionId);
    if (!section) {
        console.error('❌ Section not found:', sectionId);
        return;
    }
    
    const customKey = `custom_${sectionId}`;
    const placement = section.placement || 'right';
    const targetArray = sectionOrder[placement];
    const index = targetArray.indexOf(customKey);
    
    console.log(`Moving down: ${customKey}, index=${index}, length=${targetArray.length}`);
    
    if (index >= 0 && index < targetArray.length - 1) {
        [targetArray[index + 1], targetArray[index]] = [targetArray[index], targetArray[index + 1]];
        console.log('✅ Moved down successfully');
        renderCustomSections(); // Re-render to update button states
        updatePreview();
        saveToLocalStorage();
    } else {
        console.warn('⚠️ Cannot move down - already at bottom or not found');
    }
}

function moveCustomItemUp(sectionId, itemId) {
    const section = customSections.find(s => s.id === sectionId);
    if (!section || !section.items) return;
    
    const index = section.items.findIndex(i => i.id === itemId);
    if (index > 0) {
        [section.items[index - 1], section.items[index]] = [section.items[index], section.items[index - 1]];
        renderCustomSections();
        updatePreview();
        saveToLocalStorage();
    }
}

function moveCustomItemDown(sectionId, itemId) {
    const section = customSections.find(s => s.id === sectionId);
    if (!section || !section.items) return;
    
    const index = section.items.findIndex(i => i.id === itemId);
    if (index < section.items.length - 1 && index !== -1) {
        [section.items[index + 1], section.items[index]] = [section.items[index], section.items[index + 1]];
        renderCustomSections();
        updatePreview();
        saveToLocalStorage();
    }
}


function renderCustomSections() {
    const container = document.getElementById('customContainer');
    if (!container) return;
    
    if (customSections.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = customSections.map((section) => {
        const placement = section.placement || 'right';
        const customKey = `custom_${section.id}`;
        const targetArray = sectionOrder[placement];
        const currentIndex = targetArray.indexOf(customKey);
        
        // Check if can move up/down based on position in sectionOrder
        const canMoveUp = currentIndex > 0;
        const canMoveDown = currentIndex < targetArray.length - 1 && currentIndex !== -1;
        
        return `
        <div class="dynamic-item" style="border-left: 4px solid #6f42c1;">
            <div class="dynamic-item-header">
                <strong>${section.title || 'Custom Section'}</strong>
                <div style="display: flex; gap: 8px;">
                    <button class="order-btn" onclick="moveCustomSectionUp(${section.id})" ${!canMoveUp ? 'disabled' : ''} title="Move up">↑</button>
                    <button class="order-btn" onclick="moveCustomSectionDown(${section.id})" ${!canMoveDown ? 'disabled' : ''} title="Move down">↓</button>
                    <button class="toggle-btn" onclick="toggleCustomSectionPlacement(${section.id})" title="Move section left/right">
                        ${placement === 'left' ? '⇒' : '⇐'}
                    </button>
                    <button class="delete-btn" onclick="removeCustomSection(${section.id})">Delete Section</button>
                </div>
            </div>
            <div class="form-group">
                <label>Section Title:</label>
                <input type="text" value="${section.title || ''}" 
                    placeholder="e.g., Certifications, Publications, Awards"
                    onchange="customSections.find(s=>s.id===${section.id}).title=this.value; updatePreview(); saveToLocalStorage();">
            </div>
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 2px dashed #ddd;">
                <h4 style="margin-bottom: 10px; color: #666;">Items (${(section.items || []).length}):</h4>
                ${(section.items || []).map((item, itemIndex) => `
                    <div style="background: #f0f0f0; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 3px solid #6f42c1;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <strong>Item ${itemIndex + 1}</strong>
                            <div style="display: flex; gap: 8px;">
                                <button class="order-btn" onclick="moveCustomItemUp(${section.id}, ${item.id})" ${itemIndex === 0 ? 'disabled' : ''} title="Move up">↑</button>
                                <button class="order-btn" onclick="moveCustomItemDown(${section.id}, ${item.id})" ${itemIndex === section.items.length - 1 ? 'disabled' : ''} title="Move down">↓</button>
                                <button class="delete-btn" onclick="removeCustomItem(${section.id}, ${item.id})">Delete</button>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Subtitle/Name:</label>
                            <input type="text" value="${item.subtitle || ''}" 
                                placeholder="e.g., AWS Certified Solutions Architect"
                                onchange="customSections.find(s=>s.id===${section.id}).items.find(i=>i.id===${item.id}).subtitle=this.value; updatePreview(); saveToLocalStorage();">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Start Date:</label>
                                <input type="text" value="${item.startDate || ''}" 
                                    placeholder="e.g., Jan. 2023"
                                    onchange="customSections.find(s=>s.id===${section.id}).items.find(i=>i.id===${item.id}).startDate=this.value; updatePreview(); saveToLocalStorage();">
                            </div>
                            <div class="form-group">
                                <label>End Date:</label>
                                <input type="text" value="${item.endDate || ''}" 
                                    placeholder="e.g., Dec. 2023 or Present"
                                    onchange="customSections.find(s=>s.id===${section.id}).items.find(i=>i.id===${item.id}).endDate=this.value; updatePreview(); saveToLocalStorage();">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Description (one bullet per line):</label>
                            <textarea 
                                placeholder="• Detail one&#10;• Detail two"
                                onchange="customSections.find(s=>s.id===${section.id}).items.find(i=>i.id===${item.id}).description=this.value; updatePreview(); saveToLocalStorage();">${item.description || ''}</textarea>
                        </div>
                    </div>
                `).join('')}
                
                <button class="add-btn" style="background: #6f42c1; margin-top: 10px;" onclick="addCustomItem(${section.id})">
                    <i class="fas fa-plus"></i> Add Item
                </button>
            </div>
        </div>
    `;
    }).join('');
}

function cleanupSectionOrder() {
    // Remove legacy "custom" key
    sectionOrder.left = sectionOrder.left.filter(k => k !== 'custom');
    sectionOrder.right = sectionOrder.right.filter(k => k !== 'custom');
    
    // Remove custom keys that don't have corresponding sections
    const validCustomKeys = customSections.map(s => `custom_${s.id}`);
    sectionOrder.left = sectionOrder.left.filter(k => !k.startsWith('custom_') || validCustomKeys.includes(k));
    sectionOrder.right = sectionOrder.right.filter(k => !k.startsWith('custom_') || validCustomKeys.includes(k));
    
    console.log('🧹 Cleaned sectionOrder:', sectionOrder);
}

function addReference() {
    references.push({ 
        id: Date.now(), 
        name: '', 
        title: '', 
        phone: '', 
        email: '', 
        order: references.length 
    });
    renderReferences();
}

function removeReference(id) {
    references = references.filter(r => r.id !== id);
    renderReferences();
    updatePreview();
    saveToLocalStorage();
}

function moveReferenceUp(id) {
    const index = references.findIndex(s => s.id === id);
    if (index > 0) {
        [references[index - 1], references[index]] = [references[index], references[index - 1]];
        renderReferences();
        updatePreview();
        saveToLocalStorage();
    }
}

function moveReferenceDown(id) {
    const index = references.findIndex(s => s.id === id);
    if (index < references.length - 1 && index !== -1) {
        [references[index + 1], references[index]] = [references[index], references[index + 1]];
        renderReferences();
        updatePreview();
        saveToLocalStorage();
    }
}

function renderReferences() {
    const container = document.getElementById('referencesContainer');
    if (!container) return;
    
    container.innerHTML = references.map((ref, index) => `
        <div class="dynamic-item">
            <div class="dynamic-item-header">
                <strong>Reference ${index + 1}</strong>
                <button class="order-btn" onclick="moveReferenceUp(${ref.id})" ${index === 0 ? 'disabled' : ''} title="Move up">↑</button>
                <button class="order-btn" onclick="moveReferenceDown(${ref.id})" ${index === references.length - 1 ? 'disabled' : ''} title="Move down">↓</button>
                <button class="delete-btn" onclick="removeReference(${ref.id})">Delete</button>
            </div>
            <div class="form-group">
                <label>Name:</label>
                <input type="text" value="${ref.name}" 
                    placeholder="e.g., Dr. John Smith"
                    onchange="references.find(r=>r.id===${ref.id}).name=this.value; updatePreview(); saveToLocalStorage();">
            </div>
            <div class="form-group">
                <label>Title/Position:</label>
                <input type="text" value="${ref.title}" 
                    placeholder="e.g., Professor, Engineering Dept."
                    onchange="references.find(r=>r.id===${ref.id}).title=this.value; updatePreview(); saveToLocalStorage();">
            </div>
            <div class="form-group">
                <label>Phone:</label>
                <input type="tel" value="${ref.phone}" 
                    placeholder="+358 123456789"
                    onchange="references.find(r=>r.id===${ref.id}).phone=this.value; updatePreview(); saveToLocalStorage();">
            </div>
            <div class="form-group">
                <label>Email:</label>
                <input type="email" value="${ref.email}" 
                    placeholder="email@example.com"
                    onchange="references.find(r=>r.id===${ref.id}).email=this.value; updatePreview(); saveToLocalStorage();">
            </div>
        </div>
    `).join('');
}

// ==================== RESUME MANAGER ====================
const ResumeManager = {
    sectionPositionMemory: {},

    resetSectionPositions() {
        if (!confirm("Reset all sections to their default positions? (Content will be preserved)")) return;
        
        sectionOrder = {
            left: ["contact", "skills", "languages", "references"],
            right: ["summary", "experience", "education"]
        };
        
        // Re-add custom sections
        customSections.forEach(section => {
            const customKey = `custom_${section.id}`;
            const placement = section.placement || 'right';
            if (!sectionOrder[placement].includes(customKey)) {
                sectionOrder[placement].push(customKey);
            }
        });
        
        this.sectionPositionMemory = {};
        updatePreview();
        updateAllToggleButtons();
        saveToLocalStorage();
        alert("Section positions reset to default!");
    },

    flipColumns() {
        const leftWidth = document.getElementById('leftWidth').value;
        const rightWidth = document.getElementById('rightWidth').value;
        document.getElementById('leftWidth').value = rightWidth;
        document.getElementById('rightWidth').value = leftWidth;
        
        const temp = sectionOrder.left;
        sectionOrder.left = sectionOrder.right;
        sectionOrder.right = temp;
        
        // Update custom section placements
        customSections.forEach(section => {
            section.placement = section.placement === 'left' ? 'right' : 'left';
        });
        
        this.sectionPositionMemory = {};
        
        const resumePreview = document.querySelector('.resume-preview');
        if (resumePreview.style.flexDirection === 'row-reverse') {
            resumePreview.style.flexDirection = 'row';
        } else {
            resumePreview.style.flexDirection = 'row-reverse';
        }
        
        updatePreview();
        updateAllToggleButtons();
        saveToLocalStorage();
    },
    
    toggleColumnVisibility(column) {
        const leftCol = document.getElementById('leftColumn');
        const rightCol = document.getElementById('rightColumn');
        
        if (column === 'left') {
            if (leftCol.style.display === 'none') {
                leftCol.style.display = 'block';
                document.documentElement.style.setProperty('--left-width', document.getElementById('leftWidth').value + '%');
                document.documentElement.style.setProperty('--right-width', document.getElementById('rightWidth').value + '%');
            } else {
                leftCol.style.display = 'none';
                document.documentElement.style.setProperty('--left-width', '0%');
                document.documentElement.style.setProperty('--right-width', '100%');
            }
        } else if (column === 'right') {
            if (rightCol.style.display === 'none') {
                rightCol.style.display = 'flex';
                document.documentElement.style.setProperty('--left-width', document.getElementById('leftWidth').value + '%');
                document.documentElement.style.setProperty('--right-width', document.getElementById('rightWidth').value + '%');
            } else {
                rightCol.style.display = 'none';
                document.documentElement.style.setProperty('--left-width', '100%');
                document.documentElement.style.setProperty('--right-width', '0%');
            }
        }
        
        updatePreview();
        saveToLocalStorage();
    },
    
    toggleSectionPlacement(sectionKey) {
        // Handle custom sections separately
        if (sectionKey.startsWith('custom_')) {
            const sectionId = parseInt(sectionKey.replace('custom_', ''));
            toggleCustomSectionPlacement(sectionId);
            return;
        }
        
        const currentSide = this.getSectionPlacement(sectionKey);
        const newSide = currentSide === "left" ? "right" : "left";
        const currentArray = sectionOrder[currentSide];
        const currentIndex = currentArray.indexOf(sectionKey);
        
        if (!this.sectionPositionMemory[sectionKey]) {
            this.sectionPositionMemory[sectionKey] = {};
        }
        this.sectionPositionMemory[sectionKey][currentSide] = currentIndex;
        
        sectionOrder[currentSide] = sectionOrder[currentSide].filter(s => s !== sectionKey);
        
        const rememberedIndex = this.sectionPositionMemory[sectionKey]?.[newSide];
        
        if (rememberedIndex !== undefined && rememberedIndex <= sectionOrder[newSide].length) {
            sectionOrder[newSide].splice(rememberedIndex, 0, sectionKey);
        } else {
            sectionOrder[newSide].push(sectionKey);
        }
        
        updatePreview();
        this.updateToggleButton(sectionKey, newSide);
        saveToLocalStorage();
    },

    getSectionPlacement(sectionKey) {
        if (sectionOrder.left.includes(sectionKey)) return "left";
        if (sectionOrder.right.includes(sectionKey)) return "right";
        return "left";
    },

    updateToggleButton(sectionKey, newSide) {
        const btn = document.getElementById(sectionKey + "Toggle");
        if (btn) {
            btn.innerText = newSide === "left" ? "⇒" : "⇐";
            btn.title = `Now in ${newSide.toUpperCase()} column`;
        }
    },

    reorderSection(sectionKey, direction) {
        // Handle custom sections separately
        if (sectionKey.startsWith('custom_')) {
            const sectionId = parseInt(sectionKey.replace('custom_', ''));
            if (direction === 'up') {
                moveCustomSectionUp(sectionId);
            } else {
                moveCustomSectionDown(sectionId);
            }
            return;
        }
        
        const currentSide = this.getSectionPlacement(sectionKey);
        const targetArray = sectionOrder[currentSide];
        const index = targetArray.indexOf(sectionKey);

        if (index === -1) return;

        if (direction === 'up' && index > 0) {
            [targetArray[index - 1], targetArray[index]] = [targetArray[index], targetArray[index - 1]];
        } else if (direction === 'down' && index < targetArray.length - 1) {
            [targetArray[index + 1], targetArray[index]] = [targetArray[index], targetArray[index + 1]];
        }

        updatePreview();
        saveToLocalStorage();
    }
};

function updateAllToggleButtons() {
    // Update standard sections
    ['contact', 'summary', 'skills', 'languages', 'experience', 'education', 'references'].forEach(key => {
        const side = ResumeManager.getSectionPlacement(key);
        ResumeManager.updateToggleButton(key, side);
    });
    
    // Update custom sections
    customSections.forEach(section => {
        const customKey = `custom_${section.id}`;
        const side = ResumeManager.getSectionPlacement(customKey);
        ResumeManager.updateToggleButton(customKey, side);
    });
}
// ==================== PROFILE PICTURE MANAGER ====================
const ProfilePicManager = {
    placement: 'left', // 'left', 'right', or 'none'
    
    moveLeft() {
        this.placement = 'left';
        this.updateStatus();
        updatePreview();
        saveToLocalStorage();
    },
    
    moveRight() {
        this.placement = 'right';
        this.updateStatus();
        updatePreview();
        saveToLocalStorage();
    },
    
    remove() {
        if (!profilePicData) {
            alert('No profile picture to remove');
            return;
        }
        if (confirm('Remove profile picture? You can add it back by uploading a new one.')) {
            profilePicData = null;
            const input = document.getElementById('profilePic');
            if (input) input.value = '';
            this.updateStatus();
            updatePreview();
            saveToLocalStorage();
        }
    },
    
    updateStatus() {
        const statusDiv = document.getElementById('profilePicStatus');
        if (!statusDiv) return;
        
        if (!profilePicData) {
            statusDiv.innerHTML = '<i class="fas fa-info-circle"></i> No profile picture uploaded';
            statusDiv.style.color = '#666';
        } else {
            const placements = {
                'left': '<i class="fas fa-check-circle" style="color: #28a745;"></i> Picture in left column',
                'right': '<i class="fas fa-check-circle" style="color: #28a745;"></i> Picture in right header',
                'none': '<i class="fas fa-eye-slash"></i> Picture hidden'
            };
            statusDiv.innerHTML = placements[this.placement] || '';
        }
    }
};

// ==================== PREVIEW UPDATE ====================
function updatePreview() {
    collectAllData();

    // ... (keep existing color/font code) ...

    const mainColor = formData.mainColor;
    const gradientColor = formData.gradientColor;
    const rightBgColor = formData.rightBgColor;
    const rightContentColor = formData.rightContentColor;
    const useGradient = formData.useGradient;
    const fontFamily = formData.fontFamily;
    const fontSize = formData.fontSize;
    const bulletStyle = formData.bulletStyle;
    const leftWidth = formData.leftWidth;
    const rightWidth = formData.rightWidth;
    const rightHeaderPadding = formData.rightHeaderPadding;
    const rightBodyPadding = formData.rightBodyPadding;

    document.documentElement.style.setProperty('--main-color', mainColor);
    document.documentElement.style.setProperty('--gradient-color', gradientColor);
    document.documentElement.style.setProperty('--right-bg-color', rightBgColor);
    document.documentElement.style.setProperty('--right-content-color', rightContentColor);
    document.documentElement.style.setProperty('--font-family', fontFamily);
    document.documentElement.style.setProperty('--font-size', fontSize + 'px');
    document.documentElement.style.setProperty('--left-width', leftWidth + '%');
    document.documentElement.style.setProperty('--right-width', rightWidth + '%');
    document.documentElement.style.setProperty('--right-header-padding', rightHeaderPadding + 'px');
    document.documentElement.style.setProperty('--right-body-padding', rightBodyPadding + 'px');

    const leftCol = document.getElementById('leftColumn');
    if (leftCol) {
        if (useGradient) leftCol.classList.add('gradient');
        else leftCol.classList.remove('gradient');
    }

    const fnEl = document.getElementById('previewFirstName');
    const lnEl = document.getElementById('previewLastName');
    const jtEl = document.getElementById('previewJobTitle');

    if (fnEl) fnEl.textContent = formData.firstName;
    if (lnEl) lnEl.textContent = formData.lastName;
    if (jtEl) jtEl.textContent = formData.jobTitle;

   const picDiv = document.getElementById('previewProfilePic');
   if (picDiv) {
       // Handle left column placement
       if (ProfilePicManager.placement === 'left' && profilePicData) {
           picDiv.style.display = 'flex';
           picDiv.innerHTML = `<img src="${profilePicData}" alt="Profile">`;
       } else if (ProfilePicManager.placement === 'left' && !profilePicData) {
           picDiv.style.display = 'flex';
           const initials = (formData.firstName ? formData.firstName[0] : '') + (formData.lastName ? formData.lastName[0] : '');
           picDiv.textContent = initials || '👤';
       } else {
           // Hide in left column if placement is 'right' or 'none'
           picDiv.style.display = 'none';
       }
       
       // Handle right header placement
       const rightHeader = document.querySelector('.right-header');
       let rightPicDiv = document.getElementById('rightProfilePic');
       
       if (ProfilePicManager.placement === 'right' && profilePicData && rightHeader) {
           if (!rightPicDiv) {
               rightPicDiv = document.createElement('div');
               rightPicDiv.id = 'rightProfilePic';
               rightPicDiv.style.cssText = `
                   width: 120px;
                   height: 120px;
                   border-radius: 50%;
                   overflow: hidden;
                   border: 3px solid var(--main-color, #008c8c);
                   margin-bottom: 10px;
                   box-shadow: 0 2px 8px rgba(0,0,0,0.1);
               `;
               rightHeader.insertBefore(rightPicDiv, rightHeader.firstChild);
           }
           rightPicDiv.innerHTML = `<img src="${profilePicData}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">`;
           rightPicDiv.style.display = 'block';
       } else if (rightPicDiv) {
           rightPicDiv.style.display = 'none';
       }
   }
   
    // ✅Show DOB/Nationality below profile pic when contact is in right column
      const isContactInLeft = sectionOrder.left.includes('contact');
      const dob = formData.dob;
      const nationality = formData.nationality;
      
      let dobNationalityDiv = document.getElementById('dobNationalityDisplay');
      if (!dobNationalityDiv && picDiv) {
          dobNationalityDiv = document.createElement('div');
          dobNationalityDiv.id = 'dobNationalityDisplay';
          picDiv.parentNode.insertBefore(dobNationalityDiv, picDiv.nextSibling);
      }
      
      if (dobNationalityDiv) {
          if (isContactInLeft && (dob || nationality)) {
              dobNationalityDiv.innerHTML = `
                  <div style="text-align: center; margin: 15px 0 20px 0; font-size: calc(var(--font-size, 11px)); 
                              color: rgba(255,255,255,0.9); line-height: 1.4;">
                      ${dob && nationality ? `${dob} | ${nationality}` : (dob || nationality)}
                  </div>
              `;
              dobNationalityDiv.style.display = 'block';
          } else {
              dobNationalityDiv.style.display = 'none';
          }
      }
    if (typeof updateDocumentTitle === "function") updateDocumentTitle();

    // Build sections object
    const sections = {
        contact: generateContactHTML(),
        skills: generateSkillsHTML(bulletStyle),
        languages: generateLanguagesHTML(bulletStyle),
        references: generateReferencesHTML(),
        summary: generateSummaryHTML(),
        experience: generateExperienceHTML(bulletStyle),
        education: generateEducationHTML()
    };

    // Add individual custom sections with position info
    customSections.forEach(section => {
        const customKey = `custom_${section.id}`;
        const placement = section.placement || 'right';
        
        // Check if it's the last in its column
        const columnOrder = sectionOrder[placement];
        const isLast = columnOrder[columnOrder.length - 1] === customKey;
        
        sections[customKey] = generateSingleCustomHTML(section, bulletStyle, { isLast });
    });

    let leftContent = '';
    let rightContent = '';
    let rightHeaderContact = '';

    // Process left column
   sectionOrder.left.forEach((key, index) => {
       if (sections[key]) {
           leftContent += sections[key];
       }
   });

    // Process right column
    sectionOrder.right.forEach((key, index) => {
        if (sections[key]) {
            if (key === 'contact' && index === 0) {
                rightHeaderContact = sections[key];
            } else {
                rightContent += sections[key];
            }
        }
    });

    const leftColContent = document.getElementById('leftColumnContent');
    const rightColContent = document.getElementById('rightColumnContent');
    const rightHeader = document.querySelector('.right-header');

    if (leftColContent) leftColContent.innerHTML = leftContent;
    if (rightColContent) {
        rightColContent.innerHTML = rightContent ? `<div class="right-content-box">${rightContent}</div>` : '';
    }

    if (rightHeader && rightHeaderContact) {
        const existingContact = rightHeader.querySelector('.header-contact');
        if (existingContact) existingContact.remove();
        rightHeader.insertAdjacentHTML('beforeend', `<div class="header-contact">${rightHeaderContact}</div>`);
    } else if (rightHeader) {
        const existingContact = rightHeader.querySelector('.header-contact');
        if (existingContact) existingContact.remove();
    }
}

function generateSingleCustomHTML(section, bullet, position = {}) {
    if (!section || !section.title) return '';
    
    const items = Array.isArray(section.items) ? section.items : [];
    
    const itemsHTML = items.map(item => {
        const rawSubtitle = (item.subtitle || '').trim();
        const description = (item.description || '').trim();
        const lines = description.length ? description.split('\n').map(l => l.trim()).filter(l => l.length > 0) : [];

        let subtitle = rawSubtitle || '';
        let bulletLines = lines.slice();
        
        //if (!subtitle && bulletLines.length > 0) {
          //  if (bulletLines.length > 1) {
            //    subtitle = bulletLines.shift();
            //} else {
              //  subtitle = bulletLines.shift();
               // bulletLines = [];
            // }
        //}

        const bulletsHTML = bulletLines.length
            ? `<ul class="custom-bullets" style="--bullet: '${bullet || "•"}';">
                    ${bulletLines.map(line => `<li>${line}</li>`).join('')}
               </ul>`
            : '';

        const dates = [(item.startDate || '').trim(), (item.endDate || '').trim()].filter(Boolean).join(' - ');

        return `
            <div class="custom-item">
                <div class="custom-item-header">
                    ${subtitle ? `<span class="custom-subtitle">${subtitle}</span>` : ''}
                    ${dates ? `<span class="custom-dates">${dates}</span>` : ''}
                </div>
                ${bulletsHTML || (description && !bulletsHTML ? `<div class="custom-desc">${description}</div>` : '')}
            </div>
        `;
    }).join('');

    // ✅ FIX: Adjust spacing based on position
    const isLast = position.isLast || false;
    const marginBottom = isLast ? '0' : '20px';
    
    return itemsHTML || section.title 
        ? `<div style="margin-top: 20px; margin-bottom: ${marginBottom};">
               <div class="section-title">${section.title.toUpperCase()}</div>
               <div>${itemsHTML}</div>
           </div>`
        : '';
}

// ✅ Optional: auto-update title while typing name
document.addEventListener("DOMContentLoaded", () => {
    const fn = document.getElementById("firstName");
    const ln = document.getElementById("lastName");
    if (fn) fn.addEventListener("input", updateDocumentTitle);
    if (ln) ln.addEventListener("input", updateDocumentTitle);
});



// ==================== HTML GENERATION ====================
function generateHeadingSelector(sectionKey, currentValue) {
    const variants = SECTION_HEADING_VARIANTS[sectionKey];
    if (!variants) return '';
    
    const fieldName = `${sectionKey}Heading`;
    
    return `
        <div class="form-group">
            <label>Section Heading:</label>
            <select id="${fieldName}" onchange="updateHeading('${sectionKey}', this.value);">
                ${variants.map(variant => {
                    const displayText = variant === 'auto' ? 'Auto (Based on Type)' : variant;
                    const selected = variant === currentValue ? 'selected' : '';
                    return `<option value="${variant}" ${selected}>${displayText}</option>`;
                }).join('')}
            </select>
        </div>
    `;
}

function updateHeading(sectionKey, value) {
    const fieldName = `${sectionKey}Heading`;  // e.g., "contactHeading"
    formData[fieldName] = value;                // SAVES the new value to formData
    updatePreview();                            // Updates the preview
    saveToLocalStorage();                       // Persists to storage
}

function generateContactHTML() {
    const phone = formData.phone;
    const email = formData.email;
    const linkedin = formData.linkedin;
    const location = formData.location;
    const dob = formData.dob;
    const nationality = formData.nationality;
    const heading = formData.contactHeading || 'CONTACT';
                    
    if (!phone && !email && !linkedin && !location && !dob && !nationality) return '';
    
    const isInRightColumn = sectionOrder.right.includes('contact');
    const isFirstInRight = isInRightColumn && sectionOrder.right[0] === 'contact';
    
    // ✅ When in left column - show as regular section
    if (!isInRightColumn) {
        return `
            <div class="section-title">${heading}</div>
            <div>
                ${phone ? `<div class="contact-item"><i class="fas fa-phone"></i> ${phone}</div>` : ''}
                ${email ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${email}</div>` : ''}
                ${linkedin ? `<div class="contact-item"><i class="fab fa-linkedin"></i> ${linkedin}</div>` : ''}
                ${location ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${location}</div>` : ''}
            </div>
        `;
    }
    
    // ✅ When first in right column - show in header with DOB and Nationality in second row
    if (isFirstInRight) {
       return `
           <div style="margin-top: 8px; font-size: 12px; line-height: 1.4;">
               <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 5px;">
                   ${phone ? `<span><i class="fas fa-phone"></i> ${phone}</span>` : ''}
                   ${email ? `<span><i class="fas fa-envelope"></i> ${email}</span>` : ''}
                   ${location ? `<span><i class="fas fa-map-marker-alt"></i> ${location}</span>` : ''}
               </div>
               ${(dob || nationality || linkedin) ? `
               <div style="display: flex; flex-wrap: wrap; gap: 15px;">
                   ${dob ? `<span><i class="fas fa-birthday-cake"></i> ${dob}</span>` : ''}
                   ${nationality ? `<span><i class="fas fa-flag"></i> ${nationality}</span>` : ''}
                   ${linkedin ? `<span><i class="fab fa-linkedin"></i> ${linkedin}</span>` : ''}
               </div>
               ` : ''}
           </div>
       `;
   }
    
    // ✅ When in right column but NOT first - show as regular section in content box
    return `
        <div class="section-title">${heading}</div>
        <div>
            ${phone ? `<div class="contact-item"><i class="fas fa-phone"></i> ${phone}</div>` : ''}
            ${email ? `<div class="contact-item"><i class="fas fa-envelope"></i> ${email}</div>` : ''}
            ${linkedin ? `<div class="contact-item"><i class="fab fa-linkedin"></i> ${linkedin}</div>` : ''}
            ${location ? `<div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${location}</div>` : ''}
        </div>
    `;
}
function generateSummaryHTML() {
    const summary = formData.summary;
    const aboutType = formData.aboutType;
    const customHeading = formData.summaryHeading;
    
    if (!summary) return '';
    
    let title;
    
    if (customHeading === 'auto' || !customHeading) {
        const autoTitles = {
            'about': 'ABOUT ME',
            'summary': 'PROFESSIONAL PROFILE',
            'objective': 'CAREER OBJECTIVE'
        };
        title = autoTitles[aboutType] || 'PROFESSIONAL PROFILE';
    } else {
        title = customHeading;
    }
    
    return `
        <div class="section-title">${title}</div>
        <div class="section-text">${summary}</div>
    `;
}

function generateSkillsHTML(bullet) {
    if (skills.length === 0) return '';

    const heading = formData.skillsHeading || 'TECHNICAL SKILLS';

    const content = skills.map(skill => {
        if (!skill.category && !skill.items) return '';
        return `
            <div class="skill-item">
                ${skill.category ? `<div class="skill-category">${skill.category}</div>` : ''}
                ${skill.items ? `<div class="skill-list">${skill.items}</div>` : ''}
            </div>
        `;
    }).join('');

    return content ? `<div class="section-title">${heading}</div><div>${content}</div>` : '';
}

function generateLanguagesHTML(bullet) {
    if (languages.length === 0) return '';
    
    const heading = formData.languagesHeading || 'LANGUAGES';
    const isInRightColumn = sectionOrder.right.includes('languages');
    
    if (isInRightColumn) {
        const maxColumnsPerRow = 4;
        const totalLangs = languages.length;
        const columnsPerRow = totalLangs <= maxColumnsPerRow ? totalLangs : maxColumnsPerRow;
        const columnWidth = 100 / columnsPerRow;
        
        const rows = [];
        
        for (let i = 0; i < totalLangs; i += columnsPerRow) {
            const rowLangs = languages.slice(i, i + columnsPerRow);
            const rowHTML = rowLangs.map((lang, index) => {
                if (!lang.name) return '';
                const isLast = index === rowLangs.length - 1;
                return `
                    <td class="lang-cell" style="padding: 8px 12px; text-align: left; ${!isLast ? 'border-right: 1px solid rgba(0,140,140,0.15);' : ''} vertical-align: top; width: ${columnWidth}%;">
                        <div style="display: flex; align-items: baseline; gap: 8px;">
                            <span class="lang-bullet">◆</span>
                            <div>
                                <strong class="lang-name">${lang.name}</strong>
                                ${lang.level ? `<div class="lang-level">${lang.level}</div>` : ''}
                            </div>
                        </div>
                    </td>
                `;
            }).join('');
            
            rows.push(`<tr>${rowHTML}</tr>`);
        }
        
        return `
            <div class="section-title">${heading}</div>
            <table style="width: 100%; border-collapse: collapse; margin-top: 8px; table-layout: fixed; background: transparent;">
                ${rows.join('')}
            </table>
        `;
        
    } else {
        const content = languages.map(lang => 
            lang.name ? `<div class="lang-item">${lang.name}${lang.level ? ` - ${lang.level}` : ''}</div>` : ''
        ).join('');

        return content ? `<div class="section-title">${heading}</div><div>${content}</div>` : '';
    }
}

function generateExperienceHTML(bullet) {
    if (experiences.length === 0) return '';

    const heading = formData.experienceHeading || 'PROFESSIONAL EXPERIENCE';

    const content = experiences.map(exp => {
        if (!exp.company && !exp.position && !exp.description) return '';

        const bulletLines = (exp.description || '')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        const bulletsHTML = bulletLines.length
            ? `<ul class="exp-bullets" style="--bullet: '${bullet || "•"}';">
                ${bulletLines.map(line => `<li>${line}</li>`).join('')}
               </ul>`
            : '';

        return `
            <div class="experience-item">
                <div class="experience-header">
                    <span class="experience-position">${exp.position || ''}</span>
                    <span class="experience-dates">${exp.startDate || ''}${exp.endDate ? ' - ' + exp.endDate : ''}</span>
                </div>
                <div class="experience-company">${exp.company || ''}${exp.location ? ', ' + exp.location : ''}</div>
                ${bulletsHTML}
            </div>
        `;
    }).join('');

    return content ? `<div class="section-title">${heading}</div><div>${content}</div>` : '';
}

function generateEducationHTML() {
    if (education.length === 0) return '';

    const heading = formData.educationHeading || 'EDUCATION';

    const content = education.map(edu => {
        if (!edu.school && !edu.degree) return '';
        
        const specialization = (edu.specialization || '').trim();
        const coursework = (edu.coursework || '').trim();
        const thesis = (edu.thesis || '').trim();
        const thesisLink = (edu.thesisLink || '').trim();
        
        // Build optional sections only if content exists
        let additionalContent = '';
        
        if (specialization) {
            additionalContent += `<div style="margin-top: 4px; font-style: italic; font-size: calc(var(--font-size, 11px) - 0.5px);"><strong>Specialization:</strong> ${specialization}</div>`;
        }
        
        if (coursework) {
            additionalContent += `<div style="margin-top: 4px; font-size: calc(var(--font-size, 11px) - 0.5px);"><strong>Relevant Coursework:</strong> ${coursework}</div>`;
        }
        
        if (thesis) {
            let thesisHTML = `<div style="margin-top: 4px; font-size: calc(var(--font-size, 11px) - 0.5px);"><strong>Thesis:</strong> <em>"${thesis}"</em>`;
            if (thesisLink) {
                thesisHTML += ` <a href="${thesisLink}" target="_blank" style="color: var(--main-color, #008c8c); text-decoration: none;">🔗 View</a>`;
            }
            thesisHTML += `</div>`;
            additionalContent += thesisHTML;
        }
        
        return `
            <div class="education-item">
                <div class="education-header">
                    <span class="education-degree">${edu.degree || ''}</span>
                    <span class="education-dates">${edu.startDate || ''}${edu.endDate ? ' - ' + edu.endDate : ''}</span>
                </div>
                <div class="education-school">${edu.school || ''}${edu.location ? ', ' + edu.location : ''}</div>
                ${additionalContent}
            </div>
        `;
    }).join('');

    return content ? `<div class="section-title">${heading}</div><div>${content}</div>` : '';
}
function generateReferencesHTML() {
    if (references.length === 0) return '';
    
    const heading = formData.referencesHeading || 'REFERENCES';
    const isInRightColumn = sectionOrder.right.includes('references');
    
    if (isInRightColumn) {
        const refsHTML = references.map(ref => {
            if (!ref.name) return '';
            return `
                <div style="padding: 8px; background: rgba(0,140,140,0.05); border-radius: 5px; border-left: 3px solid var(--main-color, #008c8c);">
                    <strong style="display: block; margin-bottom: 4px; color: var(--main-color, #008c8c); font-size: calc(var(--font-size, 11px));">${ref.name}</strong>
                    ${ref.title ? `<div style="margin-bottom: 3px; font-size: calc(var(--font-size, 11px) - 1px);">${ref.title}</div>` : ''}
                    ${ref.phone ? `<div style="margin-bottom: 2px; font-size: calc(var(--font-size, 11px) - 1px);"><i class="fas fa-phone" style="width: 14px;"></i> ${ref.phone}</div>` : ''}
                    ${ref.email ? `<div style="font-size: calc(var(--font-size, 11px) - 1px);"><i class="fas fa-envelope" style="width: 14px;"></i> ${ref.email}</div>` : ''}
                </div>
            `;
        }).join('');
        
        return `
            <div class="section-title">${heading}</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px;">
                ${refsHTML}
            </div>
        `;
        
    } else {
        const content = references.map(ref => {
            if (!ref.name) return '';
            return `
                <div style="margin: 12px 0; font-size: calc(var(--font-size, 11px)); line-height: 1.5;">
                    <strong style="display: block; margin-bottom: 3px;">${ref.name}</strong>
                    ${ref.title ? `<div>${ref.title}</div>` : ''}
                    ${ref.phone ? `<div><i class="fas fa-phone"></i> ${ref.phone}</div>` : ''}
                    ${ref.email ? `<div><i class="fas fa-envelope"></i> ${ref.email}</div>` : ''}
                </div>
            `;
        }).join('');

        return content ? `<div class="section-title">${heading}</div><div>${content}</div>` : '';
    }
}



// ==================== COVER LETTER PREVIEW ====================
function updateCoverLetterPreview() {
    collectAllData();
    
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const clNameDisplay = document.getElementById('clNameDisplay');
    const clTitleDisplay = document.getElementById('clTitleDisplay');
    const clDateDisplay = document.getElementById('clDateDisplay');
    const clBodyDisplay = document.getElementById('clBodyDisplay');
    const clBottomAddress = document.getElementById('clBottomAddress');
    const clBottomPhone = document.getElementById('clBottomPhone');
    const clBottomEmail = document.getElementById('clBottomEmail');
    const clBottomLinkedIn = document.getElementById('clBottomLinkedIn');

    if (clNameDisplay) clNameDisplay.innerText = `${formData.firstName} ${formData.lastName}`.trim();
    if (clTitleDisplay) clTitleDisplay.innerText = formData.jobTitle;
    if (clDateDisplay) clDateDisplay.innerText = dateString;
    
    if (clBodyDisplay) {
        clBodyDisplay.innerHTML = coverLetterBody
            .split('\n')
            .filter(p => p.trim())
            .map(p => `<p style="font-size:14px; line-height:1.5; margin-bottom:15px;">${p}</p>`)
            .join('');
    }

    // ✅ Dynamic contact info - only show if data exists
    if (clBottomAddress) {
        clBottomAddress.style.display = formData.location ? 'block' : 'none';
        clBottomAddress.innerHTML = `<span>Address:</span> ${formData.location || ''}`;
    }
    
    if (clBottomPhone) {
        clBottomPhone.style.display = formData.phone ? 'block' : 'none';
        clBottomPhone.innerHTML = `<span>Mobile:</span> ${formData.phone || ''}`;
    }
    
    if (clBottomEmail) {
        clBottomEmail.style.display = formData.email ? 'block' : 'none';
        clBottomEmail.innerHTML = `<span>Email:</span> ${formData.email || ''}`;
    }
    
    if (clBottomLinkedIn) {
        clBottomLinkedIn.style.display = formData.linkedin ? 'block' : 'none';
        clBottomLinkedIn.innerHTML = `<span>LinkedIn:</span> ${formData.linkedin || ''}`;
    }

    const clTopStrip = document.getElementById('clTopStrip');
    const clBottomStrip = document.getElementById('clBottomStrip');
    
    if (clTopStrip) {
        if (formData.useGradient) clTopStrip.classList.add('gradient');
        else clTopStrip.classList.remove('gradient');
    }
    
    if (clBottomStrip) {
        if (formData.useGradient) clBottomStrip.classList.add('gradient');
        else clBottomStrip.classList.remove('gradient');
    }
}

// ==================== FILE OPERATIONS ====================
function saveData() {
    const data = collectAllData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert('Data saved successfully!');
}

function loadData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                
                if (data.version) {
                    restoreAllData(data);
                } else {
                    const converted = {
                        version: '1.0',
                        formData: {
                            firstName: data.firstName || data.personalInfo?.name?.first || '',
                            lastName: data.lastName || data.personalInfo?.name?.last || '',
                            jobTitle: data.jobTitle || data.personalInfo?.jobTitle || '',
                            phone: data.phone || data.personalInfo?.contact?.phone || '',
                            email: data.email || data.personalInfo?.contact?.email || '',
                            linkedin: data.linkedin || data.personalInfo?.contact?.linkedin || '',
                            location: data.location || data.personalInfo?.contact?.location || '',
                            summary: data.summary || data.summarySection?.text || '',
                            aboutType: data.aboutType || data.summarySection?.type || 'summary',
                            mainColor: data.mainColor || data.design?.theme?.mainColor || '#008c8c',
                            gradientColor: data.gradientColor || data.design?.theme?.gradientColor || '#8c8c00',
                            rightBgColor: data.rightBgColor || data.design?.theme?.rightBgColor || '#e6ebf0',
                            rightContentColor: data.rightContentColor || data.design?.theme?.rightContentColor || '#ffffff',
                            useGradient: data.useGradient !== undefined ? data.useGradient : (data.design?.theme?.useGradient !== false),
                            fontFamily: data.fontFamily || data.design?.typography?.fontFamily || "'Segoe UI', sans-serif",
                            fontSize: data.fontSize || data.design?.typography?.fontSize || '11',
                            bulletStyle: data.bulletStyle || data.design?.typography?.bulletStyle || '•',
                            leftWidth: data.leftWidth || data.design?.layout?.leftWidth || '35',
                            rightWidth: data.rightWidth || data.design?.layout?.rightWidth || '65',
                            rightHeaderPadding: data.rightHeaderPadding || data.design?.layout?.rightHeaderPadding || '15',
                            rightBodyPadding: data.rightBodyPadding || data.design?.layout?.rightBodyPadding || '17'
                        },
                        profilePicData: data.profilePic || data.profilePicData || data.personalInfo?.profilePicData || null,
                        coverLetterBody: data.clBody || data.coverLetterBody || '',
                        skills: data.skills || data.sections?.skills || [],
                        languages: data.languages || data.sections?.languages || [],
                        experiences: data.experience || data.experiences || data.sections?.experiences || [],
                        education: data.education || data.sections?.education || [],
                        customSections: data.customSections || data.sections?.customSections || [],
                        references: data.references || data.sections?.references || [],
                        sectionOrder: data.sectionOrder || data.layoutSettings?.sectionOrder || {
                            left: ["contact", "skills", "languages", "references"],
                            right: ["summary", "experience", "education", "custom"]
                        },
                        currentDocType: data.currentDocType || 'resume'
                    };
                    
                    restoreAllData(converted);
                }

                // ✅ Ensure "contact" and "summary" always exist in sectionOrder
                if (!sectionOrder.left.includes("contact") && !sectionOrder.right.includes("contact")) {
                    sectionOrder.left.unshift("contact");
                }
                if (!sectionOrder.left.includes("summary") && !sectionOrder.right.includes("summary")) {
                    sectionOrder.right.unshift("summary");
                }

                // ✅ Force document title to sync with loaded name
                if (typeof updateDocumentTitle === "function") updateDocumentTitle();

                // ✅ Re-render all sections cleanly
                renderSkills();
                renderLanguages();
                renderExperiences();
                renderEducation();
                renderCustomSections();
                renderReferences();

                // ✅ Full resume + cover letter preview refresh
                updatePreview();
                updateCoverLetterPreview();

                // ✅ Make sure toggle buttons (⇄, ↑↓) reflect new layout
                updateAllToggleButtons();

                // ✅ Persist in local storage
                saveToLocalStorage();

                alert('Resume data loaded successfully!');

            } catch (err) {
                alert('Failed to load file: ' + err.message);
                console.error('Load error:', err);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}
// ==================== EXPORT FUNCTIONS ====================
function printDocument() {
    const resumePreview = document.getElementById('resumePreview');
    const coverLetterPreview = document.getElementById('coverLetterPreview');

    // ---------- Filename logic (with date) ----------
    const firstName = (formData.firstName || '').trim() || 'FirstName';
    const lastName  = (formData.lastName || '').trim() || 'LastName';
    const jobTitleRaw = (formData.jobTitle || '').trim() || 'JobTitle';
    const jobTitle = jobTitleRaw.replace(/[<>:"/\\|?*]+/g, '').replace(/\s+/g, ' ').trim();

    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    const docLabel = currentDocType === 'resume' ? 'Resume' : 'Cover letter';

    // ✅ Add current date (YYYY-MM-DD)
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    let fileName = `${docLabel}_${fullName}${jobTitle ? '_' + jobTitle : ''}_${dateStr}`;
    fileName = fileName.replace(/[<>:"/\\|?*]+/g, '').replace(/\s+/g, ' ').trim();

    // ---------- Keep your original print logic ----------
    const originalTitle = document.title;
    const titleElement = document.querySelector('title');
    const originalTitleText = titleElement ? titleElement.textContent : originalTitle;

    // Update both document.title and the <title> element
    document.title = fileName;
    if (titleElement) {
        titleElement.textContent = fileName;
    } else {
        const newTitle = document.createElement('title');
        newTitle.textContent = fileName;
        document.head.appendChild(newTitle);
    }

    if (currentDocType === 'resume') {
        if (coverLetterPreview) coverLetterPreview.style.display = 'none';
        if (resumePreview) resumePreview.style.display = 'flex';
    } else {
        if (resumePreview) resumePreview.style.display = 'none';
        if (coverLetterPreview) coverLetterPreview.style.display = 'block';
    }

    // Use requestAnimationFrame to ensure DOM updates before print
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            window.print();

            // Restore everything after print dialog
            setTimeout(() => {
                document.title = originalTitle;
                if (titleElement) {
                    titleElement.textContent = originalTitleText;
                }

                if (currentDocType === 'resume') {
                    if (resumePreview) resumePreview.style.display = 'flex';
                    if (coverLetterPreview) coverLetterPreview.style.display = 'none';
                } else {
                    if (resumePreview) resumePreview.style.display = 'none';
                    if (coverLetterPreview) coverLetterPreview.style.display = 'block';
                }
            }, 500);
        });
    });
}



function downloadPDF() {
    const element = currentDocType === 'resume' 
        ? document.getElementById('resumePreview') 
        : document.getElementById('coverLetterPreview');

    if (!element) {
        alert('Preview element not found!');
        return;
    }

    // ---------- Filename logic (with date) ----------
    const firstName = (formData.firstName || '').trim() || 'FirstName';
    const lastName  = (formData.lastName || '').trim() || 'LastName';
    const jobTitleRaw = (formData.jobTitle || '').trim() || 'JobTitle';
    const jobTitle = jobTitleRaw.replace(/[<>:"/\\|?*]+/g, '').replace(/\s+/g, ' ').trim();

    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    const docLabel = currentDocType === 'resume' ? 'Resume' : 'Cover letter';

    // ✅ Add current date (YYYY-MM-DD)
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // e.g. "2025-10-08"

    let fileName = `${docLabel}_${fullName}${jobTitle ? '_' + jobTitle : ''}_${dateStr}.pdf`;
    fileName = fileName.replace(/[<>:"/\\|?*]+/g, '').replace(/\s+/g, ' ').trim();

    // ---------- Your original export logic (unchanged) ----------
    const originalTransform = element.style.transform;
    const originalTransformOrigin = element.style.transformOrigin;
    const originalWidth = element.style.width;
    const originalHeight = element.style.height;
    
    element.style.transform = 'none';
    element.style.transformOrigin = 'top left';
    element.style.width = '210mm';
    element.style.height = '297mm';

    const images = element.querySelectorAll('img');
    const originalSrcs = [];
    
    images.forEach((img, index) => {
        originalSrcs[index] = img.src;
        if (img.naturalWidth > 300) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const maxSize = 300;
            const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
            
            canvas.width = img.naturalWidth * scale;
            canvas.height = img.naturalHeight * scale;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            img.src = canvas.toDataURL('image/jpeg', 0.75);
        }
    });

    setTimeout(() => {
        const opt = {
            margin: 0,
            filename: fileName,
            image: { type: 'jpeg', quality: 0.92 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                letterRendering: true,
                logging: false,
                scrollY: -window.scrollY,
                scrollX: -window.scrollX
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4',
                orientation: 'portrait',
                compress: true
            },
            pagebreak: { mode: 'avoid-all' }
        };

        html2pdf().set(opt).from(element).toPdf().get('pdf').then(function(pdf) {
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = totalPages; i > 1; i--) {
                pdf.deletePage(i);
            }
            
            pdf.save(fileName);
            
            element.style.transform = originalTransform;
            element.style.transformOrigin = originalTransformOrigin;
            element.style.width = originalWidth;
            element.style.height = originalHeight;
            
            images.forEach((img, index) => {
                img.src = originalSrcs[index];
            });
        });
    }, 150);
}



// ==================== UTILITY FUNCTIONS ====================
function clearAll() {
    if (!confirm("Are you sure you want to clear everything? This will reset all form data.")) return;

    formData = {
        firstName: '',
        lastName: '',
        jobTitle: '',
        phone: '',
        email: '',
        linkedin: '',
        location: '',
        summary: '',
        aboutType: 'summary',
        contactHeading: 'CONTACT',
        summaryHeading: 'auto',
        experienceHeading: 'PROFESSIONAL EXPERIENCE',
        educationHeading: 'EDUCATION',
        skillsHeading: 'TECHNICAL SKILLS',
        languagesHeading: 'LANGUAGES',
        referencesHeading: 'REFERENCES',
        mainColor: '#008c8c',
        gradientColor: '#8c8c00',
        rightBgColor: '#e6ebf0',
        rightContentColor: '#ffffff',
        useGradient: true,
        fontFamily: "'Segoe UI', sans-serif",
        fontSize: '11',
        bulletStyle: '•',
        leftWidth: '35',
        rightWidth: '65',
        rightHeaderPadding: '15',
        rightBodyPadding: '17'
    };

    skills = [];
    languages = [];
    experiences = [];
    education = [];
    customSections = [];
    references = [];
    profilePicData = null;
    coverLetterBody = '';

    sectionOrder = {
        left: ["contact", "skills", "languages", "references"],
        right: ["summary", "experience", "education", "custom"]
    };

    Object.keys(formData).forEach(key => {
        const el = document.getElementById(key);
        if (el) {
            if (el.type === 'checkbox') {
                el.checked = formData[key];
            } else {
                el.value = formData[key];
            }
        }
    });

    const profilePicEl = document.getElementById('profilePic');
    if (profilePicEl) profilePicEl.value = '';

    ['skillsContainer', 'languagesContainer', 'experienceContainer', 
     'educationContainer', 'customContainer', 'referencesContainer'].forEach(id => {
        const container = document.getElementById(id);
        if (container) container.innerHTML = '';
    });

    const clBodyEl = document.getElementById('clBody');
    if (clBodyEl) clBodyEl.value = '';

    updatePreview();
    updateCoverLetterPreview();
    
    saveToLocalStorage();
    
    alert("All data has been cleared!");
}

// ==================== HISTORY MANAGER ====================
const HistoryManager = {
    history: [],
    currentIndex: -1,
    maxHistory: 50,
    isRestoring: false,
    
    init() {
        this.saveState();
        
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }
            else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                this.redo();
            }
        });
        
        console.log('✅ History Manager initialized');
    },
    
    saveState() {
        if (this.isRestoring) return;
        
        const state = collectAllData();
        const stateCopy = JSON.parse(JSON.stringify(state));
        
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }
        
        this.history.push(stateCopy);
        this.currentIndex++;
        
        if (this.history.length > this.maxHistory) {
            this.history.shift();
            this.currentIndex--;
        }
        
        this.updateUI();
        console.log(`📝 State saved (${this.currentIndex + 1}/${this.history.length})`);
    },
    
    undo() {
        if (!this.canUndo()) {
            console.log('⚠️ Nothing to undo');
            this.showToast('Nothing to undo');
            return;
        }
        
        this.currentIndex--;
        this.restoreState();
        this.showToast('Undo');
        console.log(`↶ Undo (${this.currentIndex + 1}/${this.history.length})`);
    },
    
    redo() {
        if (!this.canRedo()) {
            console.log('⚠️ Nothing to redo');
            this.showToast('Nothing to redo');
            return;
        }
        
        this.currentIndex++;
        this.restoreState();
        this.showToast('Redo');
        console.log(`↷ Redo (${this.currentIndex + 1}/${this.history.length})`);
    },
    
    restoreState() {
        this.isRestoring = true;
        
        const state = this.history[this.currentIndex];
        if (!state) {
            console.error('❌ No state at index', this.currentIndex);
            this.isRestoring = false;
            return;
        }
        
        restoreAllData(JSON.parse(JSON.stringify(state)));
        
        renderSkills();
        renderLanguages();
        renderExperiences();
        renderEducation();
        renderCustomSections();
        renderReferences();
        
        updatePreview();
        updateCoverLetterPreview();
        updateAllToggleButtons();
        
        this.updateUI();
        this.isRestoring = false;
    },
    
    canUndo() {
        return this.currentIndex > 0;
    },
    
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    },
    
    updateUI() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        const historyInfo = document.getElementById('historyInfo');
        
        if (undoBtn) {
            undoBtn.disabled = !this.canUndo();
            undoBtn.style.opacity = this.canUndo() ? '1' : '0.5';
        }
        
        if (redoBtn) {
            redoBtn.disabled = !this.canRedo();
            redoBtn.style.opacity = this.canRedo() ? '1' : '0.5';
        }
        
        if (historyInfo) {
            historyInfo.textContent = `${this.currentIndex + 1}/${this.history.length}`;
        }
    },
    
    clear() {
        if (!confirm('Clear all undo history? This cannot be undone.')) return;
        
        this.history = [];
        this.currentIndex = -1;
        this.saveState();
        this.showToast('History cleared');
    },
    
    showToast(message) {
        const existingToast = document.querySelector('.history-toast');
        if (existingToast) existingToast.remove();
        
        const toast = document.createElement('div');
        toast.className = 'history-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 1500);
    }
};

const HistoryViewer = {
    show() {
        const html = `
            <div id="historyViewerPanel" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                 background: white; padding: 20px; border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); 
                 z-index: 10001; max-width: 400px; width: 90%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0;">Edit History</h3>
                    <button onclick="HistoryViewer.close()" style="border: none; background: none; font-size: 24px; cursor: pointer;">&times;</button>
                </div>
                <div style="max-height: 400px; overflow-y: auto;">
                    ${HistoryManager.history.map((state, index) => `
                        <div onclick="HistoryViewer.jumpTo(${index})" 
                             style="padding: 10px; margin: 5px 0; border-radius: 4px; cursor: pointer; 
                                    background: ${index === HistoryManager.currentIndex ? '#e1ebf7' : '#f8f9fa'};
                                    border-left: 3px solid ${index === HistoryManager.currentIndex ? '#2b579a' : 'transparent'};">
                            <strong>State ${index + 1}</strong>
                            <div style="font-size: 11px; color: #666;">
                                ${new Date(state.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                    <button onclick="HistoryManager.clear()" style="width: 100%; padding: 8px; background: #dc3545; 
                            color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Clear History
                    </button>
                </div>
            </div>
            <div id="historyViewerOverlay" onclick="HistoryViewer.close()" 
                 style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                        background: rgba(0,0,0,0.5); z-index: 10000;"></div>
        `;
        
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div);
    },
    
    close() {
        document.getElementById('historyViewerPanel')?.parentElement.remove();
        document.getElementById('historyViewerOverlay')?.remove();
    },
    
    jumpTo(index) {
        HistoryManager.currentIndex = index;
        HistoryManager.restoreState();
        this.close();
    }
};

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedHistorySave = debounce(() => {
    HistoryManager.saveState();
}, 1000);

const originalUpdatePreview = updatePreview;
updatePreview = function() {
    originalUpdatePreview();
    if (!HistoryManager.isRestoring) {
        debouncedHistorySave();
    }
};

const originalUpdateCoverLetterPreview = updateCoverLetterPreview;
updateCoverLetterPreview = function() {
    originalUpdateCoverLetterPreview();
    if (!HistoryManager.isRestoring) {
        debouncedHistorySave();
    }
};

console.log("✅ Resume Builder JavaScript Loaded Successfully");
console.log("✅ All character encoding issues fixed");
console.log("✅ Undo/Redo System active");
function testCustomSections() {
    console.log('=== CUSTOM SECTIONS DEBUG ===');
    console.log('Total sections:', customSections.length);
    customSections.forEach((section, index) => {
        console.log(`\nSection ${index + 1}:`);
        console.log('  ID:', section.id);
        console.log('  Title:', section.title);
        console.log('  Placement:', section.placement || 'right');
        console.log('  Items:', section.items.length);
        section.items.forEach((item, i) => {
            console.log(`    Item ${i + 1}: ${item.subtitle}`);
        });
    });
    console.log('=== END DEBUG ===');
}
// -------- Title-bar sync (minimal, non-invasive) --------
(function() {
  function updateDocumentTitle() {
    // prefer the input values, fall back to preview text (in case load updates preview directly)
    const first = (document.getElementById('firstName')?.value || document.getElementById('previewFirstName')?.textContent || '').trim();
    const last  = (document.getElementById('lastName')?.value  || document.getElementById('previewLastName')?.textContent  || '').trim();
    const span  = document.getElementById('documentTitle');
    if (!span) return;
    if (first || last) span.textContent = `- ${first} ${last}`;
    else span.textContent = '';
  }

  // 1) Live input listeners (typing)
  ['firstName', 'lastName'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateDocumentTitle);
  });

  // 2) Observe preview nodes for programmatic changes (updatePreview uses these)
  ['previewFirstName', 'previewLastName'].forEach(id => {
    const node = document.getElementById(id);
    if (!node) return;
    const mo = new MutationObserver(() => {
      // When preview text changes, update title immediately
      updateDocumentTitle();
    });
    mo.observe(node, { characterData: true, childList: true, subtree: true });
  });

  // 3) Run once on DOMContentLoaded and shortly after (catches async loads)
  document.addEventListener('DOMContentLoaded', () => {
    updateDocumentTitle();
    // small delayed run in case loader runs after DOMContentLoaded
    setTimeout(updateDocumentTitle, 400);
  });

  // 4) File picker / load fallback — when window regains focus (picker closed),
  //    poll a few times to catch programs that assign .value without firing events.
  let pollTimer = null;
  function shortPollForTitle() {
    if (pollTimer) clearInterval(pollTimer);
    let ticks = 0;
    pollTimer = setInterval(() => {
      updateDocumentTitle();
      ticks++;
      if (ticks >= 8) { clearInterval(pollTimer); pollTimer = null; }
    }, 200);
  }
  window.addEventListener('focus', shortPollForTitle);

  // Expose function just in case you want to call it manually from loadData()
  window.updateDocumentTitle = updateDocumentTitle;
})();
function getDocumentFileName() {
    const first = (document.getElementById("firstName")?.value || "").trim();
    const last = (document.getElementById("lastName")?.value || "").trim();
    const job = (document.getElementById("jobTitle")?.value || "").trim();
    const fullName = [first, last].filter(Boolean).join(" ");
    const type = (window.currentDocType || "resume").toLowerCase();

    const prefix = type === "coverletter" || type === "cover_letter" ? "Cover letter" : "Resume";
    return `${prefix}_${fullName || "Unnamed"}${job ? "_" + job : ""}`.replace(/\s+/g, " ").trim();
}











