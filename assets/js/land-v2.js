/* Dhuneri — The Land V2 interactions. Vanilla, dependency-free. */
(function () {
    'use strict';

    var mapMarkers = document.querySelectorAll('[data-land-map-marker]');
    var mapTitle = document.getElementById('land-map-title');
    var mapCopy = document.getElementById('land-map-copy');

    mapMarkers.forEach(function (marker) {
        marker.addEventListener('click', function () {
            mapMarkers.forEach(function (other) {
                var active = other === marker;
                other.classList.toggle('is-active', active);
                other.setAttribute('aria-pressed', active ? 'true' : 'false');
            });
            if (mapTitle) mapTitle.textContent = marker.getAttribute('data-title') || '';
            if (mapCopy) mapCopy.textContent = marker.getAttribute('data-copy') || '';
        });
    });

    var seasonTabs = document.querySelectorAll('[data-land-season]');
    var seasonTitle = document.getElementById('land-season-title');
    var seasonCopy = document.getElementById('land-season-copy');
    var seasonStatus = document.getElementById('land-season-status');
    var seasonImage = document.getElementById('land-season-image');

    function selectSeason(tab) {
        seasonTabs.forEach(function (other) {
            var active = other === tab;
            other.classList.toggle('is-active', active);
            other.setAttribute('aria-selected', active ? 'true' : 'false');
            other.setAttribute('tabindex', active ? '0' : '-1');
        });
        if (seasonTitle) seasonTitle.textContent = tab.getAttribute('data-title') || '';
        if (seasonCopy) seasonCopy.textContent = tab.getAttribute('data-copy') || '';
        if (seasonStatus) seasonStatus.textContent = tab.getAttribute('data-status') || '';
        if (seasonImage && tab.hasAttribute('data-image')) {
            seasonImage.src = tab.getAttribute('data-image');
        }
    }

    seasonTabs.forEach(function (tab, index) {
        tab.setAttribute('tabindex', index === 0 ? '0' : '-1');
        tab.addEventListener('click', function () { selectSeason(tab); });
        tab.addEventListener('keydown', function (event) {
            if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'Home' && event.key !== 'End') return;
            event.preventDefault();
            var nextIndex;
            if (event.key === 'Home') nextIndex = 0;
            else if (event.key === 'End') nextIndex = seasonTabs.length - 1;
            else nextIndex = (index + (event.key === 'ArrowRight' ? 1 : -1) + seasonTabs.length) % seasonTabs.length;
            var next = seasonTabs[nextIndex];
            selectSeason(next);
            next.focus();
        });
    });
}());
