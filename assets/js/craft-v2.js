(() => {
  const root = document.querySelector('.craft-v2');
  if (!root) return;
  const revealItems = [...root.querySelectorAll('.craft-v2-reveal')];
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }); }, { threshold: 0.1 });
    revealItems.forEach((item) => observer.observe(item));
  } else { revealItems.forEach((item) => item.classList.add('is-visible')); }
  const tabs = [...root.querySelectorAll('[role="tab"][data-title]')];
  const panel = root.querySelector('#craft-method-panel');
  const title = root.querySelector('#craft-method-title');
  const copy = root.querySelector('#craft-method-copy');
  const state = root.querySelector('#craft-method-state');
  const visual = root.querySelector('[data-craft-method-image]');
  const activate = (tab, focus = false) => {
    tabs.forEach((item) => { const selected = item === tab; item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1; });
    title.textContent = tab.dataset.title; copy.textContent = tab.dataset.copy; state.textContent = tab.dataset.state; visual.dataset.craftMethodImage = tab.dataset.image; panel.setAttribute('aria-labelledby', tab.id); if (focus) tab.focus();
  };
  tabs.forEach((tab, index) => { tab.addEventListener('click', () => activate(tab)); tab.addEventListener('keydown', (event) => { let target = null; if (event.key === 'ArrowRight') target = tabs[(index + 1) % tabs.length]; if (event.key === 'ArrowLeft') target = tabs[(index - 1 + tabs.length) % tabs.length]; if (event.key === 'Home') target = tabs[0]; if (event.key === 'End') target = tabs[tabs.length - 1]; if (target) { event.preventDefault(); activate(target, true); } }); });
})();
