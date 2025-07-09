// UniversityPathways.AI - Main Application Logic

class UniversityPathways {
    constructor() {
        this.init();
        this.mockData = this.generateMockData();
    }

    init() {
        this.bindEvents();
        this.hideAllSections();
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

// Chatbot functionality
class ChatBot {
    constructor() {
        this.apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmYWFjYmEzZi1jNGVhLTQ4NzctOTdhZS02NjAyODgzODg3ZjciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzUyMDI2NzAwfQ.VM5tmSSRtLgdjvYvG-K_UD9J9-FQSyp2M3_Dicy6XhE';
        this.apiUrl = 'https://your-n8n-instance.com/webhook/chat'; // Replace with your actual n8n webhook URL
        this.isOpen = false;
        this.isTyping = false;
        this.isFullscreen = false;
        this.messageHistory = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.showWelcomeMessage();
    }

    bindEvents() {
        const toggle = document.getElementById('chatbot-toggle');
        const widget = document.getElementById('chatbot-widget');
        const expandBtn = document.getElementById('chatbot-expand');
        const minimizeBtn = document.getElementById('chatbot-minimize');
        const closeBtn = document.getElementById('chatbot-close');
        const form = document.getElementById('chatbot-form');
        const input = document.getElementById('chatbot-input');

        toggle.addEventListener('click', () => this.toggleChat());
        expandBtn.addEventListener('click', () => this.toggleFullscreen());
        minimizeBtn.addEventListener('click', () => this.minimizeChat());
        closeBtn.addEventListener('click', () => this.closeChat());
        form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Auto-resize input and handle enter key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSubmit(e);
            }
            
            // Escape key to exit fullscreen
            if (e.key === 'Escape' && this.isFullscreen) {
                this.exitFullscreen();
            }
        });

        // Handle escape key globally when in fullscreen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isFullscreen) {
                this.exitFullscreen();
            }
        });

        // Show notification after a delay if user hasn't opened chat
        setTimeout(() => {
            if (!this.isOpen) {
                this.showNotification();
            }
        }, 10000); // Show after 10 seconds
    }

    toggleChat() {
        const widget = document.getElementById('chatbot-widget');
        
        if (this.isOpen) {
            this.minimizeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        const widget = document.getElementById('chatbot-widget');
        const notification = document.getElementById('chatbot-notification');
        
        widget.classList.remove('hidden');
        notification.style.display = 'none';
        this.isOpen = true;
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('chatbot-input').focus();
        }, 300);
    }

    minimizeChat() {
        if (this.isFullscreen) {
            this.exitFullscreen();
        }
        
        const widget = document.getElementById('chatbot-widget');
        widget.classList.add('hidden');
        this.isOpen = false;
    }

    closeChat() {
        if (this.isFullscreen) {
            this.exitFullscreen();
            // Small delay to allow fullscreen exit animation
            setTimeout(() => {
                this.minimizeChat();
            }, 200);
        } else {
            this.minimizeChat();
        }
    }

    showNotification() {
        const notification = document.getElementById('chatbot-notification');
        notification.style.display = 'block';
    }

    showWelcomeMessage() {
        // Welcome message is already in HTML, but we can add more dynamic ones
        setTimeout(() => {
            if (!this.isOpen) {
                this.showNotification();
            }
        }, 5000);
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (!message || this.isTyping) return;
        
        // Clear input
        input.value = '';
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Show typing indicator
        this.showTyping();
        
        try {
            // Send message to n8n
            const response = await this.sendToN8N(message);
            
            // Hide typing indicator
            this.hideTyping();
            
            // Add bot response
            this.addMessage(response, 'bot');
            
        } catch (error) {
            console.error('Chatbot error:', error);
            this.hideTyping();
            this.addMessage('Sorry, I\'m having trouble connecting right now. Please try again later or use the search form above! 😊', 'bot');
        }
    }

    async sendToN8N(message) {
        // Store message in history for context
        this.messageHistory.push({ role: 'user', content: message });
        
        // For now, return a mock response since we need the actual n8n webhook URL
        // Replace this with actual n8n API call
        return this.getMockResponse(message);
        
        /* Uncomment and modify this when you have your n8n webhook URL:
        
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                message: message,
                history: this.messageHistory,
                context: 'UniversityPathways.AI - Singapore university admissions assistant'
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to get response from chatbot');
        }
        
        const data = await response.json();
        return data.message || data.response || 'I apologize, but I didn\'t receive a proper response. Please try again.';
        
        */
    }

    getMockResponse(message) {
        // Simulate API delay
        return new Promise((resolve) => {
            setTimeout(() => {
                const lowerMessage = message.toLowerCase();
                
                // Context-aware responses based on keywords
                if (lowerMessage.includes('gpa') || lowerMessage.includes('requirement')) {
                    resolve('GPA requirements vary by university and course. For example:\n\n• NUS Computer Science: 3.7\n• NTU Business: 3.4\n• SMU Information Systems: 3.5\n\nUse the search form above to find specific requirements! 🎯');
                } else if (lowerMessage.includes('nus') || lowerMessage.includes('national university')) {
                    resolve('NUS is Singapore\'s flagship university! 🏛️ Popular courses include Computer Science (GPA 3.7), Business (GPA 3.5), and Engineering (GPA 3.4-3.6). What specific course are you interested in?');
                } else if (lowerMessage.includes('ntu') || lowerMessage.includes('nanyang')) {
                    resolve('NTU is known for engineering and technology! ⚙️ Their Computer Science program requires GPA 3.6, while Business needs 3.4. They have excellent industry partnerships too!');
                } else if (lowerMessage.includes('smu') || lowerMessage.includes('management university')) {
                    resolve('SMU specializes in business and social sciences! 💼 Their Information Systems program (GPA 3.5) is particularly strong, and they use innovative case-based learning methods.');
                } else if (lowerMessage.includes('computer science') || lowerMessage.includes('computing')) {
                    resolve('Computer Science is very popular! 💻 Here are the GPA requirements:\n\n• NUS: 3.7\n• NTU: 3.6\n• SMU IS: 3.5\n• SUTD: 3.5\n\nAll offer excellent programs with different specializations!');
                } else if (lowerMessage.includes('business') || lowerMessage.includes('management')) {
                    resolve('Business programs are great for career flexibility! 📈 Requirements:\n\n• NUS Business: 3.5\n• NTU Business: 3.4\n• SMU Business: 3.6\n\nEach has unique strengths - NUS for diversity, NTU for innovation, SMU for practical learning!');
                } else if (lowerMessage.includes('engineering')) {
                    resolve('Engineering has many specializations! ⚙️ Common GPA ranges:\n\n• Mechanical: 3.4-3.5\n• Electrical: 3.5-3.6\n• Civil: 3.3-3.4\n\nNUS and NTU have the strongest engineering programs. What type of engineering interests you?');
                } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
                    resolve('Hello! 👋 I\'m here to help you navigate Singapore university admissions. Ask me about GPA requirements, course information, or university comparisons!');
                } else if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
                    resolve('I can help you with:\n\n🎯 GPA requirements for specific courses\n🏛️ University comparisons\n📚 Course information\n💡 Application tips\n\nTry asking: "What\'s the GPA for NUS Computer Science?" or use the search form above!');
                } else if (lowerMessage.includes('thank')) {
                    resolve('You\'re very welcome! 😊 Good luck with your university applications! Feel free to ask if you need more help.');
                } else {
                    resolve('That\'s a great question! 🤔 For the most accurate and up-to-date information, I recommend using the search form above. You can also ask me about specific universities, courses, or GPA requirements!');
                }
            }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
        });
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Convert newlines to paragraphs
        const paragraphs = content.split('\n').filter(p => p.trim());
        paragraphs.forEach(paragraph => {
            const p = document.createElement('p');
            p.textContent = paragraph;
            contentDiv.appendChild(p);
        });
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom with smooth animation
        this.scrollToBottom();
        
        // Store in history
        this.messageHistory.push({ role: sender === 'user' ? 'user' : 'assistant', content: content });
    }

    showTyping() {
        const typingDiv = document.getElementById('chatbot-typing');
        const messagesContainer = document.getElementById('chatbot-messages');
        
        typingDiv.classList.remove('hidden');
        this.isTyping = true;
        
        // Disable send button
        document.getElementById('chatbot-send').disabled = true;
        
        // Scroll to bottom
        this.scrollToBottom();
    }

    hideTyping() {
        const typingDiv = document.getElementById('chatbot-typing');
        
        typingDiv.classList.add('hidden');
        this.isTyping = false;
        
        // Enable send button
        document.getElementById('chatbot-send').disabled = false;
    }

    toggleFullscreen() {
        if (this.isFullscreen) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }

    enterFullscreen() {
        const widget = document.getElementById('chatbot-widget');
        const expandBtn = document.getElementById('chatbot-expand');
        const expandIcon = expandBtn.querySelector('i');
        
        // Add fullscreen class with animation
        widget.classList.add('expanding');
        
        setTimeout(() => {
            widget.classList.remove('expanding');
            widget.classList.add('fullscreen');
            this.isFullscreen = true;
            
            // Change expand button to compress icon
            expandIcon.className = 'fas fa-compress';
            expandBtn.title = 'Exit fullscreen';
            
            // Scroll to bottom after transition
            this.scrollToBottom();
        }, 400);
        
        // Hide body scroll when fullscreen
        document.body.style.overflow = 'hidden';
    }

    exitFullscreen() {
        const widget = document.getElementById('chatbot-widget');
        const expandBtn = document.getElementById('chatbot-expand');
        const expandIcon = expandBtn.querySelector('i');
        
        // Add contracting animation
        widget.classList.add('contracting');
        widget.classList.remove('fullscreen');
        
        setTimeout(() => {
            widget.classList.remove('contracting');
            this.isFullscreen = false;
            
            // Change compress button back to expand icon
            expandIcon.className = 'fas fa-expand';
            expandBtn.title = 'Expand to fullscreen';
            
            // Scroll to bottom after transition
            this.scrollToBottom();
        }, 400);
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UniversityPathways();
    new ChatBot();
});

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversityPathways;
}
