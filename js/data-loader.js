// data-loader.js — Fetch & render project data

const DataLoader = (() => {
  let data = null;

  async function load() {
    if (data) return data;
    const base = location.pathname.includes('/project/') ? '../data/projects.json' : 'data/projects.json';
    const res = await fetch(base);
    data = await res.json();
    return data;
  }

  // Resolve a root-relative asset path (e.g. "data/submissions/...") from any page
  function resolveAsset(path) {
    if (!path || /^https?:\/\//.test(path)) return path;
    return location.pathname.includes('/project/') ? `../${path}` : path;
  }

  function getCohort(cohortId) {
    if (!data) return null;
    return data.cohorts[cohortId] || null;
  }

  function getProject(projectId) {
    if (!data) return null;
    for (const c of Object.values(data.cohorts)) {
      const p = c.projects.find(p => p.id === projectId);
      if (p) return { ...p, cohort: c };
    }
    return null;
  }

  function getAwardOrder(award) {
    const order = { '대상': 0, '최우수상': 1, '우수상': 2, '인기상': 3 };
    return award in order ? order[award] : 4;
  }

  function getAwardProjects(cohortId) {
    const c = getCohort(cohortId);
    if (!c) return [];
    return c.projects
      .filter(p => p.award && p.award !== '')
      .sort((a, b) => getAwardOrder(a.award) - getAwardOrder(b.award));
  }

  function getAllProjects(cohortId) {
    const c = getCohort(cohortId);
    return c ? c.projects : [];
  }

  // Group projects by `class` (반). Returns null if projects don't carry a class field.
  function groupByClass(projects) {
    if (!projects.some(p => p.class)) return null;
    const groups = {};
    projects.forEach(p => {
      const key = p.class || '기타';
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return Object.keys(groups).sort().map(key => ({ class: key, projects: groups[key] }));
  }

  // Render a project card
  function renderCard(project) {
    const card = document.createElement('a');
    card.className = 'card';
    card.href = `project/detail.html?id=${project.id}`;
    card.setAttribute('aria-label', `${project.title} 프로젝트 보기`);

    const awardBadge = project.award
      ? `<span class="card-award-badge ${project.award === '인기상' ? 'popular' : ''}">${getAwardEmoji(project.award)} ${project.award}</span>`
      : '';

    const techs = project.tech_stack.slice(0, 4).map(t => `<span class="card-tech">${t}</span>`).join('');

    card.innerHTML = `
      <div class="card-thumb">
        ${awardBadge}
        <span>📁</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${project.title}</h3>
        <p class="card-team">${project.team_name}</p>
        <p class="card-summary">${project.summary}</p>
        <div class="card-techs">${techs}</div>
      </div>`;
    return card;
  }

  function getAwardEmoji(award) {
    const map = { '대상': '🏆', '최우수상': '🥈', '우수상': '🥉', '인기상': '⭐' };
    return map[award] || '';
  }

  return { load, getCohort, getProject, getAwardProjects, getAllProjects, groupByClass, renderCard, getAwardEmoji, resolveAsset };
})();
