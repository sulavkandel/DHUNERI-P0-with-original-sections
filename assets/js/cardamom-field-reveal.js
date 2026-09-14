/* DHUNERI — Cardamom Field Reveal module
   Isolated first-visit interaction. No dependencies. */
(function () {
  'use strict';

  var root = document.querySelector('[data-cfr-root]');
  if (!root) return;
  var homeLayer = root.closest('.cfr-home-layer');

  var canvas = root.querySelector('.cfr-veil');
  var ctx = canvas ? canvas.getContext('2d', { willReadFrequently: false }) : null;
  var pointer = root.querySelector('.cfr-pointer');
  var frameLabel = root.querySelector('[data-cfr-frame-label]');
  var debugFrame = root.querySelector('[data-cfr-debug-frame]');
  var progressBar = root.querySelector('[data-cfr-progress]');
  var instruction = root.querySelector('[data-cfr-instruction]');
  var skip = root.querySelector('[data-cfr-skip]');
  var baseImage = new Image();
  var coverImage = new Image();
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  var progress = 0;
  var pointerInside = false;
  var completed = false;
  var alreadySeen = false;
  var lastPoint = null;
  var lastBrushTime = 0;
  var cssWidth = 0;
  var cssHeight = 0;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var sessionKey = 'dhuneri-cardamom-field-reveal-seen';
  var forceFresh = new URLSearchParams(window.location.search).has('fresh');
  var frameLabels = [
    '01 · Initial', '02 · Hand enters', '03 · Reveal begins',
    '04 · More revealed', '05 · Almost revealed', '06 · Final'
  ];

  function setState(state) {
    root.setAttribute('data-cfr-state', state);
    var frame = state === 'final' ? 6 : state === 'almost' ? 5 : state === 'more' ? 4 : state === 'begin' ? 3 : state === 'hand' ? 2 : 1;
    if (frameLabel) frameLabel.textContent = frameLabels[frame - 1];
    if (debugFrame) debugFrame.textContent = 'Frame ' + frame;
    if (progressBar) progressBar.style.width = Math.round(Math.max(progress, (frame - 1) / 5) * 100) + '%';
  }

  function setProgress(value) {
    if (completed) return;
    progress = Math.max(progress, Math.min(1, value));
    if (progress >= .92) completeReveal();
    else if (progress >= .68) setState('almost');
    else if (progress >= .42) setState('more');
    else if (progress >= .16) setState('begin');
    else if (pointerInside) setState('hand');
    else setState('initial');
  }

  function releaseHomeLayer(delay) {
    if (!homeLayer) return;
    window.setTimeout(function () { homeLayer.classList.add('is-released'); }, delay || 0);
  }

  function completeReveal() {
    if (completed) return;
    completed = true;
    progress = 1;
    setState('final');
    if (instruction) instruction.textContent = 'The field is open';
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
    }
    try { window.sessionStorage.setItem(sessionKey, 'true'); } catch (e) { /* storage may be unavailable */ }
    if (homeLayer) releaseHomeLayer(reducedMotion || coarsePointer ? 100 : 180);
  }

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    var rect = root.getBoundingClientRect();
    cssWidth = Math.max(1, rect.width);
    cssHeight = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    canvas.style.width = cssWidth + 'px';
    canvas.style.height = cssHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawCover();
  }

  function drawCover() {
    if (!ctx || !coverImage.complete || !coverImage.naturalWidth || completed) return;
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    var imageRatio = coverImage.naturalWidth / coverImage.naturalHeight;
    var boxRatio = cssWidth / cssHeight;
    var drawWidth = cssWidth;
    var drawHeight = cssHeight;
    var offsetX = 0;
    var offsetY = 0;
    if (imageRatio > boxRatio) {
      drawWidth = cssHeight * imageRatio;
      offsetX = (cssWidth - drawWidth) * .5;
    } else {
      drawHeight = cssWidth / imageRatio;
      offsetY = (cssHeight - drawHeight) * .5;
    }
    ctx.drawImage(coverImage, offsetX, offsetY, drawWidth, drawHeight);
    ctx.restore();
  }

  function eraseAt(x, y, radius) {
    if (!ctx || completed) return;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    var gradient = ctx.createRadialGradient(x, y, radius * .08, x, y, radius);
    gradient.addColorStop(0, 'rgba(0,0,0,.98)');
    gradient.addColorStop(.62, 'rgba(0,0,0,.78)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function brushAt(clientX, clientY) {
    if (completed || coarsePointer) return;
    var rect = root.getBoundingClientRect();
    var x = clientX - rect.left;
    var y = clientY - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
    var now = Date.now();
    if (now - lastBrushTime < 22) return;
    lastBrushTime = now;
    if (pointer) {
      pointer.style.left = clientX + 'px';
      pointer.style.top = clientY + 'px';
    }
    if (lastPoint) {
      var dx = x - lastPoint.x;
      var dy = y - lastPoint.y;
      var distance = Math.sqrt(dx * dx + dy * dy);
      var steps = Math.max(1, Math.ceil(distance / 26));
      for (var i = 1; i <= steps; i += 1) {
        var t = i / steps;
        eraseAt(lastPoint.x + dx * t, lastPoint.y + dy * t, Math.max(54, Math.min(130, cssWidth * .075)));
      }
      setProgress(progress + Math.min(.025, .004 + distance / Math.max(16000, cssWidth * cssHeight * .018)));
    }
    lastPoint = { x: x, y: y };
  }

  function pointerEnter(event) {
    if (coarsePointer || completed) return;
    pointerInside = true;
    root.setAttribute('data-cfr-has-pointer', 'true');
    if (instruction) instruction.textContent = 'Move through the field';
    setState(progress > 0 ? 'begin' : 'hand');
    brushAt(event.clientX, event.clientY);
  }

  function pointerLeave() {
    pointerInside = false;
    lastPoint = null;
    root.removeAttribute('data-cfr-has-pointer');
    if (!completed && progress < .16) setState('initial');
  }

  function onScroll() {
    if (completed) return;
    var scrollProgress = Math.min(1, window.scrollY / Math.max(1, window.innerHeight * .82));
    if (scrollProgress > progress) setProgress(scrollProgress);
  }

  function onKeydown(event) {
    if (event.key === 'Escape' || event.key === 'Enter' && document.activeElement === skip) completeReveal();
  }

  var groundUrl = root.getAttribute('data-cfr-ground');
  var coverUrl = root.getAttribute('data-cfr-cover');
  if (groundUrl) baseImage.src = groundUrl;
  coverImage.addEventListener('load', resizeCanvas);
  coverImage.addEventListener('error', function () {
    if (instruction) instruction.textContent = 'Field image unavailable · skip to continue';
    if (skip) skip.focus();
  });
  if (coverUrl) {
    coverImage.src = coverUrl;
    if (coverImage.complete && coverImage.naturalWidth) resizeCanvas();
  }
  window.addEventListener('resize', resizeCanvas, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  root.addEventListener('pointerenter', pointerEnter);
  root.addEventListener('pointermove', function (event) {
    if (pointerInside) brushAt(event.clientX, event.clientY);
  });
  root.addEventListener('pointerleave', pointerLeave);
  document.addEventListener('keydown', onKeydown);
  if (skip) skip.addEventListener('click', completeReveal);

  var navigation = window.performance && window.performance.getEntriesByType ? window.performance.getEntriesByType('navigation')[0] : null;
  var isReload = navigation && navigation.type === 'reload';
  try {
    if (!forceFresh && !isReload && window.sessionStorage.getItem(sessionKey) === 'true') alreadySeen = true;
  } catch (e) { /* storage may be unavailable */ }

  resizeCanvas();
  if (alreadySeen) {
    completed = true;
    setState('final');
    releaseHomeLayer(0);
  } else if (reducedMotion || coarsePointer) {
    completeReveal();
  } else {
    setState('initial');
  }
}());
