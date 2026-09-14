/* Dhuneri — main.js
   Vanilla, zero dependencies, loaded with `defer`.
   1) mobile nav  2) P0 hero motion  3) P0 evidence disclosures
   4) fade-up IntersectionObserver  5) image .loaded polish. */
(function () {
    'use strict';

    /* ---------- 1. Mobile nav ---------- */
    var toggle = document.querySelector('.nav-toggle');
    var links = document.getElementById('nav-links') || document.querySelector('.nav-links');

    function closeNav() {
        document.body.classList.remove('nav-open');
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-label', 'Open menu');
        }
    }

    if (toggle && links) {
        toggle.addEventListener('click', function () {
            var open = document.body.classList.toggle('nav-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            if (open) {
                var first = links.querySelector('a');
                if (first) first.focus();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
                closeNav();
                toggle.focus();
            }
        });

        links.addEventListener('keydown', function (e) {
            if (e.key !== 'Tab' || !document.body.classList.contains('nav-open')) return;
            var focusables = links.querySelectorAll('a, button');
            if (!focusables.length) return;
            var last = focusables[focusables.length - 1];
            var first = focusables[0];
            if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            } else if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        });

        links.addEventListener('click', function (e) {
            if (e.target.closest('a')) closeNav();
        });
    }

    /* ---------- 2. P0 hero motion ---------- */
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var video = document.querySelector('.hero-video');
    var videoToggle = document.querySelector('[data-video-toggle]');

    function updateVideoControl() {
        if (!videoToggle || !video) return;
        var paused = video.paused;
        videoToggle.setAttribute('data-video-state', paused ? 'paused' : 'playing');
        videoToggle.setAttribute('aria-label', paused ? 'Play background motion' : 'Pause background motion');
        var label = videoToggle.querySelector('.video-control-label');
        if (label) label.textContent = paused ? 'Play motion' : 'Pause motion';
    }

    if (video && videoToggle) {
        if (reduceMotion) video.pause();
        videoToggle.addEventListener('click', function () {
            if (video.paused) {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') playPromise.catch(function () {});
            } else {
                video.pause();
            }
            updateVideoControl();
        });
        video.addEventListener('play', updateVideoControl);
        video.addEventListener('pause', updateVideoControl);
        updateVideoControl();
    }

    /* ---------- 3. P0 evidence disclosures ---------- */
    document.querySelectorAll('.evidence-card').forEach(function (card) {
        card.addEventListener('click', function () {
            var willOpen = card.getAttribute('aria-expanded') !== 'true';
            document.querySelectorAll('.evidence-card').forEach(function (other) {
                var isOpen = other === card && willOpen;
                other.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                other.classList.toggle('is-active', isOpen);
                var detailId = other.getAttribute('aria-controls');
                var detail = detailId ? document.getElementById(detailId) : null;
                if (detail) detail.hidden = !isOpen;
            });
        });
    });

    /* ---------- 4. Fade-up scroll reveal ---------- */
    var faders = document.querySelectorAll('.fade-up');

    if (reduceMotion || !('IntersectionObserver' in window)) {
        faders.forEach(function (el) { el.classList.add('in-view'); });
    } else {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        faders.forEach(function (el) { io.observe(el); });
    }

    /* ---------- 5. Image load polish ---------- */
    document.querySelectorAll('img').forEach(function (img) {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function () { img.classList.add('loaded'); }, { once: true });
        }
    });
}());
