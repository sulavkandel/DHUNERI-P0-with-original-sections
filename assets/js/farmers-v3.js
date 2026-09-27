(() => {
    const root = document.querySelector('.farmers-v3');
    if (!root) return;

    const data = {
        operation: [
            ['Capacity', 'How much wet cardamom must one batch accept?'],
            ['Fuel and power', 'What resources are available reliably at the drying site?'],
            ['Attention', 'How often must someone feed, turn or monitor the batch?']
        ],
        economics: [
            ['Up-front cost', 'What purchase or construction cost is realistic?'],
            ['Running cost', 'How do fuel, power, labour and maintenance compare?'],
            ['Repairability', 'Can parts and skills be found near the farm?']
        ],
        quality: [
            ['Visible endpoint', 'How does the operator decide the batch is dry enough?'],
            ['Repeatability', 'Can different operators reach similar conditions?'],
            ['Buyer response', 'Which quality signals affect acceptance and price?']
        ]
    };

    const tabs = [...root.querySelectorAll('[data-farmers-tab]')];
    const panel = root.querySelector('[data-farmers-panel]');
    const render = key => {
        panel.innerHTML = data[key].map((item, index) => `<article><b>0${index + 1}</b><h3>${item[0]}</h3><p>${item[1]}</p></article>`).join('');
    };
    render('operation');

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => select(tab));
        tab.addEventListener('keydown', event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            let next = index;
            if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
            if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
            if (event.key === 'Home') next = 0;
            if (event.key === 'End') next = tabs.length - 1;
            tabs[next].focus();
            select(tabs[next]);
        });
    });

    function select(active) {
        tabs.forEach(tab => {
            const selected = tab === active;
            tab.classList.toggle('is-active', selected);
            tab.setAttribute('aria-selected', String(selected));
            tab.tabIndex = selected ? 0 : -1;
        });
        render(active.dataset.farmersTab);
    }

    if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const observer = new IntersectionObserver(entries => entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        }), {threshold: 0.12});
        root.querySelectorAll('.farmers-v3-reveal').forEach(item => observer.observe(item));
    } else {
        root.querySelectorAll('.farmers-v3-reveal').forEach(item => item.classList.add('is-visible'));
    }
})();
