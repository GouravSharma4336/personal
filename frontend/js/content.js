/**
 * Personal Operating System - Content Manager
 * Loads all editable content from API and renders each section dynamically.
 */

class ContentManager {
    constructor() {
        this.data = {};
    }

    async loadAll() {
        try {
            const resp = await fetch('/api/content');
            if (!resp.ok) throw new Error('Failed to load content');
            this.data = await resp.json();
            this.renderAll();
        } catch (e) {
            console.error('Content load error:', e);
        }
    }

    renderAll() {
        this.renderHero();
        this.renderAbout();
        this.renderVision();
        this.renderGoals();
        this.renderProjects();
        this.renderSkills();
        this.renderTimeline();
        this.renderLearning();
        this.renderAchievements();
        this.renderFooter();
        this.renderUpsDowns();
        // New modules
        this.renderProofOfWork();
        this.renderSkillMatrix();
        this.renderStrategicRoadmap();
        this.renderPerformanceMetrics();
        this.renderResearchLog();
        this.renderFailureLog();
        this.renderTechnicalDebt();
        this.renderEnergyLeak();
        this.renderLeverageTracker();
        this.renderBenchmarking();
        this.renderPublicImpact();
        this.renderKnowledgeGraph();
        this.initDebugTabs();
    }

    // --- Hero ---
    renderHero() {
        const h = this.data.hero;
        if (!h) return;
        const el = document.getElementById('hero-dynamic');
        if (!el) return;
        el.innerHTML = `
            <p class="hero-greeting animate-fade-up">${h.greeting}</p>
            <h1 class="hero-name animate-fade-up delay-1">${h.name}</h1>
            <p class="hero-tagline animate-fade-up delay-2">${h.tagline}</p>
            <div class="hero-stats animate-fade-up delay-3">
                <div class="hero-stat">
                    <span class="stat-value" id="home-streak">0</span>
                    <span class="stat-label">Day Streak</span>
                </div>
                <div class="hero-stat">
                    <span class="stat-value" id="home-entries">0</span>
                    <span class="stat-label">Entries</span>
                </div>
                ${(h.stats || []).map(s => `
                    <div class="hero-stat">
                        <span class="stat-value">${s.value}</span>
                        <span class="stat-label">${s.label}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // --- About ---
    renderAbout() {
        const a = this.data.about;
        if (!a) return;
        const el = document.getElementById('about-dynamic');
        if (!el) return;
        el.innerHTML = `
            <h3>🧑‍💻 About Me</h3>
            <div class="about-content">
                <p class="about-story">${a.story}</p>
                <div class="about-philosophy">
                    <h4>${a.philosophy_title}</h4>
                    <p>${a.philosophy_text}</p>
                </div>
                <div class="about-values">
                    ${(a.values || []).map(v => `
                        <div class="value-item">
                            <span class="value-icon">${v.icon}</span>
                            <div>
                                <strong>${v.title}</strong>
                                <p>${v.desc}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // --- Vision ---
    renderVision() {
        const v = this.data.vision;
        if (!v) return;
        const el = document.getElementById('vision-dynamic');
        if (!el) return;
        el.innerHTML = `
            <div class="card glass-card vision-card-inline">
                <div class="vision-header">
                    <span class="vision-icon">🎯</span>
                    <h3>My Vision</h3>
                </div>
                <p class="vision-text">${v.text}</p>
            </div>
        `;
    }

    // --- Goals ---
    renderGoals() {
        const goals = this.data.goals;
        if (!goals || !Array.isArray(goals)) return;
        const el = document.getElementById('goals-dynamic');
        if (!el) return;
        el.innerHTML = `
            <h3 class="section-title">🎯 Long-Term Goals</h3>
            <div class="goals-grid">
                ${goals.map(g => `
                    <div class="goal-card glass-card">
                        <span class="goal-timeframe">${g.timeframe}</span>
                        <h4>${g.title}</h4>
                        <ul>${(g.items || []).map(i => `<li>${i}</li>`).join('')}</ul>
                        <div class="goal-progress">
                            <div class="progress-bar-fill" style="width: ${g.progress}%"></div>
                        </div>
                        <span class="progress-text">${g.progress}% Complete</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // --- Projects ---
    renderProjects() {
        const p = this.data.projects;
        if (!p) return;

        // ---- Compute derived stats from actual phase data ----
        let computedTotal = 0, computedActive = 0, computedDone = 0;
        (p.phases || []).forEach(ph => {
            (ph.projects || []).forEach(proj => {
                computedTotal++;
                if (proj.status === 'active') computedActive++;
                if (proj.status === 'completed') computedDone++;
            });
        });
        // Fall back to stored values if phases have no individual projects listed
        const total = computedTotal > 0 ? computedTotal : (p.total || 0);
        const active = computedTotal > 0 ? computedActive : (p.active || 0);
        const done = computedTotal > 0 ? computedDone : (p.done || 0);
        const phaseCount = (p.phases || []).length;

        // Update dynamic subtitle
        const subtitleEl = document.getElementById('projects-subtitle');
        if (subtitleEl) {
            subtitleEl.textContent = `${total} projects across ${phaseCount} phases — from fundamentals to world-class`;
        }

        // Render header stats
        const statsEl = document.getElementById('project-stats-dynamic');
        if (statsEl) {
            statsEl.innerHTML = `
                <div class="project-stat"><span class="stat-num">${total}</span><span>Total</span></div>
                <div class="project-stat active"><span class="stat-num">${active}</span><span>Active</span></div>
                <div class="project-stat completed"><span class="stat-num">${done}</span><span>Done</span></div>
            `;
        }
        // Render roadmap overview
        const roadmapEl = document.getElementById('roadmap-dynamic');
        if (roadmapEl) {
            roadmapEl.innerHTML = (p.phases || []).map(ph => `
                <div class="roadmap-phase ${ph.is_active ? 'active' : ''} ${ph.is_locked ? 'locked' : ''}">
                    <span class="phase-num">${ph.badge.replace('Phase ', '')}</span>
                    <span class="phase-name">${ph.name.replace(/^[^\s]+\s/, '')}</span>
                    <div class="mini-progress"><div style="width:${ph.roadmap_progress}%"></div></div>
                    <span class="phase-pct">${ph.roadmap_progress}%</span>
                </div>
            `).join('');
        }
        // Render phase cards
        const phasesEl = document.getElementById('phases-dynamic');
        if (phasesEl) {
            phasesEl.innerHTML = (p.phases || []).map(ph => {
                const statusIcon = s => s === 'active' ? '🔄' : s === 'completed' ? '✅' : '📋';
                return `
                <div class="phase-card ${ph.is_active ? 'phase-0' : ''} ${ph.is_locked ? 'phase-locked' : ''}">
                    <div class="phase-header">
                        <div class="phase-badge">${ph.badge}</div>
                        <h3>${ph.name}</h3>
                        <p class="phase-desc">${ph.desc}</p>
                        <span class="phase-completion">${ph.completion}</span>
                    </div>
                    ${ph.projects && ph.projects.length ? `
                    <div class="projects-grid">
                        ${ph.projects.map(proj => `
                            <div class="project-item status-${proj.status}">
                                <span class="project-status">${statusIcon(proj.status)}</span>
                                <span class="project-name">${proj.name}</span>
                                <span class="project-tech">${proj.tech}</span>
                            </div>
                        `).join('')}
                    </div>` : ''}
                </div>`;
            }).join('');
        }

        // Render current phase bar (computed from active count)
        const cpEl = document.getElementById('current-phase-dynamic');
        if (cpEl && p.current_phase) {
            const cp = p.current_phase;
            cpEl.innerHTML = `
                <h3>🧱 Current Focus: ${cp.name}</h3>
                <p class="phase-quote">"${cp.quote}"</p>
                <div class="phase-progress-bar">
                    <div class="progress-bar-fill" style="width: ${cp.progress}%"></div>
                </div>
                <div class="phase-stats">
                    <span>${active} / ${total} Projects Started</span>
                    <span>~${cp.progress}% Overall Progress</span>
                </div>
            `;
        }
    }

    // --- Skills ---
    renderSkills() {
        const s = this.data.skills;
        if (!s) return;
        const langEl = document.getElementById('skills-languages-dynamic');
        if (langEl) {
            langEl.innerHTML = (s.languages || []).map(l => `
                <div class="skill-item">
                    <div class="skill-header">
                        <span class="skill-name">${l.name}</span>
                        <span class="skill-level ${l.level.toLowerCase()}">${l.level}</span>
                    </div>
                    <div class="skill-bar"><div class="skill-fill" style="width:${l.progress}%"></div></div>
                    <span class="skill-years">${l.years}</span>
                </div>
            `).join('');
        }
        const techEl = document.getElementById('skills-tech-dynamic');
        if (techEl) {
            techEl.innerHTML = (s.technologies || []).map(t =>
                `<span class="tech-tag category-${t.category}">${t.name}</span>`
            ).join('');
        }
        const compEl = document.getElementById('skills-comp-dynamic');
        if (compEl) {
            compEl.innerHTML = (s.competencies || []).map(c => `
                <div class="competency-card">
                    <span class="comp-icon">${c.icon}</span>
                    <h4>${c.title}</h4>
                    <p>${c.desc}</p>
                </div>
            `).join('');
        }
    }

    // --- Timeline ---
    renderTimeline() {
        const t = this.data.timeline;
        if (!t || !Array.isArray(t)) return;
        const el = document.getElementById('timeline-dynamic');
        if (!el) return;
        el.innerHTML = t.map(yearGroup => `
            <div class="timeline-year">
                <div class="year-marker">${yearGroup.year}</div>
                <div class="timeline-events">
                    ${(yearGroup.events || []).map(ev => `
                        <div class="timeline-event ${ev.type}">
                            <div class="event-dot"></div>
                            <div class="event-content">
                                <span class="event-date">${ev.date}</span>
                                <h4>${ev.title}</h4>
                                <p>${ev.desc}</p>
                                <span class="event-tag">${ev.tag}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // --- Learning ---
    renderLearning() {
        const l = this.data.learning;
        if (!l) return;
        const booksEl = document.getElementById('learning-books-dynamic');
        if (booksEl) {
            booksEl.innerHTML = (l.books || []).map(b => `
                <div class="book-card">
                    <div class="book-cover">${b.emoji}</div>
                    <div class="book-info">
                        <h4>${b.title}</h4>
                        <p class="book-author">${b.author}</p>
                        <div class="book-progress">
                            <div class="progress-bar-fill" style="width:${b.progress}%"></div>
                        </div>
                        <span class="progress-text">${b.chapter_text}</span>
                    </div>
                </div>
            `).join('');
        }
        const coursesEl = document.getElementById('learning-courses-dynamic');
        if (coursesEl) {
            coursesEl.innerHTML = (l.courses || []).map(c => {
                const icon = c.status === 'completed' ? '✅' : c.status === 'in-progress' ? '🔄' : '📋';
                return `
                <div class="course-item ${c.status}">
                    <span class="course-status">${icon}</span>
                    <div class="course-info">
                        <h4>${c.title}</h4>
                        <p>${c.provider}</p>
                    </div>
                </div>`;
            }).join('');
        }
        const statsEl = document.getElementById('learning-stats-dynamic');
        if (statsEl) {
            // Auto-compute derived stats from the actual data
            const booksInProgress = (l.books || []).length;
            const coursesCompleted = (l.courses || []).filter(c => c.status === 'completed').length;

            // Merge computed values into the stats array (override the first two by label)
            const mergedStats = (l.stats || []).map(s => {
                if (s.label === 'Books in Progress') return { ...s, value: String(booksInProgress) };
                if (s.label === 'Courses Completed') return { ...s, value: String(coursesCompleted) };
                return s;
            });

            statsEl.innerHTML = mergedStats.map(s => `
                <div class="stat-box">
                    <span class="stat-num">${s.value}</span>
                    <span>${s.label}</span>
                </div>
            `).join('');
        }
    }

    // --- Achievements ---
    renderAchievements() {
        const a = this.data.achievements;
        if (!a) return;
        const certsEl = document.getElementById('achievements-certs-dynamic');
        if (certsEl) {
            certsEl.innerHTML = (a.certifications || []).map(c => `
                <div class="cert-card ${c.in_progress ? 'in-progress' : ''}">
                    <div class="cert-badge">${c.badge}</div>
                    <div class="cert-info">
                        <h4>${c.title}</h4>
                        <p>${c.desc}</p>
                        <span class="cert-date">${c.date}</span>
                    </div>
                </div>
            `).join('');
        }
        const compEl = document.getElementById('achievements-comp-dynamic');
        if (compEl) {
            compEl.innerHTML = (a.competitions || []).map(c => `
                <div class="achievement-item">
                    <span class="achievement-icon">${c.icon}</span>
                    <div class="achievement-info">
                        <h4>${c.title}</h4>
                        <p>${c.desc}</p>
                        <span class="achievement-date">${c.date}</span>
                    </div>
                </div>
            `).join('');
        }
        const acadEl = document.getElementById('achievements-acad-dynamic');
        if (acadEl) {
            acadEl.innerHTML = (a.academic || []).map(a => `
                <div class="achievement-item">
                    <span class="achievement-icon">${a.icon}</span>
                    <div class="achievement-info">
                        <h4>${a.title}</h4>
                        <p>${a.desc}</p>
                        <span class="achievement-date">${a.date}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    // --- Footer ---
    renderFooter() {
        const f = this.data.footer;
        if (!f) return;
        const el = document.getElementById('footer-dynamic');
        if (!el) return;
        el.innerHTML = `
            <div class="footer-brand">
                <span>${f.tagline}</span>
                <p>${f.description}</p>
            </div>
            <div class="footer-links">
                <a href="#" onclick="app.navigateTo('home')">Home</a>
                <a href="#" onclick="app.navigateTo('projects')">Projects</a>
                <a href="#" onclick="app.navigateTo('journal')">Journal</a>
                <a href="#" onclick="app.navigateTo('timeline')">Timeline</a>
            </div>
            <div class="footer-social">
                ${(f.social_links || []).map(s =>
            `<a href="${s.url}" target="_blank" rel="noopener" class="social-link">${s.name}</a>`
        ).join('')}
            </div>
        `;
    }
    // --- Ups & Downs ---
    renderUpsDowns() {
        const items = this.data.ups_downs;
        if (!items || !Array.isArray(items)) return;
        const el = document.getElementById('ups-downs-dynamic');
        if (!el) return;
        el.innerHTML = `
            <h3>Recent Ups & Downs</h3>
            <div class="ups-downs-mini">
                ${items.map(item => `
                    <div class="ud-item ${item.type}">
                        <span class="ud-type">${item.type === 'up' ? '↑' : '↓'}</span>
                        <p>${item.text}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // --- Proof of Work ---
    renderProofOfWork() {
        const p = this.data.proof_of_work;
        if (!p) return;
        const el = document.getElementById('pow-dynamic');
        if (!el) return;
        const t = p.totals || {};
        const latest = (p.weekly_log || [])[0] || {};
        el.innerHTML = `
            <h3>⚡ Proof of Work</h3>
            <div class="pow-grid">
                <div class="pow-stat"><span class="pow-val">${t.all_time_commits || 0}</span><span class="pow-label">Total Commits</span></div>
                <div class="pow-stat"><span class="pow-val">${(t.all_time_loc || 0).toLocaleString()}</span><span class="pow-label">Lines Written</span></div>
                <div class="pow-stat"><span class="pow-val">${t.public_repos || 0}</span><span class="pow-label">Public Repos</span></div>
                <div class="pow-stat"><span class="pow-val">${t.bugs_fixed || 0}</span><span class="pow-label">Bugs Fixed</span></div>
                <div class="pow-stat"><span class="pow-val">${latest.git_commits || 0}</span><span class="pow-label">Commits (This Week)</span></div>
                <div class="pow-stat"><span class="pow-val">${latest.docs_pages || 0}</span><span class="pow-label">Docs Written (This Week)</span></div>
            </div>
            ${latest.notes ? `<p class="pow-notes">📝 ${latest.notes}</p>` : ''}
        `;
    }

    // --- Skill Matrix ---
    renderSkillMatrix() {
        const s = this.data.skill_matrix;
        if (!s) return;
        const tableEl = document.getElementById('skill-matrix-dynamic');
        if (tableEl) {
            const colorFor = (val) => {
                if (val >= 70) return 'depth-high';
                if (val >= 40) return 'depth-mid';
                if (val >= 20) return 'depth-low';
                return 'depth-zero';
            };
            tableEl.innerHTML = `
                <h3>Core CS Domain Matrix</h3>
                <p class="matrix-legend">Knowledge (K) · Implementation (I) · Optimization (O) · Teaching (T)</p>
                <div class="skill-matrix-wrapper">
                <table class="skill-matrix-table">
                    <thead>
                        <tr>
                            <th>Domain</th>
                            <th>K</th>
                            <th>I</th>
                            <th>O</th>
                            <th>T</th>
                            <th>Avg</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(s.domains || []).map(d => {
                const avg = Math.round((d.knowledge + d.implementation + d.optimization + d.teaching) / 4);
                return `<tr>
                                <td class="domain-name">${d.name}</td>
                                <td class="${colorFor(d.knowledge)}">${d.knowledge}</td>
                                <td class="${colorFor(d.implementation)}">${d.implementation}</td>
                                <td class="${colorFor(d.optimization)}">${d.optimization}</td>
                                <td class="${colorFor(d.teaching)}">${d.teaching}</td>
                                <td class="avg-col">${avg}</td>
                            </tr>`;
            }).join('')}
                    </tbody>
                </table>
                </div>
            `;
        }
        const breakdownEl = document.getElementById('mastery-breakdown-dynamic');
        if (breakdownEl && s.mastery_breakdown) {
            const mb = s.mastery_breakdown;
            breakdownEl.innerHTML = `
                <h3>Mastery Breakdown</h3>
                <div class="mastery-bars">
                    ${Object.entries(mb).map(([key, val]) => `
                        <div class="mastery-bar-item">
                            <div class="mastery-bar-label">${key.charAt(0).toUpperCase() + key.slice(1)} Mastery</div>
                            <div class="mastery-bar-track">
                                <div class="mastery-bar-fill" style="width:${val}%"></div>
                            </div>
                            <span class="mastery-pct">${val}%</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    // --- Strategic Roadmap ---
    renderStrategicRoadmap() {
        const r = this.data.strategic_roadmap;
        if (!r) return;
        const el = document.getElementById('roadmap-strategic-dynamic');
        if (!el) return;
        const horizons = [
            { key: 'one_year', icon: '🎯', label: '1-Year' },
            { key: 'three_year', icon: '🏛️', label: '3-Year' },
            { key: 'five_year', icon: '🌐', label: '5-Year' }
        ];
        el.innerHTML = horizons.map(h => {
            const data = r[h.key];
            if (!data) return '';
            const items = data.deliverables || data.milestones || [];
            const extra = data.skill_identity ? `<p class="roadmap-identity">Identity: <strong>${data.skill_identity}</strong></p>` :
                data.target_profile ? `<p class="roadmap-identity">Target: <strong>${data.target_profile}</strong></p>` : '';
            return `
            <div class="roadmap-horizon card glass-card">
                <div class="roadmap-horizon-header">
                    <span class="roadmap-icon">${h.icon}</span>
                    <div>
                        <h3>${h.label} — ${data.title}</h3>
                        <span class="roadmap-date">Target: ${data.target_date}</span>
                    </div>
                    <span class="roadmap-pct">${data.progress}%</span>
                </div>
                <div class="roadmap-progress-track"><div style="width:${data.progress}%"></div></div>
                ${extra}
                <ul class="roadmap-items">
                    ${items.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>`;
        }).join('');
    }

    // --- Performance Metrics ---
    renderPerformanceMetrics() {
        const pm = this.data.performance_metrics;
        if (!pm) return;
        const el = document.getElementById('metrics-dynamic');
        if (!el) return;
        const latest = (pm.weekly_log || [])[0];
        if (!latest) { el.innerHTML = '<p>No metrics logged yet.</p>'; return; }
        const cog = latest.cognitive || {};
        const phy = latest.physical || {};
        el.innerHTML = `
            <div class="metrics-week-header">Week: ${latest.week}</div>
            <div class="metrics-two-col">
                <div class="card glass-card">
                    <h3>🧠 Cognitive Metrics</h3>
                    <div class="metrics-list">
                        <div class="metric-row"><span>Deep Work Hours</span><strong>${cog.deep_work_hours}h</strong></div>
                        <div class="metric-row"><span>Context Switches/Day</span><strong>${cog.context_switches_per_day}</strong></div>
                        <div class="metric-row"><span>Time in Terminal</span><strong>${cog.time_in_terminal_hours}h</strong></div>
                        <div class="metric-row"><span>Time Coding</span><strong>${cog.time_coding_hours}h</strong></div>
                        <div class="metric-row"><span>Reading Theory</span><strong>${cog.time_reading_theory_hours}h</strong></div>
                    </div>
                </div>
                <div class="card glass-card">
                    <h3>💪 Physical Metrics</h3>
                    <div class="metrics-list">
                        <div class="metric-row"><span>Avg Sleep</span><strong>${phy.avg_sleep_hours}h</strong></div>
                        <div class="metric-row"><span>Workouts Done</span><strong>${phy.workouts_done} sessions</strong></div>
                        <div class="metric-row"><span>Avg Screen Time</span><strong>${phy.avg_screen_time_hours}h</strong></div>
                        <div class="metric-row"><span>Caffeine/Day</span><strong>${phy.caffeine_cups_per_day} cups</strong></div>
                    </div>
                </div>
            </div>
            <h3 style="margin-top:2rem">📅 Weekly History</h3>
            <div class="metrics-history">
                ${(pm.weekly_log || []).map((w, i) => i === 0 ? '' : `
                    <div class="metrics-history-row card glass-card">
                        <strong>${w.week}</strong>
                        <span>Deep Work: ${w.cognitive.deep_work_hours}h</span>
                        <span>Coding: ${w.cognitive.time_coding_hours}h</span>
                        <span>Sleep: ${w.physical.avg_sleep_hours}h</span>
                        <span>Workouts: ${w.physical.workouts_done}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // --- Research Log ---
    renderResearchLog() {
        const papers = this.data.research_log;
        if (!papers) return;
        const el = document.getElementById('research-dynamic');
        if (!el) return;
        el.innerHTML = (papers || []).map(p => `
            <div class="research-card card glass-card">
                <div class="research-header">
                    <div>
                        <h3>${p.title}</h3>
                        <span class="research-meta">${p.authors} &middot; ${p.date_read}</span>
                    </div>
                    <span class="research-badge ${p.reimplemented ? 'reimpl-yes' : 'reimpl-no'}">
                        ${p.reimplemented ? '✅ Reimplemented' : '📖 Read only'}
                    </span>
                </div>
                <div class="research-section">
                    <strong>Key Insights</strong>
                    <ul>${(p.key_insights || []).map(i => `<li>${i}</li>`).join('')}</ul>
                </div>
                <div class="research-section">
                    <strong>Implementation Ideas</strong>
                    <ul>${(p.implementation_ideas || []).map(i => `<li>${i}</li>`).join('')}</ul>
                </div>
            </div>
        `).join('');
    }

    // --- Failure Log ---
    renderFailureLog() {
        const logs = this.data.failure_log;
        if (!logs) return;
        const el = document.getElementById('failure-log-dynamic');
        if (!el) return;
        el.innerHTML = (logs || []).map(l => `
            <div class="failure-entry card glass-card">
                <h3>📅 ${l.week}</h3>
                <div class="failure-row"><span class="failure-label">🔥 What Broke</span><p>${l.what_broke}</p></div>
                <div class="failure-row"><span class="failure-label">❓ What Confused Me</span><p>${l.what_confused}</p></div>
                <div class="failure-row"><span class="failure-label">⚠️ Wrong Assumption</span><p>${l.wrong_assumption}</p></div>
                <div class="failure-row"><span class="failure-label">🏗️ Design Mistake</span><p>${l.design_mistake}</p></div>
                <div class="failure-row lesson"><span class="failure-label">💡 Lesson</span><p>${l.lesson}</p></div>
            </div>
        `).join('');
    }

    // --- Technical Debt ---
    renderTechnicalDebt() {
        const d = this.data.technical_debt;
        if (!d) return;
        const el = document.getElementById('technical-debt-dynamic');
        if (!el) return;
        const priorityBadge = p => `<span class="priority-${p}">${p}</span>`;
        const section = (title, items) => items && items.length ? `
            <div class="debt-section">
                <h4>${title}</h4>
                <div class="debt-list">
                    ${items.map(i => `<div class="debt-item"><strong>${i.name}</strong>${priorityBadge(i.priority)}<p>${i.reason}</p></div>`).join('')}
                </div>
            </div>` : '';
        el.innerHTML = `
            <div class="debt-grid">
                ${section('🚧 Unfinished Projects', d.unfinished_projects)}
                ${section('♻️ Needs Refactor', d.needs_refactor)}
                ${section('📄 Docs Not Written', d.docs_not_written)}
                ${section('🧠 Half-Understood Concepts', d.concepts_half_understood)}
            </div>
        `;
    }

    // --- Energy Leak ---
    renderEnergyLeak() {
        const leaks = this.data.energy_leak;
        if (!leaks) return;
        const el = document.getElementById('energy-leak-dynamic');
        if (!el) return;
        el.innerHTML = (leaks || []).map(l => `
            <div class="energy-entry card glass-card">
                <div class="energy-header">
                    <h3>📅 ${l.week}</h3>
                    <span class="wasted-hours">${l.wasted_hours}h wasted</span>
                </div>
                <div class="energy-row"><strong>Distractions</strong><ul>${l.distractions.map(d => `<li>${d}</li>`).join('')}</ul></div>
                <div class="energy-row"><strong>⚠️ Cognitive Decay Platforms</strong><div class="decay-tags">${l.cognitive_decay_platforms.map(p => `<span class="decay-tag">${p}</span>`).join('')}</div></div>
                <div class="energy-row recovery"><strong>✅ Recovery Action</strong><p>${l.recovery_action}</p></div>
            </div>
        `).join('');
    }

    // --- Leverage Tracker ---
    renderLeverageTracker() {
        const l = this.data.leverage_tracker;
        if (!l) return;
        const el = document.getElementById('leverage-dynamic');
        if (!el) return;
        el.innerHTML = `
            <div class="leverage-grid">
                <div class="card glass-card">
                    <h3>🔧 Tools Mastered</h3>
                    <div class="tools-list">
                        ${(l.tools_mastered || []).map(t => `
                            <div class="tool-item">
                                <div class="tool-info"><strong>${t.name}</strong><span class="tool-level level-${t.level}">${t.level}</span></div>
                                <p>${t.use}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="leverage-right">
                    <div class="card glass-card">
                        <h3>⚙️ Automation Scripts</h3>
                        ${(l.automation_scripts || []).map(s => `
                            <div class="leverage-item"><strong>${s.name}</strong><span class="lang-tag">${s.lang}</span><p>${s.desc}</p></div>
                        `).join('')}
                    </div>
                    <div class="card glass-card">
                        <h3>📦 Reusable Libraries</h3>
                        ${(l.reusable_libs || []).map(s => `
                            <div class="leverage-item"><strong>${s.name}</strong><p>${s.desc}</p></div>
                        `).join('')}
                    </div>
                    <div class="card glass-card">
                        <h3>🏗️ Boilerplates</h3>
                        ${(l.boilerplates || []).map(s => `
                            <div class="leverage-item"><strong>${s.name}</strong><p>${s.desc}</p></div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // --- Benchmarking ---
    renderBenchmarking() {
        const b = this.data.benchmarking;
        if (!b) return;
        const el = document.getElementById('benchmarking-dynamic');
        if (!el) return;
        const cp = b.competitive_programming || {};
        const os = b.open_source || {};
        el.innerHTML = `
            <div class="benchmark-grid">
                <div class="benchmark-card">
                    <span class="bench-icon">🏆</span>
                    <span class="bench-label">LeetCode Percentile</span>
                    <span class="bench-val">Top ${100 - cp.leetcode_contest_percentile}%</span>
                </div>
                <div class="benchmark-card">
                    <span class="bench-icon">⚡</span>
                    <span class="bench-label">Codeforces Rating</span>
                    <span class="bench-val">${cp.codeforces_rating > 0 ? cp.codeforces_rating : cp.codeforces_rank}</span>
                </div>
                <div class="benchmark-card">
                    <span class="bench-icon">🔀</span>
                    <span class="bench-label">OSS PRs Merged</span>
                    <span class="bench-val">${os.prs_merged}</span>
                </div>
                <div class="benchmark-card">
                    <span class="bench-icon">🐛</span>
                    <span class="bench-label">Issues Filed</span>
                    <span class="bench-val">${os.issues_filed}</span>
                </div>
            </div>
            <h4 style="margin:1.5rem 0 0.75rem">Targets</h4>
            <div class="benchmark-targets">
                ${(b.targets || []).map(t => `
                    <div class="benchmark-target">
                        <div class="bt-head"><strong>${t.metric}</strong><span class="bt-deadline">${t.deadline}</span></div>
                        <div class="bt-progress">${t.current} → <strong>${t.target}</strong></div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // --- Public Impact ---
    renderPublicImpact() {
        const pi = this.data.public_impact;
        if (!pi) return;
        const el = document.getElementById('public-impact-dynamic');
        if (!el) return;
        el.innerHTML = `
            <div class="impact-tools">
                ${(pi.tools || []).map(t => `
                    <div class="impact-card">
                        <h4>${t.name}</h4>
                        <span class="impact-status">${t.status}</span>
                        <div class="impact-stats">
                            <div><span class="impact-num">${t.users}</span><span>Users</span></div>
                            <div><span class="impact-num">${t.github_stars}</span><span>Stars</span></div>
                            <div><span class="impact-num">${t.downloads}</span><span>Downloads</span></div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <h4 style="margin:1.5rem 0 0.75rem">Targets</h4>
            <div class="benchmark-targets">
                ${(pi.targets || []).map(t => `
                    <div class="benchmark-target">
                        <div class="bt-head"><strong>${t.metric}</strong><span class="bt-deadline">${t.deadline}</span></div>
                        <div class="bt-progress">${t.current} → <strong>${t.target}</strong></div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // --- Knowledge Graph ---
    renderKnowledgeGraph() {
        // For now rendered as a structured list; a canvas SVG version can be added later
        const kg = this.data.knowledge_graph;
        if (!kg) return;
        // Knowledge graph is displayed in research page if element exists
        // It's a bonus section so we attach it into the research page bottom
        const el = document.getElementById('research-dynamic');
        if (!el) return;
        const typeIcon = { book: '📕', paper: '📄', concept: '💡', project: '🔧', skill: '⚙️' };
        const grouped = {};
        (kg.nodes || []).forEach(n => { if (!grouped[n.type]) grouped[n.type] = []; grouped[n.type].push(n); });
        const kgHtml = `
            <div class="kg-section card glass-card">
                <h3>🕸️ Knowledge Graph</h3>
                <p class="kg-subtitle">How your learning flows into skills</p>
                <div class="kg-grid">
                    ${Object.entries(grouped).map(([type, nodes]) => `
                        <div class="kg-group">
                            <h4>${typeIcon[type] || '•'} ${type.charAt(0).toUpperCase() + type.slice(1)}s</h4>
                            ${nodes.map(n => {
            const outgoing = (kg.edges || []).filter(e => e.from === n.id).map(e => {
                const target = kg.nodes.find(nd => nd.id === e.to);
                return target ? `→ <em>${target.label}</em>` : '';
            }).filter(Boolean);
            return `
                                <div class="kg-node">
                                    <strong>${n.label}</strong>
                                    ${outgoing.length ? `<div class="kg-links">${outgoing.join(', ')}</div>` : ''}
                                </div>`;
        }).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        el.innerHTML = el.innerHTML + kgHtml;
    }

    // --- Debug Tab Switcher ---
    initDebugTabs() {
        document.querySelectorAll('.debug-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.debug-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.debug-panel').forEach(p => p.classList.remove('active-panel'));
                tab.classList.add('active');
                const panelId = { failure: 'failure-log-dynamic', debt: 'technical-debt-dynamic', energy: 'energy-leak-dynamic' }[tab.dataset.tab];
                if (panelId) document.getElementById(panelId)?.classList.add('active-panel');
            });
        });
    }
}

// Global content manager
const contentManager = new ContentManager();
