/**
 * Personal Operating System - Editor
 * In-app edit mode with section-specific form modals.
 */

class Editor {
    constructor() {
        this.editMode = false;
        this.createToggleButton();
        this.createEditModal();
    }

    // --- Toggle Button ---
    createToggleButton() {
        const btn = document.createElement('button');
        btn.id = 'edit-mode-toggle';
        btn.className = 'edit-toggle';
        btn.innerHTML = '✏️';
        btn.title = 'Toggle Edit Mode';
        btn.addEventListener('click', () => this.toggleEditMode());
        document.body.appendChild(btn);
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
        document.body.classList.toggle('edit-mode', this.editMode);
        const btn = document.getElementById('edit-mode-toggle');
        btn.innerHTML = this.editMode ? '✅' : '✏️';
        btn.title = this.editMode ? 'Exit Edit Mode' : 'Toggle Edit Mode';

        // Show/hide edit buttons on sections
        document.querySelectorAll('.section-edit-btn').forEach(b => {
            b.style.display = this.editMode ? 'flex' : 'none';
        });
    }

    // --- Edit Modal ---
    createEditModal() {
        const modal = document.createElement('div');
        modal.id = 'edit-modal';
        modal.className = 'edit-modal hidden';
        modal.innerHTML = `
            <div class="edit-modal-content glass-card">
                <div class="edit-modal-header">
                    <h3 id="edit-modal-title">Edit Section</h3>
                    <button class="btn-close" id="edit-modal-close">×</button>
                </div>
                <div id="edit-modal-body" class="edit-modal-body"></div>
                <div class="edit-modal-actions">
                    <button class="btn btn-secondary" id="edit-modal-cancel">Cancel</button>
                    <button class="btn btn-primary" id="edit-modal-save">Save Changes</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('edit-modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('edit-modal-cancel').addEventListener('click', () => this.closeModal());
        modal.addEventListener('click', (e) => { if (e.target === modal) this.closeModal(); });
    }

    closeModal() {
        document.getElementById('edit-modal').classList.add('hidden');
    }

    openModal(title, formHtml, onSave) {
        document.getElementById('edit-modal-title').textContent = title;
        document.getElementById('edit-modal-body').innerHTML = formHtml;
        document.getElementById('edit-modal').classList.remove('hidden');

        // Replace save handler
        const saveBtn = document.getElementById('edit-modal-save');
        const newBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newBtn, saveBtn);
        newBtn.addEventListener('click', async () => {
            await onSave();
            this.closeModal();
        });
    }

    // --- Section-specific edit buttons ---
    addEditButton(containerId, section) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.style.position = 'relative';

        const btn = document.createElement('button');
        btn.className = 'section-edit-btn';
        btn.innerHTML = '✏️ Edit';
        btn.style.display = this.editMode ? 'flex' : 'none';
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editSection(section);
        });
        container.appendChild(btn);
    }

    // --- Section Editors ---
    editSection(section) {
        const data = contentManager.data[section];
        if (!data && section !== 'ups_downs') return;

        switch (section) {
            case 'hero': this.editHero(data); break;
            case 'about': this.editAbout(data); break;
            case 'vision': this.editVision(data); break;
            case 'goals': this.editGoals(data); break;
            case 'skills': this.editSkills(data); break;
            case 'timeline': this.editTimeline(data); break;
            case 'learning': this.editLearning(data); break;
            case 'achievements': this.editAchievements(data); break;
            case 'projects': this.editProjects(data); break;
            case 'footer': this.editFooter(data); break;
            case 'ups_downs': this.editUpsDowns(contentManager.data.ups_downs || []); break;
        }
    }

    async saveSection(section, getData) {
        const data = getData();
        try {
            await fetch(`/api/content/${section}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            contentManager.data[section] = data;
            // Re-render the specific section
            const method = 'render' + section.charAt(0).toUpperCase() + section.slice(1);
            if (contentManager[method]) contentManager[method]();
        } catch (e) {
            alert('Failed to save: ' + e.message);
        }
    }

    // --- Hero Editor ---
    editHero(data) {
        const html = `
            <div class="edit-form-group">
                <label>Greeting</label>
                <input type="text" id="edit-hero-greeting" value="${this.esc(data.greeting)}">
            </div>
            <div class="edit-form-group">
                <label>Name</label>
                <input type="text" id="edit-hero-name" value="${this.esc(data.name)}">
            </div>
            <div class="edit-form-group">
                <label>Tagline</label>
                <input type="text" id="edit-hero-tagline" value="${this.esc(data.tagline)}">
            </div>
            <div id="edit-hero-stats">
                <label>Custom Stats</label>
                ${(data.stats || []).map((s, i) => `
                    <div class="edit-array-item" data-index="${i}">
                        <input type="text" placeholder="Label" value="${this.esc(s.label)}" class="hero-stat-label">
                        <input type="text" placeholder="Value" value="${this.esc(s.value)}" class="hero-stat-value">
                        <button class="btn-remove" onclick="this.parentElement.remove()">✕</button>
                    </div>
                `).join('')}
                <button class="btn btn-secondary btn-sm" onclick="editor.addHeroStat()">+ Add Stat</button>
            </div>
        `;
        this.openModal('Edit Hero', html, () => this.saveSection('hero', () => ({
            greeting: document.getElementById('edit-hero-greeting').value,
            name: document.getElementById('edit-hero-name').value,
            tagline: document.getElementById('edit-hero-tagline').value,
            stats: Array.from(document.querySelectorAll('#edit-hero-stats .edit-array-item')).map(el => ({
                label: el.querySelector('.hero-stat-label').value,
                value: el.querySelector('.hero-stat-value').value
            }))
        })));
    }

    addHeroStat() {
        const container = document.getElementById('edit-hero-stats');
        const btn = container.querySelector('.btn-sm');
        const div = document.createElement('div');
        div.className = 'edit-array-item';
        div.innerHTML = `
            <input type="text" placeholder="Label" value="" class="hero-stat-label">
            <input type="text" placeholder="Value" value="" class="hero-stat-value">
            <button class="btn-remove" onclick="this.parentElement.remove()">✕</button>
        `;
        container.insertBefore(div, btn);
    }

    // --- About Editor ---
    editAbout(data) {
        const html = `
            <div class="edit-form-group">
                <label>Story</label>
                <textarea id="edit-about-story" rows="5">${this.esc(data.story)}</textarea>
            </div>
            <div class="edit-form-group">
                <label>Philosophy Title</label>
                <input type="text" id="edit-about-phil-title" value="${this.esc(data.philosophy_title)}">
            </div>
            <div class="edit-form-group">
                <label>Philosophy Text</label>
                <textarea id="edit-about-phil-text" rows="4">${this.esc(data.philosophy_text)}</textarea>
            </div>
            <div id="edit-about-values">
                <label>Values</label>
                ${(data.values || []).map((v, i) => `
                    <div class="edit-array-item" data-index="${i}">
                        <input type="text" placeholder="Icon" value="${this.esc(v.icon)}" class="val-icon" style="width:60px">
                        <input type="text" placeholder="Title" value="${this.esc(v.title)}" class="val-title">
                        <input type="text" placeholder="Description" value="${this.esc(v.desc)}" class="val-desc">
                        <button class="btn-remove" onclick="this.parentElement.remove()">✕</button>
                    </div>
                `).join('')}
                <button class="btn btn-secondary btn-sm" onclick="editor.addValue()">+ Add Value</button>
            </div>
        `;
        this.openModal('Edit About Me', html, () => this.saveSection('about', () => ({
            story: document.getElementById('edit-about-story').value,
            philosophy_title: document.getElementById('edit-about-phil-title').value,
            philosophy_text: document.getElementById('edit-about-phil-text').value,
            values: Array.from(document.querySelectorAll('#edit-about-values .edit-array-item')).map(el => ({
                icon: el.querySelector('.val-icon').value,
                title: el.querySelector('.val-title').value,
                desc: el.querySelector('.val-desc').value
            }))
        })));
    }

    addValue() {
        const container = document.getElementById('edit-about-values');
        const btn = container.querySelector('.btn-sm');
        const div = document.createElement('div');
        div.className = 'edit-array-item';
        div.innerHTML = `
            <input type="text" placeholder="Icon" value="⭐" class="val-icon" style="width:60px">
            <input type="text" placeholder="Title" value="" class="val-title">
            <input type="text" placeholder="Description" value="" class="val-desc">
            <button class="btn-remove" onclick="this.parentElement.remove()">✕</button>
        `;
        container.insertBefore(div, btn);
    }

    // --- Vision Editor ---
    editVision(data) {
        const html = `
            <div class="edit-form-group">
                <label>Vision Statement</label>
                <textarea id="edit-vision-text" rows="5">${this.esc(data.text)}</textarea>
            </div>
        `;
        this.openModal('Edit Vision', html, () => this.saveSection('vision', () => ({
            text: document.getElementById('edit-vision-text').value
        })));
    }

    // --- Goals Editor ---
    editGoals(data) {
        const html = `
            <div id="edit-goals-list">
                ${(Array.isArray(data) ? data : []).map((g, i) => this.goalItemHtml(g, i)).join('')}
                <button class="btn btn-secondary btn-sm" onclick="editor.addGoal()">+ Add Goal</button>
            </div>
        `;
        this.openModal('Edit Goals', html, () => this.saveSection('goals', () => {
            return Array.from(document.querySelectorAll('#edit-goals-list .edit-goal-item')).map(el => ({
                timeframe: el.querySelector('.goal-tf').value,
                title: el.querySelector('.goal-title').value,
                items: el.querySelector('.goal-items').value.split('\n').filter(l => l.trim()),
                progress: parseInt(el.querySelector('.goal-progress').value) || 0
            }));
        }));
    }

    goalItemHtml(g, i) {
        return `
            <div class="edit-goal-item edit-card">
                <div class="edit-card-header">
                    <input type="text" placeholder="Timeframe" value="${this.esc(g.timeframe)}" class="goal-tf" style="width:100px">
                    <input type="text" placeholder="Title" value="${this.esc(g.title)}" class="goal-title">
                    <input type="number" placeholder="%" value="${g.progress}" class="goal-progress" min="0" max="100" style="width:70px">
                    <button class="btn-remove" onclick="this.closest('.edit-goal-item').remove()">✕</button>
                </div>
                <textarea class="goal-items" rows="4" placeholder="One item per line">${(g.items || []).join('\n')}</textarea>
            </div>
        `;
    }

    addGoal() {
        const container = document.getElementById('edit-goals-list');
        const btn = container.querySelector('.btn-sm');
        const div = document.createElement('div');
        div.innerHTML = this.goalItemHtml({ timeframe: '', title: '', items: [], progress: 0 }, 0);
        container.insertBefore(div.firstElementChild, btn);
    }

    // --- Skills Editor ---
    editSkills(data) {
        const html = `
            <h4 style="margin-bottom:8px">Languages</h4>
            <div id="edit-skills-langs">
                ${(data.languages || []).map((l, i) => `
                    <div class="edit-array-item">
                        <input type="text" placeholder="Name" value="${this.esc(l.name)}" class="sk-name">
                        <select class="sk-level">
                            ${['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(lv =>
            `<option ${l.level === lv ? 'selected' : ''}>${lv}</option>`
        ).join('')}
                        </select>
                        <input type="number" placeholder="%" value="${l.progress}" class="sk-prog" min="0" max="100" style="width:60px">
                        <input type="text" placeholder="Details" value="${this.esc(l.years)}" class="sk-years">
                        <button class="btn-remove" onclick="this.parentElement.remove()">✕</button>
                    </div>
                `).join('')}
                <button class="btn btn-secondary btn-sm" onclick="editor.addSkillLang()">+ Add Language</button>
            </div>
            <h4 style="margin:16px 0 8px">Technologies</h4>
            <div id="edit-skills-tech">
                ${(data.technologies || []).map(t => `
                    <div class="edit-array-item">
                        <input type="text" placeholder="Name" value="${this.esc(t.name)}" class="tech-name">
                        <select class="tech-cat">
                            ${['backend', 'frontend', 'db', 'devops', 'ml', 'security'].map(c =>
            `<option ${t.category === c ? 'selected' : ''}>${c}</option>`
        ).join('')}
                        </select>
                        <button class="btn-remove" onclick="this.parentElement.remove()">✕</button>
                    </div>
                `).join('')}
                <button class="btn btn-secondary btn-sm" onclick="editor.addSkillTech()">+ Add Technology</button>
            </div>
            <h4 style="margin:16px 0 8px">Competencies</h4>
            <div id="edit-skills-comp">
                ${(data.competencies || []).map(c => `
                    <div class="edit-array-item">
                        <input type="text" placeholder="Icon" value="${this.esc(c.icon)}" class="comp-icon" style="width:60px">
                        <input type="text" placeholder="Title" value="${this.esc(c.title)}" class="comp-title">
                        <input type="text" placeholder="Description" value="${this.esc(c.desc)}" class="comp-desc">
                        <button class="btn-remove" onclick="this.parentElement.remove()">✕</button>
                    </div>
                `).join('')}
                <button class="btn btn-secondary btn-sm" onclick="editor.addSkillComp()">+ Add Competency</button>
            </div>
        `;
        this.openModal('Edit Skills', html, () => this.saveSection('skills', () => ({
            languages: Array.from(document.querySelectorAll('#edit-skills-langs .edit-array-item')).map(el => ({
                name: el.querySelector('.sk-name').value,
                level: el.querySelector('.sk-level').value,
                progress: parseInt(el.querySelector('.sk-prog').value) || 0,
                years: el.querySelector('.sk-years').value
            })),
            technologies: Array.from(document.querySelectorAll('#edit-skills-tech .edit-array-item')).map(el => ({
                name: el.querySelector('.tech-name').value,
                category: el.querySelector('.tech-cat').value
            })),
            competencies: Array.from(document.querySelectorAll('#edit-skills-comp .edit-array-item')).map(el => ({
                icon: el.querySelector('.comp-icon').value,
                title: el.querySelector('.comp-title').value,
                desc: el.querySelector('.comp-desc').value
            }))
        })));
    }

    addSkillLang() { this._addArrayItem('edit-skills-langs', `<input type="text" placeholder="Name" class="sk-name"><select class="sk-level"><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option></select><input type="number" placeholder="%" class="sk-prog" min="0" max="100" style="width:60px" value="50"><input type="text" placeholder="Details" class="sk-years"><button class="btn-remove" onclick="this.parentElement.remove()">✕</button>`); }
    addSkillTech() { this._addArrayItem('edit-skills-tech', `<input type="text" placeholder="Name" class="tech-name"><select class="tech-cat"><option>backend</option><option>frontend</option><option>db</option><option>devops</option><option>ml</option><option>security</option></select><button class="btn-remove" onclick="this.parentElement.remove()">✕</button>`); }
    addSkillComp() { this._addArrayItem('edit-skills-comp', `<input type="text" placeholder="Icon" class="comp-icon" style="width:60px" value="⭐"><input type="text" placeholder="Title" class="comp-title"><input type="text" placeholder="Description" class="comp-desc"><button class="btn-remove" onclick="this.parentElement.remove()">✕</button>`); }

    // --- Timeline Editor ---
    editTimeline(data) {
        const arr = Array.isArray(data) ? data : [];
        const html = `
            <div id="edit-timeline-list">
                ${arr.map((yg, yi) => `
                    <div class="edit-card edit-year-group">
                        <div class="edit-card-header">
                            <input type="text" placeholder="Year" value="${this.esc(yg.year)}" class="tl-year" style="width:80px">
                            <button class="btn-remove" onclick="this.closest('.edit-year-group').remove()">✕ Year</button>
                        </div>
                        <div class="tl-events">
                            ${(yg.events || []).map(ev => this.timelineEventHtml(ev)).join('')}
                            <button class="btn btn-secondary btn-sm" onclick="editor.addTimelineEvent(this)">+ Add Event</button>
                        </div>
                    </div>
                `).join('')}
                <button class="btn btn-secondary btn-sm" onclick="editor.addTimelineYear()">+ Add Year</button>
            </div>
        `;
        this.openModal('Edit Timeline', html, () => this.saveSection('timeline', () => {
            return Array.from(document.querySelectorAll('#edit-timeline-list .edit-year-group')).map(yg => ({
                year: yg.querySelector('.tl-year').value,
                events: Array.from(yg.querySelectorAll('.tl-event')).map(ev => ({
                    date: ev.querySelector('.ev-date').value,
                    title: ev.querySelector('.ev-title').value,
                    desc: ev.querySelector('.ev-desc').value,
                    type: ev.querySelector('.ev-type').value,
                    tag: ev.querySelector('.ev-tag').value
                }))
            }));
        }));
    }

    timelineEventHtml(ev = {}) {
        return `
            <div class="edit-array-item tl-event">
                <input type="text" placeholder="Date" value="${this.esc(ev.date || '')}" class="ev-date" style="width:100px">
                <input type="text" placeholder="Title" value="${this.esc(ev.title || '')}" class="ev-title">
                <input type="text" placeholder="Description" value="${this.esc(ev.desc || '')}" class="ev-desc">
                <select class="ev-type">
                    ${['achievement', 'learning', 'struggle'].map(t => `<option ${ev.type === t ? 'selected' : ''}>${t}</option>`).join('')}
                </select>
                <input type="text" placeholder="Tag e.g. 🏆 Achievement" value="${this.esc(ev.tag || '')}" class="ev-tag" style="width:140px">
                <button class="btn-remove" onclick="this.parentElement.remove()">✕</button>
            </div>
        `;
    }

    addTimelineYear() {
        const container = document.getElementById('edit-timeline-list');
        const btn = container.querySelector(':scope > .btn-sm');
        const div = document.createElement('div');
        div.className = 'edit-card edit-year-group';
        div.innerHTML = `
            <div class="edit-card-header">
                <input type="text" placeholder="Year" value="${new Date().getFullYear()}" class="tl-year" style="width:80px">
                <button class="btn-remove" onclick="this.closest('.edit-year-group').remove()">✕ Year</button>
            </div>
            <div class="tl-events">
                <button class="btn btn-secondary btn-sm" onclick="editor.addTimelineEvent(this)">+ Add Event</button>
            </div>
        `;
        container.insertBefore(div, btn);
    }

    addTimelineEvent(btnEl) {
        const eventsContainer = btnEl.parentElement;
        const div = document.createElement('div');
        div.innerHTML = this.timelineEventHtml();
        eventsContainer.insertBefore(div.firstElementChild, btnEl);
    }

    // --- Learning Editor ---
    editLearning(data) {
        const html = `
            <h4 style="margin-bottom:8px">📖 Books</h4>
            <div id="edit-learn-books">
                ${(data.books || []).map(b => `
                    <div class="edit-array-item">
                        <input type="text" placeholder="Emoji" value="${this.esc(b.emoji)}" class="bk-emoji" style="width:50px">
                        <input type="text" placeholder="Title" value="${this.esc(b.title)}" class="bk-title">
                        <input type="text" placeholder="Author" value="${this.esc(b.author)}" class="bk-author">
                        <input type="number" placeholder="%" value="${b.progress}" class="bk-prog" min="0" max="100" style="width:60px">
                        <input type="text" placeholder="Chapter text" value="${this.esc(b.chapter_text)}" class="bk-ch">
                        <button class="btn-remove" onclick="this.parentElement.remove()">✕</button>
                    </div>
                `).join('')}
                <button class="btn btn-secondary btn-sm" onclick="editor.addBook()">+ Add Book</button>
            </div>
            <h4 style="margin:16px 0 8px">🎓 Courses</h4>
            <div id="edit-learn-courses">
                ${(data.courses || []).map(c => `
                    <div class="edit-array-item">
                        <input type="text" placeholder="Title" value="${this.esc(c.title)}" class="co-title">
                        <input type="text" placeholder="Provider" value="${this.esc(c.provider)}" class="co-prov">
                        <select class="co-status">
                            ${['completed', 'in-progress', 'planned'].map(s => `<option ${c.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                        </select>
                        <button class="btn-remove" onclick="this.parentElement.remove()">✕</button>
                    </div>
                `).join('')}
                <button class="btn btn-secondary btn-sm" onclick="editor.addCourse()">+ Add Course</button>
            </div>
            <h4 style="margin:16px 0 8px">📊 Stats</h4>
            <div id="edit-learn-stats">
                ${(data.stats || []).map(s => `
                    <div class="edit-array-item">
                        <input type="text" placeholder="Value" value="${this.esc(s.value)}" class="ls-val" style="width:80px">
                        <input type="text" placeholder="Label" value="${this.esc(s.label)}" class="ls-label">
                        <button class="btn-remove" onclick="this.parentElement.remove()">✕</button>
                    </div>
                `).join('')}
                <button class="btn btn-secondary btn-sm" onclick="editor.addLearnStat()">+ Add Stat</button>
            </div>
        `;
        this.openModal('Edit Learning', html, () => this.saveSection('learning', () => ({
            books: Array.from(document.querySelectorAll('#edit-learn-books .edit-array-item')).map(el => ({
                emoji: el.querySelector('.bk-emoji').value,
                title: el.querySelector('.bk-title').value,
                author: el.querySelector('.bk-author').value,
                progress: parseInt(el.querySelector('.bk-prog').value) || 0,
                chapter_text: el.querySelector('.bk-ch').value
            })),
            courses: Array.from(document.querySelectorAll('#edit-learn-courses .edit-array-item')).map(el => ({
                title: el.querySelector('.co-title').value,
                provider: el.querySelector('.co-prov').value,
                status: el.querySelector('.co-status').value
            })),
            stats: Array.from(document.querySelectorAll('#edit-learn-stats .edit-array-item')).map(el => ({
                value: el.querySelector('.ls-val').value,
                label: el.querySelector('.ls-label').value
            }))
        })));
    }

    addBook() { this._addArrayItem('edit-learn-books', `<input type="text" placeholder="Emoji" class="bk-emoji" style="width:50px" value="📕"><input type="text" placeholder="Title" class="bk-title"><input type="text" placeholder="Author" class="bk-author"><input type="number" placeholder="%" class="bk-prog" min="0" max="100" style="width:60px" value="0"><input type="text" placeholder="Chapter text" class="bk-ch"><button class="btn-remove" onclick="this.parentElement.remove()">✕</button>`); }
    addCourse() { this._addArrayItem('edit-learn-courses', `<input type="text" placeholder="Title" class="co-title"><input type="text" placeholder="Provider" class="co-prov"><select class="co-status"><option>completed</option><option>in-progress</option><option>planned</option></select><button class="btn-remove" onclick="this.parentElement.remove()">✕</button>`); }
    addLearnStat() { this._addArrayItem('edit-learn-stats', `<input type="text" placeholder="Value" class="ls-val" style="width:80px"><input type="text" placeholder="Label" class="ls-label"><button class="btn-remove" onclick="this.parentElement.remove()">✕</button>`); }

    // --- Achievements Editor ---
    editAchievements(data) {
        const html = `
            <h4 style="margin-bottom:8px">🎖️ Certifications</h4>
            <div id="edit-ach-certs">
                ${(data.certifications || []).map(c => `
                    <div class="edit-array-item">
                        <input type="text" placeholder="Badge" value="${this.esc(c.badge)}" class="ac-badge" style="width:50px">
                        <input type="text" placeholder="Title" value="${this.esc(c.title)}" class="ac-title">
                        <input type="text" placeholder="Description" value="${this.esc(c.desc)}" class="ac-desc">
                        <input type="text" placeholder="Date" value="${this.esc(c.date)}" class="ac-date" style="width:120px">
                        <label class="ac-ip-label"><input type="checkbox" class="ac-ip" ${c.in_progress ? 'checked' : ''}> In Progress</label>
                        <button class="btn-remove" onclick="this.parentElement.remove()">✕</button>
                    </div>
                `).join('')}
                <button class="btn btn-secondary btn-sm" onclick="editor.addCert()">+ Add Certification</button>
            </div>
            <h4 style="margin:16px 0 8px">🏅 Competitions</h4>
            <div id="edit-ach-comp">
                ${(data.competitions || []).map(c => `
                    <div class="edit-array-item">
                        <input type="text" placeholder="Icon" value="${this.esc(c.icon)}" class="cp-icon" style="width:50px">
                        <input type="text" placeholder="Title" value="${this.esc(c.title)}" class="cp-title">
                        <input type="text" placeholder="Description" value="${this.esc(c.desc)}" class="cp-desc">
                        <input type="text" placeholder="Date" value="${this.esc(c.date)}" class="cp-date" style="width:120px">
                        <button class="btn-remove" onclick="this.parentElement.remove()">✕</button>
                    </div>
                `).join('')}
                <button class="btn btn-secondary btn-sm" onclick="editor.addCompetition()">+ Add Competition</button>
            </div>
            <h4 style="margin:16px 0 8px">🎓 Academic</h4>
            <div id="edit-ach-acad">
                ${(data.academic || []).map(a => `
                    <div class="edit-array-item">
                        <input type="text" placeholder="Icon" value="${this.esc(a.icon)}" class="aa-icon" style="width:50px">
                        <input type="text" placeholder="Title" value="${this.esc(a.title)}" class="aa-title">
                        <input type="text" placeholder="Description" value="${this.esc(a.desc)}" class="aa-desc">
                        <input type="text" placeholder="Date" value="${this.esc(a.date)}" class="aa-date" style="width:120px">
                        <button class="btn-remove" onclick="this.parentElement.remove()">✕</button>
                    </div>
                `).join('')}
                <button class="btn btn-secondary btn-sm" onclick="editor.addAcademic()">+ Add Academic</button>
            </div>
        `;
        this.openModal('Edit Achievements', html, () => this.saveSection('achievements', () => ({
            certifications: Array.from(document.querySelectorAll('#edit-ach-certs .edit-array-item')).map(el => ({
                badge: el.querySelector('.ac-badge').value,
                title: el.querySelector('.ac-title').value,
                desc: el.querySelector('.ac-desc').value,
                date: el.querySelector('.ac-date').value,
                in_progress: el.querySelector('.ac-ip').checked
            })),
            competitions: Array.from(document.querySelectorAll('#edit-ach-comp .edit-array-item')).map(el => ({
                icon: el.querySelector('.cp-icon').value,
                title: el.querySelector('.cp-title').value,
                desc: el.querySelector('.cp-desc').value,
                date: el.querySelector('.cp-date').value
            })),
            academic: Array.from(document.querySelectorAll('#edit-ach-acad .edit-array-item')).map(el => ({
                icon: el.querySelector('.aa-icon').value,
                title: el.querySelector('.aa-title').value,
                desc: el.querySelector('.aa-desc').value,
                date: el.querySelector('.aa-date').value
            }))
        })));
    }

    addCert() { this._addArrayItem('edit-ach-certs', `<input type="text" placeholder="Badge" class="ac-badge" style="width:50px" value="🏅"><input type="text" placeholder="Title" class="ac-title"><input type="text" placeholder="Description" class="ac-desc"><input type="text" placeholder="Date" class="ac-date" style="width:120px"><label class="ac-ip-label"><input type="checkbox" class="ac-ip"> In Progress</label><button class="btn-remove" onclick="this.parentElement.remove()">✕</button>`); }
    addCompetition() { this._addArrayItem('edit-ach-comp', `<input type="text" placeholder="Icon" class="cp-icon" style="width:50px" value="🏅"><input type="text" placeholder="Title" class="cp-title"><input type="text" placeholder="Description" class="cp-desc"><input type="text" placeholder="Date" class="cp-date" style="width:120px"><button class="btn-remove" onclick="this.parentElement.remove()">✕</button>`); }
    addAcademic() { this._addArrayItem('edit-ach-acad', `<input type="text" placeholder="Icon" class="aa-icon" style="width:50px" value="📊"><input type="text" placeholder="Title" class="aa-title"><input type="text" placeholder="Description" class="aa-desc"><input type="text" placeholder="Date" class="aa-date" style="width:120px"><button class="btn-remove" onclick="this.parentElement.remove()">✕</button>`); }

    // --- Projects Editor (full phase + project management) ---
    editProjects(data) {
        const html = `
            <div class="edit-form-group">
                <label>Current Phase Name</label>
                <input type="text" id="edit-cp-name" value="${this.esc(data.current_phase?.name || '')}">
            </div>
            <div class="edit-form-group">
                <label>Current Phase Quote</label>
                <input type="text" id="edit-cp-quote" value="${this.esc(data.current_phase?.quote || '')}">
            </div>
            <div class="edit-form-group">
                <label>Overall Progress %</label>
                <input type="number" id="edit-cp-progress" value="${data.current_phase?.progress || 0}" min="0" max="100">
            </div>
            <hr style="margin:16px 0;border-color:var(--border)">
            <h4 style="margin-bottom:8px">🗂️ Phases &amp; Projects</h4>
            <div id="edit-phases-list">
                ${(data.phases || []).map((ph, pi) => this.phaseHtml(ph, pi)).join('')}
                <button class="btn btn-secondary btn-sm" onclick="editor.addPhase()">+ Add Phase</button>
            </div>
        `;
        this.openModal('Edit Projects', html, () => this.saveSection('projects', () => {
            const updated = { ...contentManager.data.projects };
            updated.current_phase = {
                ...updated.current_phase,
                name: document.getElementById('edit-cp-name').value,
                quote: document.getElementById('edit-cp-quote').value,
                progress: parseInt(document.getElementById('edit-cp-progress').value) || 0
            };
            updated.phases = Array.from(document.querySelectorAll('#edit-phases-list .edit-phase-item')).map(phEl => ({
                badge: phEl.querySelector('.ph-badge').value,
                name: phEl.querySelector('.ph-name').value,
                desc: phEl.querySelector('.ph-desc').value,
                completion: phEl.querySelector('.ph-completion').value,
                is_active: phEl.querySelector('.ph-active').checked,
                is_locked: phEl.querySelector('.ph-locked').checked,
                roadmap_progress: parseInt(phEl.querySelector('.ph-progress').value) || 0,
                projects: Array.from(phEl.querySelectorAll('.edit-proj-item')).map(prEl => ({
                    name: prEl.querySelector('.pr-name').value,
                    tech: prEl.querySelector('.pr-tech').value,
                    status: prEl.querySelector('.pr-status').value
                }))
            }));
            return updated;
        }));
    }

    phaseHtml(ph, pi) {
        return `
            <div class="edit-card edit-phase-item" style="margin-bottom:12px">
                <div class="edit-card-header" style="flex-wrap:wrap;gap:6px">
                    <input type="text" placeholder="Badge e.g. Phase 0" value="${this.esc(ph.badge)}" class="ph-badge" style="width:90px">
                    <input type="text" placeholder="Name" value="${this.esc(ph.name)}" class="ph-name" style="flex:1;min-width:120px">
                    <input type="text" placeholder="Desc" value="${this.esc(ph.desc)}" class="ph-desc" style="flex:1;min-width:120px">
                    <input type="text" placeholder="Completion text" value="${this.esc(ph.completion)}" class="ph-completion" style="width:160px">
                    <input type="number" placeholder="%" value="${ph.roadmap_progress || 0}" class="ph-progress" min="0" max="100" style="width:55px">
                    <label style="font-size:0.8rem;white-space:nowrap"><input type="checkbox" class="ph-active" ${ph.is_active ? 'checked' : ''}> Active</label>
                    <label style="font-size:0.8rem;white-space:nowrap"><input type="checkbox" class="ph-locked" ${ph.is_locked ? 'checked' : ''}> Locked</label>
                    <button class="btn-remove" onclick="this.closest('.edit-phase-item').remove()">✕ Phase</button>
                </div>
                <div class="tl-events" style="margin-top:8px">
                    <div class="ph-projects">
                        ${(ph.projects || []).map(pr => this.projHtml(pr)).join('')}
                    </div>
                    <button class="btn btn-secondary btn-sm" onclick="editor.addProjectToPhase(this)">+ Add Project</button>
                </div>
            </div>
        `;
    }

    projHtml(pr = {}) {
        return `
            <div class="edit-array-item edit-proj-item">
                <input type="text" placeholder="Name" value="${this.esc(pr.name || '')}" class="pr-name">
                <input type="text" placeholder="Tech" value="${this.esc(pr.tech || '')}" class="pr-tech" style="width:100px">
                <select class="pr-status">
                    ${['planned', 'active', 'completed'].map(s =>
            `<option ${pr.status === s ? 'selected' : ''}>${s}</option>`
        ).join('')}
                </select>
                <button class="btn-remove" onclick="this.parentElement.remove()">✕</button>
            </div>
        `;
    }

    addPhase() {
        const container = document.getElementById('edit-phases-list');
        const btn = container.querySelector(':scope > .btn-sm');
        const div = document.createElement('div');
        div.innerHTML = this.phaseHtml({ badge: 'Phase ?', name: '', desc: '', completion: '', is_active: false, is_locked: false, roadmap_progress: 0, projects: [] }, 0);
        container.insertBefore(div.firstElementChild, btn);
    }

    addProjectToPhase(btnEl) {
        const projContainer = btnEl.previousElementSibling;
        const div = document.createElement('div');
        div.innerHTML = this.projHtml();
        projContainer.appendChild(div.firstElementChild);
    }

    // --- Ups & Downs Editor ---
    editUpsDowns(data) {
        const html = `
            <div id="edit-updown-list">
                ${(data || []).map(item => `
                    <div class="edit-array-item">
                        <select class="ud-type">
                            <option ${item.type === 'up' ? 'selected' : ''}>up</option>
                            <option ${item.type === 'down' ? 'selected' : ''}>down</option>
                        </select>
                        <input type="text" placeholder="What happened?" value="${this.esc(item.text)}" class="ud-text">
                        <button class="btn-remove" onclick="this.parentElement.remove()">✕</button>
                    </div>
                `).join('')}
                <button class="btn btn-secondary btn-sm" onclick="editor.addUpsDownsItem()">+ Add Item</button>
            </div>
        `;
        this.openModal('Edit Ups & Downs', html, () => this.saveSection('ups_downs', () => {
            return Array.from(document.querySelectorAll('#edit-updown-list .edit-array-item')).map(el => ({
                type: el.querySelector('.ud-type').value,
                text: el.querySelector('.ud-text').value
            }));
        }));
    }

    addUpsDownsItem() {
        this._addArrayItem('edit-updown-list',
            `<select class="ud-type"><option>up</option><option>down</option></select><input type="text" placeholder="What happened?" class="ud-text"><button class="btn-remove" onclick="this.parentElement.remove()">✕</button>`);
    }

    // --- Footer Editor ---
    editFooter(data) {
        const html = `
            <div class="edit-form-group">
                <label>Tagline</label>
                <input type="text" id="edit-footer-tagline" value="${this.esc(data.tagline)}">
            </div>
            <div class="edit-form-group">
                <label>Description</label>
                <input type="text" id="edit-footer-desc" value="${this.esc(data.description)}">
            </div>
            <div id="edit-footer-links">
                <label>Social Links</label>
                ${(data.social_links || []).map(s => `
                    <div class="edit-array-item">
                        <input type="text" placeholder="Name" value="${this.esc(s.name)}" class="fl-name">
                        <input type="text" placeholder="URL" value="${this.esc(s.url)}" class="fl-url">
                        <button class="btn-remove" onclick="this.parentElement.remove()">✕</button>
                    </div>
                `).join('')}
                <button class="btn btn-secondary btn-sm" onclick="editor.addFooterLink()">+ Add Link</button>
            </div>
        `;
        this.openModal('Edit Footer', html, () => this.saveSection('footer', () => ({
            tagline: document.getElementById('edit-footer-tagline').value,
            description: document.getElementById('edit-footer-desc').value,
            social_links: Array.from(document.querySelectorAll('#edit-footer-links .edit-array-item')).map(el => ({
                name: el.querySelector('.fl-name').value,
                url: el.querySelector('.fl-url').value
            }))
        })));
    }

    addFooterLink() { this._addArrayItem('edit-footer-links', `<input type="text" placeholder="Name" class="fl-name"><input type="text" placeholder="URL" class="fl-url"><button class="btn-remove" onclick="this.parentElement.remove()">✕</button>`); }

    // --- Helpers ---
    esc(str) {
        if (!str) return '';
        const el = document.createElement('span');
        el.textContent = str;
        return el.innerHTML;
    }

    _addArrayItem(containerId, innerHtml) {
        const container = document.getElementById(containerId);
        const btn = container.querySelector('.btn-sm');
        const div = document.createElement('div');
        div.className = 'edit-array-item';
        div.innerHTML = innerHtml;
        container.insertBefore(div, btn);
    }
}

// Global editor instance
const editor = new Editor();
