import * as THREE from './vendor/three.module.min.js';
import { locations } from './data/locations.js';

const elements = {
  canvas: document.querySelector('#globeCanvas'),
  globeWrap: document.querySelector('#globeWrap'),
  markerLayer: document.querySelector('#markerLayer'),
  fallback: document.querySelector('#globeFallback'),
  placeList: document.querySelector('#placeList'),
  placeCount: document.querySelector('#placeCount'),
  polaroid: document.querySelector('#polaroid'),
  polaroidImage: document.querySelector('#polaroidImage'),
  polaroidCity: document.querySelector('#polaroidCity'),
  polaroidMeta: document.querySelector('#polaroidMeta'),
  previewConnector: document.querySelector('#previewConnector'),
  previewConnectorPath: document.querySelector('#previewConnectorPath'),
  featuredNote: document.querySelector('#featuredNote'),
  panel: document.querySelector('#notePanel'),
  panelClose: document.querySelector('#panelClose'),
  pageScrim: document.querySelector('#pageScrim'),
  noteScroll: document.querySelector('#noteScroll'),
  detailIndex: document.querySelector('#detailIndex'),
  detailCity: document.querySelector('#detailCity'),
  detailLocation: document.querySelector('#detailLocation'),
  detailDate: document.querySelector('#detailDate'),
  demoLabel: document.querySelector('#demoLabel'),
  detailTitle: document.querySelector('#detailTitle'),
  detailDescription: document.querySelector('#detailDescription'),
  detailCover: document.querySelector('#detailCover'),
  detailCoverCaption: document.querySelector('#detailCoverCaption'),
  detailGallery: document.querySelector('#detailGallery'),
  cameraNote: document.querySelector('#cameraNote')
};

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const compactLayout = window.matchMedia('(max-width: 767px)');
const locationById = new Map(locations.map(location => [location.id, location]));
const markerButtons = new Map();
const placeButtons = new Map();
const markerVisuals = new Map();
const markerScreenPositions = new Map();

const state = {
  selectedId: null,
  hoveredId: null,
  hoverSource: null,
  lastTrigger: null,
  keyboardSelection: false,
  renderer: null,
  scene: null,
  camera: null,
  globeGroup: null,
  globe: null,
  resizeObserver: null,
  animationFrame: 0,
  lastFrame: performance.now(),
  lastRender: 0,
  resumeRotationAt: Number.POSITIVE_INFINITY,
  focusAnimation: null,
  panelTimer: 0,
  closeTimer: 0,
  previewTimer: 0,
  featuredTimer: 0,
  featuredDismissed: false,
  pointer: null,
  globeHovered: false,
  webglReady: false
};

const globeRadius = 1.08;
const localUp = new THREE.Vector3(0, 1, 0);
const markerColor = '#df8268';
const markerStemColor = '#f2eee6';
const markerHeadRadius = .0175;
const markerStemLength = .041;
const markerSurfaceOffset = .009;
const featuredLocationId = 'nanjing';
const initialGlobeLocation = { lat: 34.2, lng: 117.4 };

function dismissFeatured() {
  if (state.featuredDismissed) return;
  state.featuredDismissed = true;
  window.clearTimeout(state.featuredTimer);
  elements.featuredNote.classList.remove('is-visible');
  elements.featuredNote.setAttribute('aria-hidden', 'true');
  elements.featuredNote.tabIndex = -1;
  if (!state.pointer && !state.globeHovered && !state.selectedId) {
    state.resumeRotationAt = performance.now() + 1600;
  }
}

function revealFeatured() {
  if (state.featuredDismissed) return;
  state.featuredTimer = window.setTimeout(() => {
    if (state.featuredDismissed) return;
    elements.featuredNote.setAttribute('aria-hidden', 'false');
    elements.featuredNote.tabIndex = 0;
    elements.featuredNote.classList.add('is-visible');
  }, reducedMotion.matches ? 0 : 520);
}

function createLocationControls() {
  elements.placeCount.textContent = String(locations.length).padStart(2, '0');

  locations.forEach((location, index) => {
    const placeButton = document.createElement('button');
    placeButton.className = 'place-button';
    placeButton.type = 'button';
    placeButton.dataset.location = location.id;
    placeButton.setAttribute('aria-controls', 'notePanel');
    placeButton.setAttribute('aria-expanded', 'false');
    placeButton.innerHTML = `<span>${location.city}</span><small>${location.cityEn}</small>`;
    placeButton.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') setLinkedLocation(location.id, 'place');
    });
    placeButton.addEventListener('pointerleave', event => {
      if (event.pointerType === 'mouse' && document.activeElement !== placeButton) {
        clearLinkedLocation(location.id, 'place');
      }
    });
    placeButton.addEventListener('focus', () => setLinkedLocation(location.id, 'place'));
    placeButton.addEventListener('blur', () => clearLinkedLocation(location.id, 'place'));
    placeButton.addEventListener('click', event => selectLocation(location, event.currentTarget, event.detail === 0));
    elements.placeList.appendChild(placeButton);
    placeButtons.set(location.id, placeButton);

    const markerButton = document.createElement('button');
    markerButton.className = 'marker-button';
    markerButton.type = 'button';
    markerButton.dataset.location = location.id;
    markerButton.setAttribute('aria-label', `View Field Note: ${location.cityEn}`);
    markerButton.setAttribute('aria-controls', 'notePanel');
    markerButton.setAttribute('aria-expanded', 'false');
    markerButton.tabIndex = -1;
    markerButton.style.setProperty('--marker-color', markerColor);
    markerButton.innerHTML = `<span class="marker-label"><strong>${location.city}</strong><small>${location.cityEn}</small></span>`;
    markerButton.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') showPreview(location.id);
    });
    markerButton.addEventListener('pointerleave', event => {
      if (event.pointerType === 'mouse' && document.activeElement !== markerButton) hidePreview(location.id);
    });
    markerButton.addEventListener('focus', () => showPreview(location.id));
    markerButton.addEventListener('blur', () => hidePreview(location.id));
    markerButton.addEventListener('click', event => selectLocation(location, event.currentTarget, event.detail === 0));
    elements.markerLayer.appendChild(markerButton);
    markerButtons.set(location.id, markerButton);

    markerButton.style.setProperty('--marker-index', index);
  });
}

function setLinkedLocation(id, source) {
  if (!locationById.has(id)) return;
  if (state.selectedId && source !== 'selected') return;
  dismissFeatured();
  state.hoveredId = id;
  state.hoverSource = source;
  locations.forEach(location => {
    placeButtons.get(location.id)?.classList.toggle('is-linked', location.id === id);
  });
}

function clearLinkedLocation(id, source = null) {
  if (state.hoveredId !== id || (source && state.hoverSource !== source)) return;
  window.clearTimeout(state.previewTimer);
  state.previewTimer = 0;
  state.hoveredId = null;
  state.hoverSource = null;
  locations.forEach(location => placeButtons.get(location.id)?.classList.remove('is-linked'));
  elements.polaroid.classList.remove('is-visible');
  elements.previewConnector.classList.remove('is-visible');
}

function showPreview(id, source = 'marker', delay = 130) {
  if (!locationById.has(id)) return;
  window.clearTimeout(state.previewTimer);
  setLinkedLocation(id, source);
  if (state.hoveredId !== id || state.hoverSource !== source) return;
  if (compactLayout.matches) return;
  elements.polaroid.classList.remove('is-visible');
  elements.previewConnector.classList.remove('is-visible');
  const location = locationById.get(id);
  elements.polaroidImage.src = location.cover;
  elements.polaroidImage.alt = location.coverAlt;
  elements.polaroidCity.textContent = `${location.city} · ${location.cityEn}`;
  elements.polaroidMeta.textContent = location.previewMeta;
  state.previewTimer = window.setTimeout(() => {
    if (state.hoveredId !== id || state.hoverSource !== source) return;
    if (!markerScreenPositions.get(id)?.visible) return;
    positionPreview(id);
    requestAnimationFrame(() => {
      elements.polaroid.classList.add('is-visible');
      elements.previewConnector.classList.add('is-visible');
    });
    state.previewTimer = 0;
  }, delay);
}

function hidePreview(id) {
  clearLinkedLocation(id, 'marker');
}

function positionPreview(id) {
  const point = markerScreenPositions.get(id);
  if (!point) return;
  const width = elements.globeWrap.clientWidth;
  const height = elements.globeWrap.clientHeight;
  const wrapBounds = elements.globeWrap.getBoundingClientRect();
  const cardWidth = 146;
  const cardHeight = 148;
  const halfWidth = cardWidth / 2;
  const halfHeight = cardHeight / 2;
  const centerX = width / 2;
  const centerY = height / 2;
  const outwardX = point.x - centerX;
  const outwardY = point.y - centerY;
  const outwardLength = Math.max(1, Math.hypot(outwardX, outwardY));
  let directionX = outwardX / outwardLength;
  let directionY = outwardY / outwardLength;
  const horizontalSign = directionX < 0 ? -1 : 1;
  directionX = horizontalSign * Math.max(Math.abs(directionX), .62);
  directionY = -Math.max(Math.abs(directionY), .45);
  const previewDirectionLength = Math.hypot(directionX, directionY);
  directionX /= previewDirectionLength;
  directionY /= previewDirectionLength;

  const distance = 154;
  let previewX = point.x + directionX * distance;
  let previewY = point.y + directionY * distance;
  const viewportMinX = Math.max(12 + halfWidth, 12 - wrapBounds.left + halfWidth);
  const viewportMaxX = Math.min(width - 12 - halfWidth, window.innerWidth - 12 - wrapBounds.left - halfWidth);
  const viewportMinY = 12 - wrapBounds.top + halfHeight;
  const viewportMaxY = window.innerHeight - 12 - wrapBounds.top - halfHeight;

  if (previewX < viewportMinX || previewX > viewportMaxX) {
    previewX = point.x - directionX * distance;
  }
  previewX = Math.max(viewportMinX, Math.min(viewportMaxX, previewX));
  previewY = Math.max(viewportMinY, Math.min(viewportMaxY, previewY));

  elements.polaroid.style.left = `${previewX}px`;
  elements.polaroid.style.top = `${previewY}px`;

  const vectorX = previewX - point.x;
  const vectorY = previewY - point.y;
  const vectorLength = Math.max(1, Math.hypot(vectorX, vectorY));
  const unitX = vectorX / vectorLength;
  const unitY = vectorY / vectorLength;
  const edgeScale = Math.min(
    (halfWidth - 7) / Math.max(Math.abs(vectorX), .001),
    (halfHeight - 7) / Math.max(Math.abs(vectorY), .001)
  );
  const startX = point.x + unitX * 10;
  const startY = point.y + unitY * 10;
  const endX = previewX - vectorX * edgeScale;
  const endY = previewY - vectorY * edgeScale;
  const middleX = (startX + endX) / 2 - unitY * 4;
  const middleY = (startY + endY) / 2 + unitX * 4;
  elements.previewConnector.setAttribute('viewBox', `0 0 ${width} ${height}`);
  elements.previewConnectorPath.setAttribute(
    'd',
    `M ${startX.toFixed(1)} ${startY.toFixed(1)} Q ${middleX.toFixed(1)} ${middleY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`
  );
}

function renderDetail(location) {
  const index = locations.findIndex(item => item.id === location.id) + 1;
  elements.noteScroll.scrollTop = 0;
  elements.detailIndex.textContent = `FIELD NOTE / ${String(index).padStart(2, '0')}`;
  elements.detailCity.textContent = location.city;
  elements.detailLocation.textContent = `${location.cityEn}, ${location.country}`;
  elements.detailDate.textContent = location.date;
  elements.demoLabel.hidden = !location.demo;
  elements.detailTitle.textContent = location.title;
  elements.detailDescription.textContent = location.description;
  elements.detailCover.src = location.cover;
  elements.detailCover.alt = location.coverAlt;
  elements.detailCoverCaption.textContent = location.demo ? 'Illustration demo · 待替换为你的照片' : location.title;
  elements.detailGallery.replaceChildren();

  location.assets.forEach(asset => {
    const figure = document.createElement('figure');
    const image = document.createElement('img');
    const caption = document.createElement('figcaption');
    figure.className = `gallery-item is-${asset.type || 'photo'}`;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.src = asset.src;
    image.alt = asset.alt || '';
    caption.textContent = asset.caption || '';
    figure.append(image, caption);
    elements.detailGallery.appendChild(figure);
  });

  if (location.camera) {
    elements.cameraNote.hidden = false;
    elements.cameraNote.textContent = `Shot on ${location.camera}`;
  } else {
    elements.cameraNote.hidden = true;
    elements.cameraNote.textContent = '';
  }
}

function selectLocation(location, trigger, keyboardSelection = false) {
  dismissFeatured();
  const alreadyOpen = document.body.classList.contains('panel-open');
  if (state.selectedId === location.id && alreadyOpen) {
    closePanel();
    return;
  }

  window.clearTimeout(state.panelTimer);
  window.clearTimeout(state.closeTimer);
  state.selectedId = location.id;
  state.lastTrigger = trigger;
  state.keyboardSelection = keyboardSelection;
  state.resumeRotationAt = Number.POSITIVE_INFINITY;
  clearLinkedLocation(state.hoveredId);
  renderDetail(location);
  updateSelectionStates();
  focusGlobe(location, reducedMotion.matches ? 90 : 780);
  showPreview(location.id, 'selected', 0);

  elements.panel.inert = false;
  elements.panel.setAttribute('aria-hidden', 'false');
  state.panelTimer = window.setTimeout(() => {
    document.body.classList.add('panel-open');
    if (state.keyboardSelection) {
      window.setTimeout(() => elements.panelClose.focus({ preventScroll: true }), reducedMotion.matches ? 100 : 430);
    }
  }, reducedMotion.matches ? 0 : 230);
}

function closePanel({ restoreFocus = true } = {}) {
  if (!state.selectedId && !document.body.classList.contains('panel-open')) return;
  window.clearTimeout(state.panelTimer);
  document.body.classList.remove('panel-open');
  const trigger = state.lastTrigger;
  clearLinkedLocation(state.selectedId, 'selected');
  state.selectedId = null;
  state.lastTrigger = null;
  state.focusAnimation = null;
  state.resumeRotationAt = performance.now() + (reducedMotion.matches ? 0 : 1800);
  updateSelectionStates();

  state.closeTimer = window.setTimeout(() => {
    elements.panel.setAttribute('aria-hidden', 'true');
    elements.panel.inert = true;
    if (restoreFocus && trigger?.isConnected) trigger.focus({ preventScroll: true });
  }, reducedMotion.matches ? 80 : 420);
}

function updateSelectionStates() {
  locations.forEach(location => {
    const selected = state.selectedId === location.id;
    markerButtons.get(location.id)?.setAttribute('aria-expanded', String(selected));
    placeButtons.get(location.id)?.setAttribute('aria-expanded', String(selected));
    if (selected) placeButtons.get(location.id)?.setAttribute('aria-current', 'true');
    else placeButtons.get(location.id)?.removeAttribute('aria-current');
  });
}

function latLngToVector(lat, lng, radius = 1) {
  const latitude = THREE.MathUtils.degToRad(lat);
  const longitude = THREE.MathUtils.degToRad(lng);
  return new THREE.Vector3(
    Math.cos(latitude) * Math.cos(longitude),
    Math.sin(latitude),
    -Math.cos(latitude) * Math.sin(longitude)
  ).multiplyScalar(radius);
}

function orientationForLocation(location) {
  const yaw = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 1, 0),
    THREE.MathUtils.degToRad(-90 - location.lng)
  );
  const pitch = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(1, 0, 0),
    THREE.MathUtils.degToRad(location.lat - 4)
  );
  return pitch.multiply(yaw).normalize();
}

function focusGlobe(location, duration) {
  if (!state.webglReady || !state.globeGroup) return;
  const from = state.globeGroup.quaternion.clone();
  const to = orientationForLocation(location);
  if (duration <= 100) {
    state.globeGroup.quaternion.copy(to);
    state.focusAnimation = null;
    return;
  }
  state.focusAnimation = {
    from,
    to,
    start: performance.now(),
    duration
  };
}

function easeInOutCubic(value) {
  return value < .5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function createMarkerVisual(location) {
  const normal = latLngToVector(location.lat, location.lng).normalize();
  let north = localUp.clone().sub(normal.clone().multiplyScalar(localUp.dot(normal)));
  if (north.lengthSq() < .0001) north = new THREE.Vector3(0, 0, 1);
  north.normalize();
  const east = new THREE.Vector3().crossVectors(north, normal).normalize();

  const marker = new THREE.Group();
  const basis = new THREE.Matrix4().makeBasis(east, north, normal);
  marker.quaternion.setFromRotationMatrix(basis);
  marker.position.copy(normal).multiplyScalar(globeRadius);

  const headMaterial = new THREE.MeshStandardMaterial({
    color: markerColor,
    metalness: 0,
    roughness: .74,
    transparent: true,
    opacity: 1,
    depthTest: true,
    depthWrite: true
  });
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(markerHeadRadius, 20, 14),
    headMaterial
  );
  head.scale.set(1, 1, .92);
  head.position.z = markerSurfaceOffset + markerStemLength + markerHeadRadius * .9;
  marker.add(head);

  const stemMaterial = new THREE.MeshStandardMaterial({
    color: markerStemColor,
    metalness: 0,
    roughness: .82,
    transparent: true,
    opacity: 1,
    depthTest: true,
    depthWrite: true
  });
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(.0034, .0038, markerStemLength, 12),
    stemMaterial
  );
  stem.rotation.x = Math.PI / 2;
  stem.position.z = markerSurfaceOffset + markerStemLength / 2;
  marker.add(stem);

  const contactShadow = new THREE.Mesh(
    new THREE.CircleGeometry(.012, 24),
    new THREE.MeshBasicMaterial({
      color: 0x536966,
      transparent: true,
      opacity: .1,
      depthTest: true,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  );
  contactShadow.position.z = markerSurfaceOffset * .55;
  marker.add(contactShadow);

  const selectionRing = new THREE.Mesh(
    new THREE.RingGeometry(.016, .021, 28),
    new THREE.MeshBasicMaterial({
      color: markerColor,
      transparent: true,
      opacity: 0,
      depthTest: true,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  );
  selectionRing.position.z = markerSurfaceOffset * .62;
  marker.add(selectionRing);
  state.globeGroup.add(marker);

  markerVisuals.set(location.id, {
    normal,
    marker,
    head,
    stem,
    contactShadow,
    headMaterial,
    stemMaterial,
    selectionRing,
    scale: 1,
    opacity: 1,
    lift: 0,
    wasActive: false,
    ringPulseStart: 0,
    anchor: normal.clone().multiplyScalar(
      globeRadius + markerSurfaceOffset + markerStemLength + markerHeadRadius * .9
    )
  });
}

async function loadTexture() {
  const loader = new THREE.TextureLoader();
  const texture = await loader.loadAsync('./assets/earth-texture.svg');
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, state.renderer.capabilities.getMaxAnisotropy());
  return texture;
}

async function initGlobe() {
  try {
    const renderer = new THREE.WebGLRenderer({
      canvas: elements.canvas,
      alpha: true,
      antialias: true
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    state.renderer = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, .1, 20);
    camera.position.set(0, 0, 4.18);
    camera.lookAt(0, 0, 0);
    state.scene = scene;
    state.camera = camera;

    const globeGroup = new THREE.Group();
    globeGroup.quaternion.copy(orientationForLocation(initialGlobeLocation));
    scene.add(globeGroup);
    state.globeGroup = globeGroup;

    const texture = await loadTexture();
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(globeRadius, 72, 54),
      new THREE.MeshStandardMaterial({
        map: texture,
        roughness: .88,
        metalness: 0
      })
    );
    globeGroup.add(globe);
    state.globe = globe;

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(globeRadius * 1.018, 48, 36),
      new THREE.MeshBasicMaterial({
        color: 0xf4fcfa,
        side: THREE.BackSide,
        transparent: true,
        opacity: .11
      })
    );
    globeGroup.add(atmosphere);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x78979c, 2.35));
    const keyLight = new THREE.DirectionalLight(0xfffaec, 2.75);
    keyLight.position.set(-3.2, 4.4, 5.2);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xb4eff0, 1.35);
    fillLight.position.set(4, -1, 3);
    scene.add(fillLight);

    locations.forEach(createMarkerVisual);
    state.webglReady = true;
    attachGlobeInteraction();
    observeGlobeSize();
    state.animationFrame = requestAnimationFrame(renderFrame);
    revealFeatured();
  } catch (error) {
    console.error('Field Notes globe could not be initialized.', error);
    showGlobeFallback();
    revealFeatured();
  }
}

function observeGlobeSize() {
  const resize = () => {
    if (!state.renderer || !state.camera) return;
    const width = Math.max(1, elements.globeWrap.clientWidth);
    const height = Math.max(1, elements.globeWrap.clientHeight);
    state.renderer.setSize(width, height, false);
    state.camera.aspect = width / height;
    state.camera.updateProjectionMatrix();
  };
  state.resizeObserver = new ResizeObserver(resize);
  state.resizeObserver.observe(elements.globeWrap);
  resize();
}

function nearestMarkerAt(clientX, clientY, hitRadius = 24) {
  const bounds = elements.globeWrap.getBoundingClientRect();
  const pointerX = clientX - bounds.left;
  const pointerY = clientY - bounds.top;
  let nearestId = null;
  let nearestDistance = hitRadius;

  markerScreenPositions.forEach((point, id) => {
    if (!point.visible) return;
    const distance = Math.hypot(point.x - pointerX, point.y - pointerY);
    if (distance >= nearestDistance) return;
    nearestDistance = distance;
    nearestId = id;
  });

  return nearestId;
}

function attachGlobeInteraction() {
  const canvas = elements.canvas;

  elements.globeWrap.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    state.globeHovered = true;
    state.resumeRotationAt = Number.POSITIVE_INFINITY;
  });

  elements.globeWrap.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse') return;
    if (state.hoverSource === 'marker') hidePreview(state.hoveredId);
    elements.globeWrap.classList.remove('marker-hover');
    state.globeHovered = false;
    if (!state.pointer && !state.selectedId) {
      state.resumeRotationAt = performance.now() + 900;
    }
  });

  elements.globeWrap.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || state.pointer) return;
    if (event.target.closest?.('#featuredNote')) return;
    const markerId = nearestMarkerAt(event.clientX, event.clientY);
    elements.globeWrap.classList.toggle('marker-hover', Boolean(markerId));
    if (state.selectedId) return;
    if (markerId === state.hoveredId && state.hoverSource === 'marker') return;
    if (state.hoverSource === 'marker') hidePreview(state.hoveredId);
    if (markerId) showPreview(markerId);
  });

  canvas.addEventListener('pointerdown', event => {
    if (!state.globeGroup) return;
    const canDrag = event.pointerType === 'touch' || (event.pointerType === 'mouse' && event.button === 0);
    if (!canDrag) return;
    dismissFeatured();
    state.focusAnimation = null;
    state.pointer = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      totalX: 0,
      totalY: 0
    };
    state.resumeRotationAt = Number.POSITIVE_INFINITY;
    canvas.setPointerCapture?.(event.pointerId);
    hidePreview(state.hoveredId);
  });

  canvas.addEventListener('pointermove', event => {
    if (!state.pointer || event.pointerId !== state.pointer.id || !state.globeGroup) return;
    const dx = event.clientX - state.pointer.x;
    const dy = event.clientY - state.pointer.y;
    state.pointer.x = event.clientX;
    state.pointer.y = event.clientY;
    state.pointer.totalX += dx;
    state.pointer.totalY += dy;

    const yaw = new THREE.Quaternion().setFromAxisAngle(localUp, dx * .0054);
    const pitch = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), dy * .0042);
    state.globeGroup.quaternion.premultiply(yaw).premultiply(pitch).normalize();
  });

  const release = event => {
    if (!state.pointer || event.pointerId !== state.pointer.id) return;
    const totalMovement = Math.hypot(state.pointer.totalX, state.pointer.totalY);
    canvas.releasePointerCapture?.(event.pointerId);
    state.pointer = null;
    if (totalMovement < 6) {
      const markerId = nearestMarkerAt(event.clientX, event.clientY, event.pointerType === 'touch' ? 28 : 24);
      const location = locationById.get(markerId);
      if (location) {
        selectLocation(location, markerButtons.get(markerId), false);
        return;
      }
    }
    if (!state.selectedId) state.resumeRotationAt = performance.now() + 2500;
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('lostpointercapture', event => {
    if (state.pointer?.id === event.pointerId) {
      state.pointer = null;
      if (!state.selectedId) state.resumeRotationAt = performance.now() + 2500;
    }
  });

  canvas.addEventListener('contextmenu', event => event.preventDefault());
  elements.polaroid.addEventListener('contextmenu', event => event.preventDefault());
  elements.featuredNote.addEventListener('contextmenu', event => event.preventDefault());
}

function updateMarkerPositions(now) {
  if (!state.camera || !state.globeGroup) return;
  const width = elements.globeWrap.clientWidth;
  const height = elements.globeWrap.clientHeight;
  const worldPoint = new THREE.Vector3();
  const worldNormal = new THREE.Vector3();
  const projected = new THREE.Vector3();
  const towardCamera = new THREE.Vector3();

  locations.forEach(location => {
    const visual = markerVisuals.get(location.id);
    const button = markerButtons.get(location.id);
    if (!visual || !button) return;

    const active = state.selectedId === location.id;
    const hovered = state.hoveredId === location.id;
    const targetLift = active ? .012 : hovered ? .01 : 0;
    const targetScale = active ? 1.12 : hovered ? 1.15 : 1;
    const targetOpacity = active || hovered || !state.selectedId ? 1 : .6;
    visual.lift += (targetLift - visual.lift) * .18;
    visual.scale += (targetScale - visual.scale) * .18;
    visual.opacity += (targetOpacity - visual.opacity) * .18;
    visual.anchor.copy(visual.normal)
      .multiplyScalar(
        globeRadius + visual.lift + markerSurfaceOffset + markerStemLength + markerHeadRadius * .9
      );
    visual.marker.position.copy(visual.normal).multiplyScalar(globeRadius + visual.lift);
    visual.head.scale.set(visual.scale, visual.scale, visual.scale * .92);

    if (active && !visual.wasActive) visual.ringPulseStart = now;
    visual.wasActive = active;
    let ringOpacity = 0;
    if (visual.ringPulseStart) {
      const ringProgress = Math.min(1, (now - visual.ringPulseStart) / 460);
      const ringEase = 1 - Math.pow(1 - ringProgress, 3);
      visual.selectionRing.scale.setScalar(.7 + ringEase * .6);
      ringOpacity = (1 - ringProgress) * .58;
      if (ringProgress >= 1) visual.ringPulseStart = 0;
    }

    worldPoint.copy(visual.anchor).applyQuaternion(state.globeGroup.quaternion);
    worldNormal.copy(visual.normal).applyQuaternion(state.globeGroup.quaternion).normalize();
    towardCamera.copy(state.camera.position).sub(worldPoint).normalize();
    projected.copy(worldPoint).project(state.camera);
    const facing = worldNormal.dot(towardCamera);
    const edgeOpacity = THREE.MathUtils.smoothstep(facing, -.04, .22);
    const frontFacing = facing > -.04 && projected.z < 1;
    const onScreen = Math.abs(projected.x) < 1.02 && Math.abs(projected.y) < 1.02;
    const visible = frontFacing && onScreen;
    const interactive = facing > .045 && onScreen;
    visual.marker.visible = visible;
    visual.headMaterial.opacity = visual.opacity * edgeOpacity;
    visual.stemMaterial.opacity = visual.opacity * edgeOpacity;
    visual.contactShadow.material.opacity = .1 * visual.opacity * edgeOpacity;
    visual.selectionRing.material.opacity = ringOpacity * edgeOpacity;
    const x = (projected.x * .5 + .5) * width;
    const y = (-projected.y * .5 + .5) * height;

    markerScreenPositions.set(location.id, { x, y, visible: interactive });
    button.style.left = `${x}px`;
    button.style.top = `${y}px`;
    button.classList.toggle('is-visible', interactive);
    button.classList.toggle('is-linked', hovered);
    button.classList.toggle('label-left', x > width * .68);
    button.setAttribute('aria-hidden', String(!interactive));
    button.tabIndex = interactive ? 0 : -1;

  });

  if (state.hoveredId && (state.hoverSource === 'marker' || state.hoverSource === 'selected')) {
    const point = markerScreenPositions.get(state.hoveredId);
    if (!point?.visible) {
      if (state.hoverSource === 'marker') hidePreview(state.hoveredId);
      else {
        elements.polaroid.classList.remove('is-visible');
        elements.previewConnector.classList.remove('is-visible');
      }
    } else {
      positionPreview(state.hoveredId);
      if (state.hoverSource === 'selected') {
        elements.polaroid.classList.add('is-visible');
        elements.previewConnector.classList.add('is-visible');
      }
    }
  }
}

function renderFrame(now) {
  if (!state.renderer || !state.scene || !state.camera || !state.globeGroup) return;
  state.animationFrame = requestAnimationFrame(renderFrame);
  const highMotion = Boolean(state.pointer || state.focusAnimation);
  const minimumFrameTime = highMotion ? 15 : (state.selectedId || reducedMotion.matches ? 80 : 32);
  if (now - state.lastRender < minimumFrameTime) return;
  state.lastRender = now;
  const delta = Math.min(50, now - state.lastFrame);
  state.lastFrame = now;

  if (state.focusAnimation) {
    const elapsed = now - state.focusAnimation.start;
    const progress = Math.min(1, elapsed / state.focusAnimation.duration);
    state.globeGroup.quaternion.slerpQuaternions(
      state.focusAnimation.from,
      state.focusAnimation.to,
      easeInOutCubic(progress)
    );
    if (progress >= 1) state.focusAnimation = null;
  } else if (
    !reducedMotion.matches &&
    !state.pointer &&
    !state.globeHovered &&
    !state.selectedId &&
    state.featuredDismissed &&
    now >= state.resumeRotationAt
  ) {
    const angle = -(delta / 100000) * Math.PI * 2;
    const rotation = new THREE.Quaternion().setFromAxisAngle(localUp, angle);
    state.globeGroup.quaternion.premultiply(rotation).normalize();
  }

  updateMarkerPositions(now);
  state.renderer.render(state.scene, state.camera);
}

function showGlobeFallback() {
  state.webglReady = false;
  elements.canvas.hidden = true;
  elements.markerLayer.hidden = true;
  elements.fallback.hidden = false;
}

function handleMotionPreference() {
  if (reducedMotion.matches) {
    state.resumeRotationAt = Number.POSITIVE_INFINITY;
    state.focusAnimation = null;
  } else if (!state.selectedId && state.featuredDismissed) {
    state.resumeRotationAt = performance.now() + 1200;
  }
}

elements.featuredNote.addEventListener('click', event => {
  const location = locationById.get(featuredLocationId);
  if (!location) return;
  dismissFeatured();
  selectLocation(location, event.currentTarget, event.detail === 0);
});
elements.panelClose.addEventListener('click', () => closePanel());
elements.pageScrim.addEventListener('click', () => closePanel());
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && (state.selectedId || document.body.classList.contains('panel-open'))) {
    event.preventDefault();
    closePanel();
  }
});
reducedMotion.addEventListener('change', handleMotionPreference);
compactLayout.addEventListener('change', () => hidePreview(state.hoveredId));
window.addEventListener('pagehide', event => {
  if (event.persisted) return;
  cancelAnimationFrame(state.animationFrame);
  state.animationFrame = 0;
  state.resizeObserver?.disconnect();
});

createLocationControls();
initGlobe();
