// main.js — shared init for both concepts; branches on <body data-concept="a|b">

document.addEventListener('DOMContentLoaded', async () => {
  await DataLoader.load();
  const COHORT = '13';
  const concept = document.body.dataset.concept || 'a';
  const cohort = DataLoader.getCohort(COHORT);
  const all = DataLoader.getAllProjects(COHORT);
  const awards = DataLoader.getAwardProjects(COHORT);

  // ---- Featured (award) section — shared ----
  const featured = document.getElementById('featured-grid');
  if (featured) awards.forEach(p => featured.appendChild(DataLoader.renderFeaturedCard(p)));

  // ---- Full listing by class ----
  const listing = document.getElementById('listing');
  if (listing) {
    DataLoader.groupByClass(all).forEach(({ cls, projects }) => {
      const group = document.createElement('div');
      group.className = 'class-group fade-up';
      group.innerHTML = `<div class="class-label">
        <span class="cl-code">CLASS ${cls}</span>
        <span class="cl-kr">${cls}반</span>
        <span class="cl-count">${String(projects.length).padStart(2, '0')} TEAMS</span>
      </div>`;
      if (concept === 'a') {
        const grid = document.createElement('div');
        grid.className = 'poster-grid';
        projects.forEach(p => grid.appendChild(DataLoader.renderPosterCard(p)));
        group.appendChild(grid);
      } else {
        const dir = document.createElement('div');
        dir.className = 'directory';
        projects.forEach(p => dir.appendChild(DataLoader.renderDirectoryRow(p)));
        group.appendChild(dir);
      }
      listing.appendChild(group);
    });
  }

  // ---- Concept A hero: poster mosaic wall ----
  const wall = document.getElementById('poster-wall');
  if (wall) {
    all.forEach(p => {
      const a = document.createElement('a');
      a.className = 'wall-item';
      a.href = `project/detail.html?id=${p.id}`;
      a.innerHTML = `<img src="${DataLoader.resolveAsset(p.thumbnail)}" alt="${p.title} 포스터" loading="lazy">
        <div class="wall-cap"><span class="wall-num">${p.id.toUpperCase()}</span>${p.title}</div>`;
      wall.appendChild(a);
    });
  }

  // ---- Concept B hero: auto-cycle showcase ----
  const stage = document.getElementById('showcase-stage');
  if (stage) {
    // order: award winners first, then the rest
    const ordered = [...awards, ...all.filter(p => !p.award)];
    const dotsWrap = document.getElementById('showcase-dots');
    ordered.forEach((p, i) => {
      const slide = document.createElement('div');
      slide.className = 'showcase-slide' + (i === 0 ? ' active' : '');
      const award = p.award ? `<span class="award-badge" style="position:static;align-self:flex-start;margin-bottom:14px">◆ ${p.award}</span>` : '';
      slide.innerHTML = `
        <div class="showcase-poster"><img src="${DataLoader.resolveAsset(p.thumbnail)}" alt="${p.title} 포스터"></div>
        <div class="showcase-info">
          <div class="s-num">${DataLoader.metaLine(p)}</div>
          ${award}
          <h3>${p.title}</h3>
          <div class="s-team">${DataLoader.teamMembers(p)}</div>
          <div class="s-summary">${p.summary}</div>
          <a class="s-cta" href="project/detail.html?id=${p.id}">프로젝트 자세히 보기 →</a>
        </div>`;
      stage.appendChild(slide);
      if (dotsWrap) {
        const b = document.createElement('button');
        b.setAttribute('aria-label', `${i + 1}번 프로젝트`);
        if (i === 0) b.classList.add('active');
        b.addEventListener('click', () => go(i, true));
        dotsWrap.appendChild(b);
      }
    });

    const slides = [...stage.querySelectorAll('.showcase-slide')];
    const dots = dotsWrap ? [...dotsWrap.querySelectorAll('button')] : [];
    let idx = 0, timer = null, visible = true;
    function go(n, manual) {
      slides[idx].classList.remove('active');
      if (dots[idx]) dots[idx].classList.remove('active');
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add('active');
      if (dots[idx]) dots[idx].classList.add('active');
      if (manual) restart();
    }
    function tick() { if (visible) go(idx + 1); }
    function restart() { clearInterval(timer); timer = setInterval(tick, 3800); }
    restart();
    const io = new IntersectionObserver(es => es.forEach(e => { visible = e.intersectionRatio > 0.2; }), { threshold: [0, 0.2, 0.5] });
    io.observe(stage);
  }

  // ---- Stats — shared ----
  const setNum = (id, target) => {
    const el = document.getElementById(id); if (!el) return;
    const dur = 1200, start = performance.now();
    (function step(now) {
      const t = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    })(start);
  };
  if (cohort) {
    const s = cohort.stats;
    const statsSection = document.getElementById('stats');
    if (statsSection) {
      const io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) {
          setNum('stat-participants', s.participants);
          setNum('stat-projects', s.projects);
          setNum('stat-duration', s.duration_weeks);
          io.disconnect();
        }
      }), { threshold: 0.3 });
      io.observe(statsSection);
    }
  }

  // ---- TOC active highlight ----
  const tocLinks = [...document.querySelectorAll('.toc a')];
  if (tocLinks.length) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) tocLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-30% 0px -55% 0px', threshold: 0 });
    document.querySelectorAll('section[id]').forEach(s => io.observe(s));
  }

  // ---- fade-up cascade ----
  const fo = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in-view'); fo.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  document.querySelectorAll('.fade-up').forEach(el => fo.observe(el));

  // ---- mobile nav ----
  const mob = document.getElementById('nav-mobile'), links = document.getElementById('nav-links');
  if (mob && links) {
    mob.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }
});
