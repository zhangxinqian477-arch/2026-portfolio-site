import './about.js';
import { campus, experiences, profile } from './data.js';

const list = (items, className) => `<ul class="${className}">${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
const paragraphs = (details) => details.map(({ label, text }) =>
  `<p>${label ? `<strong>${label}：</strong>` : ''}${text}</p>`
).join('');
const icon = (name, size) => `<img src="resume/assets/${name}.svg" width="${size}" height="${size}" alt="">`;

document.querySelector('#profile').innerHTML = `
  <div class="identity">
    <div class="intro">
      <h1>${profile.name}</h1>
      <p class="direction">${profile.direction}</p>
      <p class="intro-copy">${profile.introduction}</p>
    </div>
    <section class="education" aria-labelledby="education-heading">
      <h2 id="education-heading">01 / 教育背景</h2>
      ${profile.education.map(({ school, degree, period, notes }) => `
        <article class="school">
          <header class="school-heading"><h3>${school}</h3><p>${degree}</p><p>${period}</p></header>
          ${list(notes, 'school-notes')}
        </article>
      `).join('')}
    </section>
  </div>
  <aside class="contact" aria-label="联系方式">
    <address>
      <a href="tel:${profile.phone}">${icon('phone', 20)}${profile.phone}</a>
      <a href="mailto:${profile.email}">${icon('email', 20)}${profile.email}</a>
    </address>
    <img class="portrait" src="resume/assets/portrait.png" width="285" height="380" alt="${profile.name}的照片">
  </aside>`;

document.querySelector('#campus').innerHTML = `
  <div class="campus-heading"><h3>${campus.title}</h3><p>${campus.period}</p></div>
  <div class="campus-details">${paragraphs(campus.details)}</div>`;
const experienceSection = document.querySelector('.experience');
const timeline = experienceSection.querySelector('.timeline');
const cards = experienceSection.querySelector('.experience-cards');
const status = document.querySelector('#experience-status');
const number = index => String(index + 1).padStart(2, '0');

timeline.innerHTML = `
  ${experiences.map(({ id, company, label }, index) => `
    <div class="timeline-step">
      <button type="button" class="timeline-node" data-experience="${id}" aria-label="${number(index)} / ${company}" aria-pressed="false">
        <span class="node-marker" aria-hidden="true">
          ${icon('node-future', 10)}${icon('node-halo', 29)}${icon('node-current', 15)}
        </span>
        <span>${number(index)} / ${label}</span>
      </button>
    </div>`).join('')}`;

cards.innerHTML = experiences.map(({ id, company, period, role, product, summary, overview, details, projects }, index) => `
  <article class="experience-card" data-card="${id}" aria-labelledby="title-${id}">
    <div class="card-content">
      <p class="card-meta" aria-hidden="true">${number(index)}</p>
      <h3 id="title-${id}">
        <button type="button" class="card-control" data-experience="${id}" aria-controls="details-${id}" aria-expanded="false">${company}</button>
      </h3>
      ${product ? `<p class="card-product">${product}</p>` : ''}
      <div class="card-byline">
        <p class="card-period">${period}</p>
        <p class="card-role">${role}</p>
      </div>
      ${summary ? `<p class="card-summary">${summary}</p>` : ''}
      <div class="card-details" id="details-${id}" hidden>
        ${overview ? `<p class="card-overview">${overview}</p>` : ''}
        ${projects ? projects.map((project, projectIndex) => `
          <section class="project">
            <h4><span class="project-number">项目 ${number(projectIndex)}</span><span>${project.title}</span></h4>
            <div class="project-details">${paragraphs(project.details)}</div>
          </section>`).join('') : paragraphs(details)}
      </div>
    </div>
  </article>`).join('');

const nodes = [...timeline.querySelectorAll('.timeline-node')];
const cardItems = [...cards.querySelectorAll('.experience-card')];
const desktopMotion = matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)');
let activeExperience;
let heightAnimation;

desktopMotion.addEventListener('change', () => heightAnimation?.cancel());

function selectExperience(id, trigger) {
  if (id === activeExperience) return;

  const clickedCard = trigger?.closest('.experience-card');
  const previousTop = clickedCard?.getBoundingClientRect().top;
  const animateHeight = trigger && desktopMotion.matches;
  const previousHeight = animateHeight ? cards.getBoundingClientRect().height : 0;
  heightAnimation?.cancel();
  const activeIndex = experiences.findIndex(experience => experience.id === id);
  activeExperience = id;
  experienceSection.dataset.activeExperience = activeExperience;
  nodes.forEach((node, index) => {
    node.parentElement.dataset.step = index < activeIndex ? 'past' : index === activeIndex ? 'current' : 'future';
    node.setAttribute('aria-pressed', index === activeIndex);
  });
  cardItems.forEach((card, index) => {
    const selected = index === activeIndex;
    card.dataset.selected = selected;
    card.querySelector('.card-control').setAttribute('aria-expanded', selected);
    card.querySelector('.card-details').hidden = !selected;
  });

  if (trigger) {
    experienceSection.dataset.interacted = 'true';
    status.textContent = `当前经历：${experiences[activeIndex].company}`;
  }
  if (animateHeight) {
    // Card copy is already laid out at its destination width, so this is the final row height.
    const nextHeight = cards.getBoundingClientRect().height;
    if (Math.abs(previousHeight - nextHeight) > 1) {
      const timing = getComputedStyle(cards);
      heightAnimation = cards.animate(
        [{ height: `${previousHeight}px` }, { height: `${nextHeight}px` }],
        { duration: parseFloat(timing.transitionDuration) * 1000, easing: timing.transitionTimingFunction },
      );
    }
  }
  if (clickedCard) {
    // In the stacked layout, keep the clicked card in place when a card above it collapses.
    const shift = clickedCard.getBoundingClientRect().top - previousTop;
    if (shift) window.scrollBy({ top: shift, behavior: 'instant' });
  }
}

selectExperience(experienceSection.dataset.activeExperience);
experienceSection.addEventListener('click', event => {
  const trigger = event.target.closest('[data-experience]');
  if (trigger) selectExperience(trigger.dataset.experience, trigger);
});
timeline.addEventListener('keydown', event => {
  const index = nodes.indexOf(event.target);
  if (index < 0) return;

  const nextIndex = {
    ArrowLeft: (index + nodes.length - 1) % nodes.length,
    ArrowRight: (index + 1) % nodes.length,
    Home: 0,
    End: nodes.length - 1,
  }[event.key];
  if (nextIndex === undefined) return;

  event.preventDefault();
  const node = nodes[nextIndex];
  node.focus({ preventScroll: true });
  selectExperience(node.dataset.experience, node);
});
