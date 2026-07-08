// data-loader.js — fetch project data + render helpers for both concepts (A/B)

const DataLoader = (() => {
  let data = null;

  async function load() {
    if (data) return data;
    const base = location.pathname.includes('/project/') ? '../data/projects.json' : 'data/projects.json';
    const res = await fetch(base);
    data = await res.json();
    return data;
  }

  function resolveAsset(path) {
    if (!path || /^https?:\/\//.test(path)) return path;
    return location.pathname.includes('/project/') ? `../${path}` : path;
  }

  function getCohort(id) { return data ? (data.cohorts[id] || null) : null; }
  function getAllProjects(id) { const c = getCohort(id); return c ? c.projects : []; }
  function getProject(pid) {
    if (!data) return null;
    for (const c of Object.values(data.cohorts)) {
      const p = c.projects.find(x => x.id === pid);
      if (p) return { ...p, cohort: c };
    }
    return null;
  }
  function getAwardProjects(id) {
    return getAllProjects(id).filter(p => p.award && p.award !== '');
  }
  function groupByClass(projects) {
    const g = {};
    projects.forEach(p => { const k = p.class || '기타'; (g[k] = g[k] || []).push(p); });
    return Object.keys(g).sort().map(k => ({
      cls: k,
      projects: g[k].slice().sort((a, b) =>
        (a.team_name || '').localeCompare(b.team_name || '', 'ko', { numeric: true }))
    }));
  }

  // "13-A-1" → "13 · A반 1팀" style meta; teamNum from id
  function teamNum(p) { const m = p.id.match(/-(\d+)$/); return m ? m[1] : ''; }
  function metaLine(p) { return `${p.id.toUpperCase()} · CLASS ${p.class}`; }
  function teamMembers(p) {
    return (p.members && p.members.length)
      ? `${p.team_name} · ${p.members.join(', ')}`
      : p.team_name;
  }

  // ---- Concept A: poster grid card ----
  function renderPosterCard(p) {
    const a = document.createElement('a');
    a.className = 'pcard';
    a.href = `project/detail.html?id=${p.id}`;
    const award = p.award ? `<span class="pcard-award">◆ ${p.award}</span> · ` : '';
    a.innerHTML = `
      <div class="pcard-thumb"><img src="${resolveAsset(p.thumbnail)}" alt="${p.title} 포스터" loading="lazy"></div>
      <div class="pcard-meta">${metaLine(p)}</div>
      <h4>${p.title}</h4>
      <div class="pcard-team">${award}${teamMembers(p)}</div>`;
    return a;
  }

  // ---- Concept B: text directory row ----
  function renderDirectoryRow(p) {
    const a = document.createElement('a');
    a.className = 'dir-row';
    a.href = `project/detail.html?id=${p.id}`;
    const award = p.award ? `<span class="dr-award">◆ ${p.award}</span>` : '';
    a.innerHTML = `
      <div class="dr-num">${p.id.toUpperCase()}</div>
      <div class="dir-main">
        <div class="dr-title">${p.title}</div>
        <div class="dr-summary">${p.summary}</div>
      </div>
      <div class="dir-team">${award}${teamMembers(p)}</div>`;
    return a;
  }

  // ---- Featured (award) card — shared by both concepts ----
  function renderFeaturedCard(p) {
    const a = document.createElement('a');
    a.className = 'featured-card';
    a.href = `project/detail.html?id=${p.id}`;
    a.innerHTML = `
      <span class="award-badge">◆ ${p.award}</span>
      <div class="featured-poster"><img src="${resolveAsset(p.thumbnail)}" alt="${p.title} 포스터" loading="lazy"></div>
      <div class="featured-body">
        <div class="f-meta">${metaLine(p)}</div>
        <h3>${p.title}</h3>
        <div class="f-team">${teamMembers(p)}</div>
        <div class="f-summary">${p.summary}</div>
      </div>`;
    return a;
  }

  return {
    load, resolveAsset, getCohort, getAllProjects, getProject, getAwardProjects,
    groupByClass, teamNum, metaLine, teamMembers,
    renderPosterCard, renderDirectoryRow, renderFeaturedCard,
  };
})();
