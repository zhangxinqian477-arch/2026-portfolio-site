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
  resumeRotationAt: performance.now() + 1800,
  focusAnimation: null,
  panelTimer: 0,
  closeTimer: 0,
  pointer: null,
  webglReady: false
};

const colors = ['#d97957', '#e7c96d', '#4e73a6'];
const globeRadius = 1.08;
const localUp = new THREE.Vector3(0, 1, 0);

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
    markerButton.style.setProperty('--marker-color', colors[index % colors.length]);
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
  state.hoveredId = id;
  state.hoverSource = source;
  locations.forEach(location => {
    placeButtons.get(location.id)?.classList.toggle('is-linked', location.id === id);
  });
}

function clearLinkedLocation(id, source = null) {
  if (state.hoveredId !== id || (source && state.hoverSource !== source)) return;
  state.hoveredId = null;
  state.hoverSource = null;
  locations.forEach(location => placeButtons.get(location.id)?.classList.remove('is-linked'));
  elements.polaroid.classList.remove('is-visible');
}

function showPreview(id) {
  if (!locationById.has(id)) return;
  setLinkedLocation(id, 'marker');
  if (compactLayout.matches) return;
  const location = locationById.get(id);
  elements.polaroidImage.src = location.cover;
  elements.polaroidImage.alt = location.coverAlt;
  elements.polaroidCity.textContent = `${location.city} · ${location.cityEn}`;
  elements.polaroidMeta.textContent = location.previewMeta;
  positionPreview(id);
  requestAnimationFrame(() => elements.polaroid.classList.add('is-visible'));
}

function hidePreview(id) {
  clearLinkedLocation(id, 'marker');
}

function positionPreview(id) {
  const point = markerScreenPositions.get(id);
  if (!point) return;
  const width = elements.globeWrap.clientWidth;
  const height = elements.globeWrap.clientHeight;
  const cardWidth = 172;
  const cardHeight = 165;
  const left = Math.max(8, Math.min(width - cardWidth, point.x + 18));
  const top = Math.max(cardHeight * .48, Math.min(height - cardHeight * .42, point.y));
  elements.polaroid.style.left = `${left}px`;
  elements.polaroid.style.top = `${top}px`;
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

function createMarkerVisual(location, index) {
  const normal = latLngToVector(location.lat, location.lng).normalize();
  let north = localUp.clone().sub(normal.clone().multiplyScalar(localUp.dot(normal)));
  if (north.lengthSq() < .0001) north = new THREE.Vector3(0, 0, 1);
  north.normalize();
  const east = new THREE.Vector3().crossVectors(north, normal).normalize();
  const markerAngle = THREE.MathUtils.degToRad(location.markerAngle || 0);
  const bodyDirection = north.clone().multiplyScalar(Math.cos(markerAngle))
    .add(east.clone().multiplyScalar(-Math.sin(markerAngle)))
    .normalize();

  const markerShape = new THREE.Shape();
  markerShape.moveTo(0, 0);
  markerShape.bezierCurveTo(-.012, .025, -.07, .076, -.07, .132);
  markerShape.bezierCurveTo(-.07, .182, -.039, .21, 0, .21);
  markerShape.bezierCurveTo(.039, .21, .07, .182, .07, .132);
  markerShape.bezierCurveTo(.07, .076, .012, .025, 0, 0);
  markerShape.closePath();
  const markerHole = new THREE.Path();
  markerHole.absellipse(0, .14, .021, .021, 0, Math.PI * 2, false, 0);
  markerShape.holes.push(markerHole);

  const pinGeometry = new THREE.ExtrudeGeometry(markerShape, {
    depth: .028,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: .004,
    bevelThickness: .004,
    curveSegments: 24
  });
  pinGeometry.translate(0, 0, -.014);

  const color = colors[index % colors.length];
  const group = new THREE.Group();
  const basis = new THREE.Matrix4().makeBasis(east, north, normal);
  group.quaternion.setFromRotationMatrix(basis);
  group.position.copy(normal).multiplyScalar(globeRadius);

  const holder = new THREE.Group();
  holder.rotation.z = markerAngle;
  group.add(holder);

  const pin = new THREE.Mesh(
    pinGeometry,
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: .035,
      metalness: 0,
      roughness: .68
    })
  );
  const markerTilt = THREE.MathUtils.degToRad(52);
  pin.rotation.x = markerTilt;
  pin.position.z = .012;
  pin.castShadow = false;
  holder.add(pin);

  const base = new THREE.Mesh(
    new THREE.SphereGeometry(.017, 18, 12),
    new THREE.MeshStandardMaterial({ color, metalness: 0, roughness: .75 })
  );
  base.position.z = .01;
  group.add(base);

  const selectionRing = new THREE.Mesh(
    new THREE.RingGeometry(.043, .061, 32),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  );
  selectionRing.position.z = .006;
  group.add(selectionRing);
  group.scale.setScalar(.58);
  state.globeGroup.add(group);

  markerVisuals.set(location.id, {
    normal,
    bodyDirection,
    group,
    selectionRing,
    markerTilt,
    scale: .58,
    lift: 0,
    anchor: normal.clone().multiplyScalar(globeRadius + .12)
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
    globeGroup.quaternion.copy(orientationForLocation(locations[0]));
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
  } catch (error) {
    console.error('Field Notes globe could not be initialized.', error);
    showGlobeFallback();
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

function attachGlobeInteraction() {
  const canvas = elements.canvas;

  canvas.addEventListener('pointerdown', event => {
    if (!state.globeGroup) return;
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
    canvas.releasePointerCapture?.(event.pointerId);
    state.pointer = null;
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
}

function updateMarkerPositions() {
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
    const targetLift = active ? .012 : hovered ? .006 : 0;
    const targetScale = active ? .72 : hovered ? .64 : .58;
    visual.lift += (targetLift - visual.lift) * .18;
    visual.scale += (targetScale - visual.scale) * .18;
    visual.group.position.copy(visual.normal).multiplyScalar(globeRadius + visual.lift);
    visual.group.scale.setScalar(visual.scale);
    visual.selectionRing.material.opacity += ((active ? .52 : hovered ? .32 : 0) - visual.selectionRing.material.opacity) * .2;

    const bodyCenter = .116 * visual.scale;
    visual.anchor.copy(visual.normal).multiplyScalar(
      globeRadius + visual.lift + .012 + Math.sin(visual.markerTilt) * bodyCenter
    ).addScaledVector(visual.bodyDirection, Math.cos(visual.markerTilt) * bodyCenter);

    worldPoint.copy(visual.anchor).applyQuaternion(state.globeGroup.quaternion);
    worldNormal.copy(visual.normal).applyQuaternion(state.globeGroup.quaternion).normalize();
    towardCamera.copy(state.camera.position).sub(worldPoint).normalize();
    projected.copy(worldPoint).project(state.camera);
    const frontFacing = worldNormal.dot(towardCamera) > .08 && projected.z < 1;
    const onScreen = Math.abs(projected.x) < 1.02 && Math.abs(projected.y) < 1.02;
    const visible = frontFacing && onScreen;
    visual.group.visible = frontFacing;
    const x = (projected.x * .5 + .5) * width;
    const y = (-projected.y * .5 + .5) * height;

    markerScreenPositions.set(location.id, { x, y, visible });
    button.style.left = `${x}px`;
    button.style.top = `${y}px`;
    button.classList.toggle('is-visible', visible);
    button.classList.toggle('is-linked', hovered);
    button.setAttribute('aria-hidden', String(!visible));
    button.tabIndex = visible ? 0 : -1;

  });

  if (state.hoveredId && state.hoverSource === 'marker') {
    const point = markerScreenPositions.get(state.hoveredId);
    if (!point?.visible) hidePreview(state.hoveredId);
    else positionPreview(state.hoveredId);
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
    !state.selectedId &&
    now >= state.resumeRotationAt
  ) {
    const angle = -(delta / 100000) * Math.PI * 2;
    const rotation = new THREE.Quaternion().setFromAxisAngle(localUp, angle);
    state.globeGroup.quaternion.premultiply(rotation).normalize();
  }

  updateMarkerPositions();
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
  } else if (!state.selectedId) {
    state.resumeRotationAt = performance.now() + 1200;
  }
}

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
