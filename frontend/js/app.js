/**
 * Personal Operating System - Main Application v2
 * Handles UI interactions, routing, and state management.
 */

class App {
    constructor() {
        this.currentPage = 'home';
        this.isAuthenticated = false;
        this.isSetup = false;

        this.init();
    }

    async init() {
        this.bindElements();
        this.bindEvents();
        // Skip auth - go straight to main app
        this.showMainApp();
    }

    bindElements() {
        // Screens
        this.authScreen = document.getElementById('auth-screen');
        this.mainApp = document.getElementById('main-app');

        // Auth
        this.authForm = document.getElementById('auth-form');
        this.passwordInput = document.getElementById('password');
        this.authBtn = document.getElementById('auth-btn');
        this.authError = document.getElementById('auth-error');

        // Navigation
        this.navLinks = document.querySelectorAll('.nav-link');
        this.pages = document.querySelectorAll('.page');

        // Journal
        this.entryList = document.getElementById('entry-list');
        this.entryModal = document.getElementById('entry-modal');
        this.entryForm = document.getElementById('entry-form');
        this.newEntryBtn = document.getElementById('new-entry-btn');
        this.closeModalBtn = document.getElementById('close-modal');
        this.cancelEntryBtn = document.getElementById('cancel-entry');

        // Entry form fields
        this.entryDate = document.getElementById('entry-date');
        this.entryMood = document.getElementById('entry-mood');
        this.entryEnergy = document.getElementById('entry-energy');
        this.entryFocus = document.getElementById('entry-focus');
        this.entryDiscipline = document.getElementById('entry-discipline');
        this.entryContent = document.getElementById('entry-content');

        // Logout
        this.logoutBtn = document.getElementById('logout-btn');

        // File upload
        this.uploadZone = document.getElementById('upload-zone');
        this.fileInput = document.getElementById('file-input');
    }

    bindEvents() {
        // Auth removed - no password needed

        // Navigation
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.navigateTo(link.dataset.page));
        });

        // Journal
        this.newEntryBtn?.addEventListener('click', () => this.openEntryModal());
        this.closeModalBtn?.addEventListener('click', () => this.closeEntryModal());
        this.cancelEntryBtn?.addEventListener('click', () => this.closeEntryModal());
        this.entryForm?.addEventListener('submit', (e) => this.handleSaveEntry(e));

        // Close modal on backdrop click
        this.entryModal?.addEventListener('click', (e) => {
            if (e.target === this.entryModal) this.closeEntryModal();
        });

        // Sliders
        const sliders = ['mood', 'energy', 'focus', 'discipline'];
        sliders.forEach(name => {
            const slider = document.getElementById(`entry-${name}`);
            const valueEl = document.getElementById(`${name}-value`);
            if (slider && valueEl) {
                slider.addEventListener('input', () => {
                    valueEl.textContent = slider.value;
                });
            }
        });

        // Logout (kept for clearing session cookie if any)
        this.logoutBtn?.addEventListener('click', () => this.handleLogout());

        // File upload
        this.uploadZone?.addEventListener('click', () => this.fileInput?.click());
        this.fileInput?.addEventListener('change', (e) => this.handleFileUpload(e));

        // Drag and drop
        this.uploadZone?.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadZone.style.borderColor = 'var(--accent-primary)';
        });
        this.uploadZone?.addEventListener('dragleave', () => {
            this.uploadZone.style.borderColor = '';
        });
        this.uploadZone?.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadZone.style.borderColor = '';
            if (e.dataTransfer.files.length) {
                this.handleFileDrop(e.dataTransfer.files);
            }
        });
    }

    // --- Auth (disabled) ---

    async handleLogout() {
        // Just reload the page
        window.location.reload();
    }

    showMainApp() {
        if (this.authScreen) this.authScreen.classList.add('hidden');
        if (this.mainApp) this.mainApp.classList.remove('hidden');

        // Load editable content from API, then load dynamic data
        contentManager.loadAll().then(() => {
            // Attach edit buttons to each editable section
            editor.addEditButton('hero-section', 'hero');
            editor.addEditButton('about-dynamic', 'about');
            editor.addEditButton('vision-dynamic', 'vision');
            editor.addEditButton('goals-dynamic', 'goals');
            editor.addEditButton('page-projects', 'projects');
            editor.addEditButton('page-skills', 'skills');
            editor.addEditButton('timeline-dynamic', 'timeline');
            editor.addEditButton('page-learning', 'learning');
            editor.addEditButton('page-achievements', 'achievements');
            editor.addEditButton('footer-dynamic', 'footer');
            editor.addEditButton('ups-downs-dynamic', 'ups_downs');
            // New modules
            editor.addEditButton('pow-dynamic', 'proof_of_work');
            editor.addEditButton('skill-matrix-dynamic', 'skill_matrix');
            editor.addEditButton('roadmap-strategic-dynamic', 'strategic_roadmap');
            editor.addEditButton('metrics-dynamic', 'performance_metrics');
            editor.addEditButton('research-dynamic', 'research_log');
            editor.addEditButton('failure-log-dynamic', 'failure_log');
            editor.addEditButton('technical-debt-dynamic', 'technical_debt');
            editor.addEditButton('energy-leak-dynamic', 'energy_leak');
            editor.addEditButton('leverage-dynamic', 'leverage_tracker');
            editor.addEditButton('benchmarking-dynamic', 'benchmarking');
            editor.addEditButton('public-impact-dynamic', 'public_impact');
        });


        this.loadHomeData();
    }

    // --- Navigation ---

    navigateTo(page) {
        this.currentPage = page;

        // Update nav
        this.navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });

        // Update pages
        this.pages.forEach(p => {
            p.classList.toggle('active', p.id === `page-${page}`);
        });

        // Load page data
        switch (page) {
            case 'home':
                this.loadHomeData();
                break;
            case 'journal':
                this.loadJournalEntries();
                break;
            case 'timeline':
                // Static content, no load needed
                break;
            case 'future-self':
                // Static content for now
                break;
            case 'media':
                // Static content for now
                break;
        }
    }

    // --- Home ---

    async loadHomeData() {
        try {
            const data = await api.getDashboard(30);

            // Update streak
            document.getElementById('home-streak').textContent = data.streak.current_streak;

            // Update entry count (from entries)
            const entries = await api.listEntries(null, null, 100);
            document.getElementById('home-entries').textContent = entries.count;

            // Update mood meters if we have today's data
            if (data.trends && data.trends.dates.length > 0) {
                const lastIndex = data.trends.dates.length - 1;
                const mood = data.trends.mood[lastIndex] || 5;
                const energy = data.trends.energy[lastIndex] || 5;
                const focus = data.trends.focus[lastIndex] || 5;
                const discipline = data.trends.discipline[lastIndex] || 5;

                document.getElementById('today-mood').style.width = `${mood * 10}%`;
                document.getElementById('today-energy').style.width = `${energy * 10}%`;
                document.getElementById('today-focus').style.width = `${focus * 10}%`;
                document.getElementById('today-discipline').style.width = `${discipline * 10}%`;
            }

        } catch (error) {
            console.error('Failed to load home data:', error);
        }
    }

    // --- Journal ---

    async loadJournalEntries() {
        this.entryList.innerHTML = '<p class="loading">Loading entries...</p>';

        try {
            const data = await api.listEntries(null, null, 50);

            if (!data.entries || data.entries.length === 0) {
                this.entryList.innerHTML = `
                    <div class="no-entries">
                        <p>No journal entries yet.</p>
                        <button class="btn btn-primary" onclick="app.openEntryModal()">Write Your First Entry</button>
                    </div>
                `;
                return;
            }

            this.entryList.innerHTML = data.entries.map(entry => `
                <div class="entry-item ${entry.locked ? 'locked' : ''}" data-date="${entry.date}">
                    <div class="entry-date">${this.formatDate(entry.date)}</div>
                    <div class="entry-preview">${this.truncate(entry.content, 150)}</div>
                    <div class="entry-metrics">
                        <span>😊 ${entry.mood}/10</span>
                        <span>⚡ ${entry.energy}/10</span>
                        <span>🎯 ${entry.focus}/10</span>
                        <span>💪 ${entry.discipline}/10</span>
                        ${entry.locked ? '<span>🔒 Locked</span>' : ''}
                    </div>
                </div>
            `).join('');

            // Add click handlers
            this.entryList.querySelectorAll('.entry-item').forEach(item => {
                item.addEventListener('click', () => this.viewEntry(item.dataset.date));
            });

        } catch (error) {
            this.entryList.innerHTML = `<p class="error-text">Failed to load entries: ${error.message}</p>`;
        }
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    truncate(text, length) {
        if (!text) return '';
        const cleaned = text.replace(/^#+\s*/gm, '').replace(/\n/g, ' ');
        return cleaned.length > length ? cleaned.slice(0, length) + '...' : cleaned;
    }

    openEntryModal(date = null) {
        const today = new Date().toISOString().split('T')[0];
        this.entryDate.value = date || today;
        this.entryContent.value = '';
        this.entryMood.value = 5;
        this.entryEnergy.value = 5;
        this.entryFocus.value = 5;
        this.entryDiscipline.value = 5;

        // Update slider displays
        ['mood', 'energy', 'focus', 'discipline'].forEach(name => {
            const valueEl = document.getElementById(`${name}-value`);
            if (valueEl) valueEl.textContent = '5';
        });

        // Enable form
        this.entryForm.querySelectorAll('input, textarea').forEach(el => el.disabled = false);
        this.entryForm.querySelector('button[type="submit"]').disabled = false;

        document.getElementById('modal-title').textContent = 'New Entry';
        this.entryModal.classList.remove('hidden');
    }

    closeEntryModal() {
        this.entryModal.classList.add('hidden');
    }

    async viewEntry(date) {
        try {
            const entry = await api.getEntry(date);

            this.entryDate.value = entry.date;
            this.entryContent.value = entry.content;
            this.entryMood.value = entry.mood;
            this.entryEnergy.value = entry.energy;
            this.entryFocus.value = entry.focus;
            this.entryDiscipline.value = entry.discipline;

            // Update slider displays
            document.getElementById('mood-value').textContent = entry.mood;
            document.getElementById('energy-value').textContent = entry.energy;
            document.getElementById('focus-value').textContent = entry.focus;
            document.getElementById('discipline-value').textContent = entry.discipline;

            const title = entry.locked ? `${this.formatDate(date)} 🔒` : `Edit: ${this.formatDate(date)}`;
            document.getElementById('modal-title').textContent = title;

            // Disable form if locked
            const isLocked = entry.locked;
            this.entryForm.querySelectorAll('input, textarea').forEach(el => el.disabled = isLocked);
            this.entryForm.querySelector('button[type="submit"]').disabled = isLocked;

            this.entryModal.classList.remove('hidden');
        } catch (error) {
            alert('Failed to load entry: ' + error.message);
        }
    }

    async handleSaveEntry(e) {
        e.preventDefault();

        const date = this.entryDate.value;
        const metrics = {
            mood: parseInt(this.entryMood.value),
            energy: parseInt(this.entryEnergy.value),
            focus: parseInt(this.entryFocus.value),
            discipline: parseInt(this.entryDiscipline.value),
        };
        const content = this.entryContent.value;

        try {
            // Try create first, fall back to update
            try {
                await api.createEntry(date, metrics, content);
            } catch (createError) {
                if (createError.message.includes('already exists')) {
                    await api.updateEntry(date, { metrics, content });
                } else {
                    throw createError;
                }
            }

            this.closeEntryModal();
            this.loadJournalEntries();
            this.loadHomeData();
        } catch (error) {
            alert('Failed to save entry: ' + error.message);
        }
    }

    // --- Media Upload ---

    handleFileUpload(e) {
        const files = e.target.files;
        if (files.length) {
            this.processFiles(files);
        }
    }

    handleFileDrop(files) {
        this.processFiles(files);
    }

    processFiles(files) {
        // For now, just show a message - full implementation would upload to backend
        const fileNames = Array.from(files).map(f => f.name).join(', ');
        alert(`Selected files: ${fileNames}\n\nFile upload functionality will be implemented in a future update.`);
    }
}

// Initialize app on load
const app = new App();
