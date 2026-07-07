// main.js — Tab switching, animations, theme, search/filter

document.addEventListener('DOMContentLoaded', async () => {
  const data = await DataLoader.load();

  // --- State ---
  let currentCohort = '13';
  const hash = location.hash.replace('#', '');
  if (hash === 'cohort-12') currentCohort = '12';

  // --- DOM refs ---
  const tabBtns = document.querySelectorAll('.cohort-tab');
  const heroBadge = document.getElementById('hero-cohort-badge');
  const awardContainer = document.getElementById('award-container');
  const projectGrid = document.getElementById('project-grid');
  const statParticipants = document.getElementById('stat-participants');
  const statProjects = document.getElementById('stat-projects');
  const statDuration = document.getElementById('stat-duration');
  const searchInput = document.getElementById('search-input');
  const filterBtns = document.querySelectorAll('.filter-btn');

  let activeFilter = '전체';

  // --- Render ---
  function render() {
    const cohort = DataLoader.getCohort(currentCohort);
    if (!cohort) return;

    // Badge
    if (heroBadge) heroBadge.textContent = cohort.name;

    // Tabs
    tabBtns.forEach(b => {
      b.classList.toggle('active', b.dataset.cohort === currentCohort);
    });

    // Awards
    renderAwards();

    // All projects
    renderProjects();

    // Stats
    animateNumber(statParticipants, cohort.stats.participants);
    animateNumber(statProjects, cohort.stats.projects);
    animateNumber(statDuration, cohort.stats.duration_weeks);
  }

  function renderAwards() {
    if (!awardContainer) return;
    awardContainer.innerHTML = '';
    const awards = DataLoader.getAwardProjects(currentCohort);
    const groups = {};
    awards.forEach(p => {
      if (!groups[p.award]) groups[p.award] = [];
      groups[p.award].push(p);
    });

    const labelClass = { '대상': 'grand', '최우수상': 'excellent', '우수상': 'good', '인기상': '' };

    for (const [award, projects] of Object.entries(groups)) {
      const group = document.createElement('div');
      group.className = 'award-group reveal';
      group.innerHTML = `<div class="award-label ${labelClass[award] || ''}">${DataLoader.getAwardEmoji(award)} ${award}</div>`;
      const grid = document.createElement('div');
      grid.className = 'card-grid';
      projects.forEach(p => grid.appendChild(DataLoader.renderCard(p)));
      group.appendChild(grid);
      awardContainer.appendChild(group);
    }
    observeReveal();
  }

  function renderProjects() {
    if (!projectGrid) return;
    projectGrid.innerHTML = '';
    let projects = DataLoader.getAllProjects(currentCohort);

    // Filter
    if (activeFilter !== '전체') {
      if (activeFilter === '수상작') {
        projects = projects.filter(p => p.award && p.award !== '');
      } else {
        projects = projects.filter(p => p.award === activeFilter);
      }
    }

    // Search
    const q = (searchInput?.value || '').trim().toLowerCase();
    if (q) {
      projects = projects.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.team_name.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.tech_stack.some(t => t.toLowerCase().includes(q))
      );
    }

    if (projects.length === 0) {
      projectGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-secondary);padding:48px 0;">검색 결과가 없습니다.</p>';
      return;
    }

    const classGroups = DataLoader.groupByClass(projects);

    if (classGroups) {
      // Render grouped by 반 (class), each group its own grid
      projectGrid.classList.remove('card-grid');
      classGroups.forEach(({ class: cls, projects: groupProjects }) => {
        const group = document.createElement('div');
        group.className = 'class-group reveal';
        group.innerHTML = `<div class="class-label class-${cls.toLowerCase()}">${cls}반 <span class="class-count">${groupProjects.length}팀</span></div>`;
        const grid = document.createElement('div');
        grid.className = 'card-grid';
        groupProjects
          .slice()
          .sort((a, b) => (a.team_name || '').localeCompare(b.team_name || '', 'ko', { numeric: true }))
          .forEach(p => grid.appendChild(DataLoader.renderCard(p)));
        group.appendChild(grid);
        projectGrid.appendChild(group);
      });
    } else {
      projectGrid.classList.add('card-grid');
      projects.forEach(p => {
        const card = DataLoader.renderCard(p);
        card.classList.add('reveal');
        projectGrid.appendChild(card);
      });
    }
    observeReveal();
  }

  // --- Tab switch ---
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentCohort = btn.dataset.cohort;
      location.hash = `cohort-${currentCohort}`;
      activeFilter = '전체';
      filterBtns.forEach(b => b.classList.toggle('active', b.dataset.filter === '전체'));
      if (searchInput) searchInput.value = '';
      render();
    });
  });

  // --- Filter ---
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.toggle('active', b === btn));
      renderProjects();
    });
  });

  // --- Search ---
  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(renderProjects, 250);
    });
  }

  // --- Theme toggle ---
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    const saved = localStorage.getItem('theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);

    themeBtn.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      themeBtn.textContent = isDark ? '🌙' : '☀️';
    });
    themeBtn.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  }

  // --- Mobile menu ---
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
  }

  // --- Scroll reveal ---
  function observeReveal() {
    const els = document.querySelectorAll('.reveal:not(.visible)');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 80);
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(el => observer.observe(el));
  }

  // --- Animate number ---
  function animateNumber(el, target) {
    if (!el) return;
    const dur = 1200;
    const start = performance.now();
    const from = 0;
    function tick(now) {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (target - from) * ease);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // --- Hash change ---
  window.addEventListener('hashchange', () => {
    const h = location.hash.replace('#', '');
    if (h === 'cohort-12') currentCohort = '12';
    else if (h === 'cohort-13') currentCohort = '13';
    render();
  });

  // Initial render
  render();
  observeReveal();
});
