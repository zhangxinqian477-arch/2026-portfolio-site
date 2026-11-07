import { about } from './data.js';

const gallery = document.querySelector('#about-gallery');
const dialog = document.querySelector('.archive-lightbox');
const caption = document.querySelector('#archive-lightbox-caption');
const image = new Image();
caption.before(image);
let opener;

document.querySelector('#about-introduction').innerHTML = about.paragraphs.map(text => `<p>${text}</p>`).join('');
document.querySelector('#about-interests').innerHTML = about.interests.map(({ name, english }) =>
  `<li>${name} <span lang="en">${english}</span></li>`
).join('');

gallery.insertAdjacentHTML('beforeend', about.archive.map(({ id, file, width, height, title, alt }, index) => {
  const label = String(index + 1).padStart(2, '0');
  const src = `resume/assets/archive/${file}`;
  return `
    <figure class="archive-piece" data-piece="${id}">
      <button class="archive-trigger" type="button" data-full="${src}.webp" aria-label="查看大图：${title}">
        <img src="${src}-preview.webp" width="${width}" height="${height}" alt="${alt}" loading="lazy" decoding="async">
      </button>
      <figcaption><span class="archive-number">${label}</span><span class="archive-title">${title}</span></figcaption>
    </figure>`;
}).join('') + '<p class="archive-note" lang="en">A collection of things I made, explored &amp; noticed.</p>');

gallery.addEventListener('click', event => {
  const trigger = event.target.closest('.archive-trigger');
  if (!trigger) return;

  opener = trigger;
  image.src = trigger.dataset.full;
  image.alt = trigger.querySelector('img').alt;
  caption.textContent = trigger.closest('figure').querySelector('.archive-title').textContent;
  dialog.showModal();
});

dialog.addEventListener('close', () => {
  opener?.focus({ preventScroll: true });
});
