// UniversityPathways.AI - Main Application Logic

class UniversityPathways {
    constructor() {
        this.init();
        this.mockData = this.generateMockData();
    }

    init() {
        this.bindEvents();
        this.hideAllSections();
        this.initTelegramButton();
    }

    bindEvents() {
        const searchForm = document.getElementById('searchForm');
        const newSearchBtn = document.getElementById('newSearch');
        const retryBtn = document.getElementById('retrySearch');

        searchForm.addEventListener('submit', (e) => this.handleSearch(e));
        newSearchBtn.addEventListener('click', () => this.resetSearch());
        retryBtn.addEventListener('click', () => this.resetSearch());

        // Auto-suggest course names based on university selection
        const universitySelect = document.getElementById('university');
        const courseInput = document.getElementById('course');
        
        universitySelect.addEventListener('change', (e) => {
            this.updateCourseSuggestions(e.target.value, courseInput);
        });
    }

    hideAllSections() {
        document.getElementById('results').classList.add('hidden');
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('error').classList.add('hidden');
    }

    async handleSearch(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const searchParams = {
            university: formData.get('university'),
            course: formData.get('course'),
            gpa: formData.get('gpa') || null
        };

        this.showLoading();

        try {
            // Simulate API delay
            await this.delay(1500);
            
            // In a real implementation, this would call your RAG pipeline or web scraping API
            const results = await this.searchGPARequirements(searchParams);
            this.displayResults(results, searchParams);
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Failed to fetch GPA requirements. Please try again.');
        }
    }

    async searchGPARequirements(params) {
        // Mock API call - replace with actual RAG/scraping implementation
        const universityData = this.mockData[params.university];
        
        if (!universityData) {
            throw new Error('University not found');
        }

        // Filter courses based on search term
        const courseSearch = params.course.toLowerCase();
        const matchingCourses = universityData.filter(course => 
            course.name.toLowerCase().includes(courseSearch) ||
            course.keywords.some(keyword => keyword.toLowerCase().includes(courseSearch))
        );

        if (matchingCourses.length === 0) {
            throw new Error('No courses found matching your search');
        }

        // Add personalized recommendations if GPA is provided
        if (params.gpa) {
            matchingCourses.forEach(course => {
                course.recommendation = this.generateRecommendation(course, parseFloat(params.gpa));
            });
        }

        return matchingCourses;
    }

    generateRecommendation(course, userGPA) {
        const requiredGPA = course.gpaRequirement;
        const difference = userGPA - requiredGPA;

        if (difference >= 0.3) {
            return {
                status: 'excellent',
                message: '🎉 Excellent match! Your GPA exceeds the requirement significantly.',
                class: 'gpa-match'
            };
        } else if (difference >= 0) {
            return {
                status: 'good',
                message: '✅ Good match! Your GPA meets the requirement.',
                class: 'gpa-match'
            };
        } else if (difference >= -0.2) {
            return {
                status: 'close',
                message: '⚠️ Close! Consider applying, as requirements can vary by year.',
                class: 'gpa-close'
            };
        } else {
            return {
                status: 'challenging',
                message: '🎯 Consider improving your GPA or exploring alternative pathways.',
                class: 'gpa-far'
            };
        }
    }

    displayResults(results, searchParams) {
        this.hideAllSections();
        
        const resultsSection = document.getElementById('results');
        const resultsContent = document.getElementById('resultsContent');
        
        resultsContent.innerHTML = '';

        results.forEach(course => {
            const resultCard = this.createResultCard(course, searchParams);
            resultsContent.appendChild(resultCard);
        });

        resultsSection.classList.remove('hidden');
    }

    createResultCard(course, searchParams) {
        const card = document.createElement('div');
        card.className = 'result-card';

        const recommendationHTML = course.recommendation ? `
            <div class="recommendation">
                <div class="recommendation-title">💡 Recommendation</div>
                <div>${course.recommendation.message}</div>
            </div>
        ` : '';

        card.innerHTML = `
            <div class="result-header">
                <div class="course-name">${course.name}</div>
                <div class="gpa-requirement ${course.recommendation?.class || ''}">
                    GPA: ${course.gpaRequirement}
                </div>
            </div>
            <div class="result-details">
                <strong>University:</strong> ${this.getUniversityName(searchParams.university)}<br>
                <strong>Faculty:</strong> ${course.faculty}<br>
                <strong>Duration:</strong> ${course.duration}<br>
                <strong>Intake:</strong> ${course.intake}<br>
                ${course.additionalInfo ? `<strong>Additional Info:</strong> ${course.additionalInfo}<br>` : ''}
                <strong>Last Updated:</strong> ${course.lastUpdated}
            </div>
            ${recommendationHTML}
        `;

        return card;
    }

    showLoading() {
        this.hideAllSections();
        document.getElementById('loading').classList.remove('hidden');
    }

    showError(message) {
        this.hideAllSections();
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('error').classList.remove('hidden');
    }

    resetSearch() {
        this.hideAllSections();
        document.getElementById('searchForm').scrollIntoView({ behavior: 'smooth' });
    }

    updateCourseSuggestions(university, courseInput) {
        if (!university) return;

        // Clear previous suggestions
        const existingDatalist = document.getElementById('courseSuggestions');
        if (existingDatalist) {
            existingDatalist.remove();
        }

        // Create new datalist with course suggestions
        const datalist = document.createElement('datalist');
        datalist.id = 'courseSuggestions';
        
        const courses = this.mockData[university] || [];
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.name;
            datalist.appendChild(option);
        });

        courseInput.setAttribute('list', 'courseSuggestions');
        courseInput.parentNode.appendChild(datalist);
    }

    getUniversityName(code) {
        const universities = {
            'nus': 'National University of Singapore (NUS)',
            'ntu': 'Nanyang Technological University (NTU)',
            'smu': 'Singapore Management University (SMU)',
            'sutd': 'Singapore University of Technology and Design (SUTD)',
            'sit': 'Singapore Institute of Technology (SIT)',
            'suss': 'Singapore University of Social Sciences (SUSS)'
        };
        return universities[code] || code;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    initTelegramButton() {
        const telegramButton = document.getElementById('telegram-float');
        if (telegramButton) {
            telegramButton.addEventListener('click', () => {
                // Open Telegram bot in a new tab
                window.open('https://t.me/UniPathway_bot', '_blank');
            });
        }
    }

    generateMockData() {
        return {
            'nus': [
                {
                    name: 'Computer Science',
                    faculty: 'School of Computing',
                    gpaRequirement: 3.7,
                    duration: '4 years',
                    intake: 'August',
                    additionalInfo: 'Strong emphasis on software engineering and AI',
                    lastUpdated: 'January 2025',
                    keywords: ['computer', 'programming', 'software', 'tech', 'it', 'computing']
                },
                {
                    name: 'Business Administration',
                    faculty: 'NUS Business School',
                    gpaRequirement: 3.5,
                    duration: '4 years',
                    intake: 'August',
                    additionalInfo: 'Includes overseas exchange opportunities',
                    lastUpdated: 'January 2025',
                    keywords: ['business', 'management', 'administration', 'commerce', 'marketing']
                },
                {
                    name: 'Mechanical Engineering',
                    faculty: 'Faculty of Engineering',
                    gpaRequirement: 3.4,
                    duration: '4 years',
                    intake: 'August',
                    additionalInfo: 'ABET accredited program',
                    lastUpdated: 'January 2025',
                    keywords: ['mechanical', 'engineering', 'machines', 'manufacturing', 'design']
                },
                {
                    name: 'Psychology',
                    faculty: 'Faculty of Arts and Social Sciences',
                    gpaRequirement: 3.6,
                    duration: '4 years',
                    intake: 'August',
                    additionalInfo: 'Clinical and research tracks available',
                    lastUpdated: 'January 2025',
                    keywords: ['psychology', 'mental', 'behavior', 'research', 'social']
                }
            ],
            'ntu': [
                {
                    name: 'Computer Science',
                    faculty: 'School of Computer Science and Engineering',
                    gpaRequirement: 3.6,
                    duration: '4 years',
                    intake: 'August',
                    additionalInfo: 'Strong industry partnerships',
                    lastUpdated: 'January 2025',
                    keywords: ['computer', 'programming', 'software', 'tech', 'it', 'computing']
                },
                {
                    name: 'Electrical and Electronic Engineering',
                    faculty: 'School of Electrical and Electronic Engineering',
                    gpaRequirement: 3.5,
                    duration: '4 years',
                    intake: 'August',
                    additionalInfo: 'Includes IoT and smart systems specializations',
                    lastUpdated: 'January 2025',
                    keywords: ['electrical', 'electronic', 'engineering', 'circuits', 'systems']
                },
                {
                    name: 'Business',
                    faculty: 'Nanyang Business School',
                    gpaRequirement: 3.4,
                    duration: '4 years',
                    intake: 'August',
                    additionalInfo: 'Triple accredited business school',
                    lastUpdated: 'January 2025',
                    keywords: ['business', 'management', 'finance', 'commerce', 'marketing']
                }
            ],
            'smu': [
                {
                    name: 'Information Systems',
                    faculty: 'School of Information Systems',
                    gpaRequirement: 3.5,
                    duration: '4 years',
                    intake: 'August',
                    additionalInfo: 'Focus on business technology solutions',
                    lastUpdated: 'January 2025',
                    keywords: ['information', 'systems', 'technology', 'business', 'it']
                },
                {
                    name: 'Business Management',
                    faculty: 'Lee Kong Chian School of Business',
                    gpaRequirement: 3.6,
                    duration: '4 years',
                    intake: 'August',
                    additionalInfo: 'Emphasis on case-based learning',
                    lastUpdated: 'January 2025',
                    keywords: ['business', 'management', 'leadership', 'strategy', 'commerce']
                },
                {
                    name: 'Economics',
                    faculty: 'School of Economics',
                    gpaRequirement: 3.4,
                    duration: '4 years',
                    intake: 'August',
                    additionalInfo: 'Strong quantitative focus',
                    lastUpdated: 'January 2025',
                    keywords: ['economics', 'finance', 'quantitative', 'analysis', 'policy']
                }
            ],
            'sutd': [
                {
                    name: 'Computer Science and Design',
                    faculty: 'Information Systems Technology and Design',
                    gpaRequirement: 3.5,
                    duration: '4 years',
                    intake: 'September',
                    additionalInfo: 'Integrates design thinking with computer science',
                    lastUpdated: 'January 2025',
                    keywords: ['computer', 'design', 'technology', 'innovation', 'systems']
                },
                {
                    name: 'Engineering Product Development',
                    faculty: 'Engineering Product Development',
                    gpaRequirement: 3.4,
                    duration: '4 years',
                    intake: 'September',
                    additionalInfo: 'Focus on product innovation and development',
                    lastUpdated: 'January 2025',
                    keywords: ['engineering', 'product', 'development', 'innovation', 'design']
                }
            ],
            'sit': [
                {
                    name: 'Software Engineering',
                    faculty: 'School of Computing',
                    gpaRequirement: 3.2,
                    duration: '4 years',
                    intake: 'August',
                    additionalInfo: 'Applied learning approach with industry projects',
                    lastUpdated: 'January 2025',
                    keywords: ['software', 'engineering', 'programming', 'development', 'applications']
                },
                {
                    name: 'Hospitality Business',
                    faculty: 'School of Business',
                    gpaRequirement: 3.0,
                    duration: '4 years',
                    intake: 'August',
                    additionalInfo: 'Strong industry connections in hospitality sector',
                    lastUpdated: 'January 2025',
                    keywords: ['hospitality', 'business', 'tourism', 'service', 'management']
                }
            ],
            'suss': [
                {
                    name: 'Social Work',
                    faculty: 'School of Humanities and Behavioural Sciences',
                    gpaRequirement: 3.0,
                    duration: '4 years',
                    intake: 'August',
                    additionalInfo: 'Strong focus on community service and social impact',
                    lastUpdated: 'January 2025',
                    keywords: ['social', 'work', 'community', 'service', 'counseling']
                },
                {
                    name: 'Business Analytics',
                    faculty: 'School of Business',
                    gpaRequirement: 3.3,
                    duration: '4 years',
                    intake: 'August',
                    additionalInfo: 'Combines business knowledge with data analytics',
                    lastUpdated: 'January 2025',
                    keywords: ['business', 'analytics', 'data', 'analysis', 'statistics']
                }
            ]
        };
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UniversityPathways();
});

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversityPathways;
}
