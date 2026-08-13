(function () {
  'use strict';

  /* ========================================================================
     Ano automático no rodapé
     ======================================================================== */
  var year = new Date().getFullYear();
  var yearEl = document.getElementById('year');
  var yearFooterEl = document.getElementById('yearFooter');
  if (yearEl) yearEl.textContent = year;
  if (yearFooterEl) yearFooterEl.textContent = year;

  /* ========================================================================
     Menu mobile (sidebar em overlay)
     ======================================================================== */
  var menuToggle = document.getElementById('menuToggle');
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('overlayBackdrop');

  function openMenu() {
    sidebar.classList.add('is-open');
    overlay.classList.add('is-active');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-active');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (menuToggle && sidebar && overlay) {
    menuToggle.addEventListener('click', function () {
      var isOpen = sidebar.classList.contains('is-open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    overlay.addEventListener('click', closeMenu);

    document.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && sidebar.classList.contains('is-open')) {
        closeMenu();
      }
    });
  }

  /* ========================================================================
     Scrollspy: destaca o link ativo na navegação lateral
     ======================================================================== */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var navMarker = document.getElementById('navMarker');
  var navList = document.getElementById('navList');

  var sectionIds = navLinks
    .map(function (link) { return link.getAttribute('data-target'); })
    .filter(Boolean);

  var sections = sectionIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function setActiveLink(id) {
    var activeLink = null;

    navLinks.forEach(function (link) {
      var isActive = link.getAttribute('data-target') === id;
      link.classList.toggle('is-active', isActive);
      if (isActive) activeLink = link;
    });

    if (activeLink && navMarker && navList) {
      var listRect = navList.getBoundingClientRect();
      var linkRect = activeLink.getBoundingClientRect();
      var offsetTop = linkRect.top - listRect.top;
      navMarker.style.top = offsetTop + 'px';
      navMarker.style.height = linkRect.height + 'px';
    }
  }

  if (sections.length && 'IntersectionObserver' in window) {
    var spyObserver = new IntersectionObserver(
      function (entries) {
        var visible = entries
          .filter(function (entry) { return entry.isIntersecting; })
          .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });

        if (visible.length > 0) {
          setActiveLink(visible[0].target.id);
        }
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    );

    sections.forEach(function (section) { spyObserver.observe(section); });

    // Define estado inicial
    window.addEventListener('load', function () {
      setActiveLink(sectionIds[0]);
    });
  }

  window.addEventListener('resize', function () {
    var current = document.querySelector('.nav-link.is-active');
    if (current) {
      setActiveLink(current.getAttribute('data-target'));
    }
  });

  /* ========================================================================
     Reveal on scroll — animação sutil de entrada
     ======================================================================== */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    revealEls.forEach(function (el, index) {
      // Pequeno atraso escalonado dentro de cada grupo, sem exagero
      el.style.transitionDelay = (index % 4) * 45 + 'ms';
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ========================================================================
     Filtro de projetos por categoria
     ======================================================================== */
  var filterBar = document.getElementById('filterBar');
  var projectGrid = document.getElementById('projectGrid');
  var filterEmpty = document.getElementById('filterEmpty');

  if (filterBar && projectGrid) {
    var projectCards = Array.prototype.slice.call(projectGrid.querySelectorAll('.project-card'));
    var tagSet = new Set();

    projectCards.forEach(function (card) {
      var tags = (card.getAttribute('data-tags') || '')
        .split(',')
        .map(function (tag) { return tag.trim(); })
        .filter(Boolean);
      tags.forEach(function (tag) { tagSet.add(tag); });
    });

    if (tagSet.size > 1) {
      var allButton = document.createElement('button');
      allButton.type = 'button';
      allButton.className = 'filter-btn is-active';
      allButton.textContent = 'Todos';
      allButton.setAttribute('data-filter', 'all');
      filterBar.appendChild(allButton);

      tagSet.forEach(function (tag) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'filter-btn';
        button.textContent = tag;
        button.setAttribute('data-filter', tag);
        filterBar.appendChild(button);
      });

      filterBar.addEventListener('click', function (event) {
        var button = event.target.closest('.filter-btn');
        if (!button) return;

        var filter = button.getAttribute('data-filter');

        filterBar.querySelectorAll('.filter-btn').forEach(function (btn) {
          btn.classList.toggle('is-active', btn === button);
        });

        var visibleCount = 0;

        projectCards.forEach(function (card) {
          var tags = (card.getAttribute('data-tags') || '')
            .split(',')
            .map(function (tag) { return tag.trim(); });

          var shouldShow = filter === 'all' || tags.indexOf(filter) !== -1;
          card.classList.toggle('is-hidden', !shouldShow);
          if (shouldShow) visibleCount += 1;
        });

        if (filterEmpty) {
          filterEmpty.setAttribute('data-visible', visibleCount === 0 ? 'true' : 'false');
        }
      });
    } else {
      filterBar.style.display = 'none';
    }
  }

  /* ========================================================================
     Copiar email para a área de transferência
     ======================================================================== */
  var copyEmailBtn = document.getElementById('copyEmailBtn');

  if (copyEmailBtn) {
    var copyLabel = copyEmailBtn.querySelector('.copy-btn-text');
    var originalLabel = copyLabel ? copyLabel.textContent : 'Copiar';
    var copyTimeout = null;

    copyEmailBtn.addEventListener('click', function () {
      var email = copyEmailBtn.getAttribute('data-email') || '';

      function showCopied() {
        copyEmailBtn.classList.add('is-copied');
        if (copyLabel) copyLabel.textContent = 'Copiado';
        copyEmailBtn.setAttribute('aria-label', 'Endereço de email copiado');

        clearTimeout(copyTimeout);
        copyTimeout = setTimeout(function () {
          copyEmailBtn.classList.remove('is-copied');
          if (copyLabel) copyLabel.textContent = originalLabel;
          copyEmailBtn.setAttribute('aria-label', 'Copiar endereço de email');
        }, 2000);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(showCopied).catch(function () {
          fallbackCopy(email, showCopied);
        });
      } else {
        fallbackCopy(email, showCopied);
      }
    });
  }

  function fallbackCopy(text, onSuccess) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      onSuccess();
    } catch (error) {
      // Falha silenciosa: usuário ainda pode copiar manualmente
    }

    document.body.removeChild(textarea);
  }

  /* ========================================================================
     Botão voltar ao topo
     ======================================================================== */
  var backToTop = document.getElementById('backToTop');

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
