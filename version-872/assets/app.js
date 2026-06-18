import { H as Hls } from './hls-vendor.js';

const ready = (callback) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
};

const normalize = (value) => String(value || '').trim().toLowerCase();

function setupNavigation() {
  const button = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-site-nav]');

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function setupHeroCarousel() {
  const carousel = document.querySelector('[data-hero-carousel]');

  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
  const previous = carousel.querySelector('[data-hero-prev]');
  const next = carousel.querySelector('[data-hero-next]');
  let current = 0;
  let timer = null;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  };

  const start = () => {
    timer = window.setInterval(() => show(current + 1), 5200);
  };

  const restart = () => {
    window.clearInterval(timer);
    start();
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      show(index);
      restart();
    });
  });

  previous?.addEventListener('click', () => {
    show(current - 1);
    restart();
  });

  next?.addEventListener('click', () => {
    show(current + 1);
    restart();
  });

  if (slides.length > 1) {
    start();
  }
}

function setupCardFilters() {
  const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach((panel) => {
    const scope = panel.parentElement || document;
    const input = panel.querySelector('[data-card-search]');
    const selects = Array.from(panel.querySelectorAll('[data-filter]'));
    const cards = Array.from(scope.querySelectorAll('[data-card]'));
    const counter = panel.querySelector('[data-filter-count]');

    const apply = () => {
      const query = normalize(input?.value);
      const filters = Object.fromEntries(
        selects.map((select) => [select.dataset.filter, normalize(select.value)])
      );
      let visible = 0;

      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags,
        ].join(' '));
        const matchedQuery = !query || haystack.includes(query);
        const matchedFilters = Object.entries(filters).every(([key, value]) => {
          if (!value) {
            return true;
          }
          return normalize(card.dataset[key]).includes(value);
        });
        const isVisible = matchedQuery && matchedFilters;
        card.hidden = !isVisible;
        if (isVisible) {
          visible += 1;
        }
      });

      if (counter) {
        counter.textContent = `已显示 ${visible} 部`;
      }
    };

    input?.addEventListener('input', apply);
    selects.forEach((select) => select.addEventListener('change', apply));
    apply();
  });
}

function setupPlayer() {
  const shells = Array.from(document.querySelectorAll('[data-player-shell]'));

  shells.forEach((shell) => {
    const video = shell.querySelector('video[data-video-src]');
    const button = shell.querySelector('[data-player-button]');

    if (!video || !button) {
      return;
    }

    const source = video.dataset.videoSrc;
    let initialized = false;

    const initialize = () => {
      if (initialized || !source) {
        return;
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    };

    const play = async () => {
      initialize();
      button.classList.add('is-hidden');

      try {
        await video.play();
      } catch (error) {
        button.classList.remove('is-hidden');
        console.warn('Video playback was blocked by the browser.', error);
      }
    };

    button.addEventListener('click', play);
    video.addEventListener('play', () => button.classList.add('is-hidden'));
    video.addEventListener('pause', () => {
      if (video.currentTime === 0) {
        button.classList.remove('is-hidden');
      }
    });
  });
}

function movieCardTemplate(movie) {
  const href = movie.href || `movies/${movie.id}.html`;
  const tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 3) : [];
  const tagsHtml = tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

  return `
    <article class="movie-card">
      <a class="poster-link" href="${href}" aria-label="观看 ${escapeHtml(movie.title)}">
        <img class="poster" src="${movie.image}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="card-rating">★ ${escapeHtml(movie.rating)}</span>
      </a>
      <div class="card-body">
        <div class="card-meta">
          <span>${escapeHtml(movie.regionGroup)}</span>
          <span>${escapeHtml(movie.year)}</span>
          <span>${escapeHtml(movie.type)}</span>
        </div>
        <h3><a href="${href}">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.oneLine)}</p>
        <div class="tag-row">${tagsHtml}</div>
        <a class="card-action" href="${href}">立即播放</a>
      </div>
    </article>`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setupSearchPage() {
  const page = document.querySelector('[data-search-page]');

  if (!page || !Array.isArray(window.MOVIE_DATA)) {
    return;
  }

  const form = page.querySelector('[data-search-form]');
  const input = page.querySelector('[data-search-input]');
  const region = page.querySelector('[data-search-region]');
  const type = page.querySelector('[data-search-type]');
  const summary = page.querySelector('[data-search-summary]');
  const results = page.querySelector('[data-search-results]');
  const params = new URLSearchParams(window.location.search);

  if (params.has('q')) {
    input.value = params.get('q') || '';
  }
  if (params.has('region')) {
    region.value = params.get('region') || '';
  }
  if (params.has('type')) {
    type.value = params.get('type') || '';
  }

  const render = () => {
    const query = normalize(input.value);
    const regionValue = normalize(region.value);
    const typeValue = normalize(type.value);
    const filtered = window.MOVIE_DATA.filter((movie) => {
      const haystack = normalize([
        movie.title,
        movie.region,
        movie.regionGroup,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags?.join(' '),
        movie.oneLine,
      ].join(' '));
      return (!query || haystack.includes(query))
        && (!regionValue || normalize(movie.regionGroup).includes(regionValue))
        && (!typeValue || normalize(movie.type).includes(typeValue));
    }).slice(0, 120);

    summary.textContent = `找到 ${filtered.length} 条结果${filtered.length === 120 ? '，仅显示前 120 条' : ''}`;
    results.innerHTML = filtered.map(movieCardTemplate).join('') || '<div class="prose-card"><h2>没有找到匹配影片</h2><p>请尝试更换关键词、地区或类型。</p></div>';
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const nextParams = new URLSearchParams();
    if (input.value.trim()) {
      nextParams.set('q', input.value.trim());
    }
    if (region.value) {
      nextParams.set('region', region.value);
    }
    if (type.value) {
      nextParams.set('type', type.value);
    }
    const queryString = nextParams.toString();
    const nextUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
    window.history.replaceState(null, '', nextUrl);
    render();
  });

  input.addEventListener('input', render);
  region.addEventListener('change', render);
  type.addEventListener('change', render);
  render();
}

ready(() => {
  setupNavigation();
  setupHeroCarousel();
  setupCardFilters();
  setupPlayer();
  setupSearchPage();
});
