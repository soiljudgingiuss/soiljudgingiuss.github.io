/* =============================================================
   SJ Carousel — Soil Judging IUSS
   Vanilla JS, no dependencies. Initialises every [data-sj-carousel].

   Markup expected:
   <div class="sj-carousel" data-sj-carousel>
     <div class="sj-carousel__stage">
       <div class="sj-carousel__viewport">
         <figure class="sj-carousel__slide">
           <img src="..." alt="...">
           <figcaption class="sj-carousel__caption">optional</figcaption>
         </figure>
         ...
       </div>
     </div>
   </div>

   Arrows, counter, dots/progress bar and the lightbox are generated here,
   so adding a photo only means adding one more <figure> to the HTML.
   ============================================================= */
(function () {
  'use strict';

  var DOTS_LIMIT = 12; // more photos than this -> progress bar instead of dots

  var ICON = {
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
  };

  /* ---------------------------------------------------------
     Lightbox (one instance shared by every carousel on the page)
     --------------------------------------------------------- */
  var Lightbox = {
    el: null,
    img: null,
    caption: null,
    slides: [],
    index: 0,
    lastFocus: null,

    build: function () {
      if (this.el) return;
      var box = document.createElement('div');
      box.className = 'sj-lightbox';
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');
      box.setAttribute('aria-label', 'Photo viewer');
      box.innerHTML =
        '<img class="sj-lightbox__img" src="" alt="">' +
        '<p class="sj-lightbox__caption"></p>' +
        '<span class="sj-lightbox__count"></span>' +
        '<button type="button" class="sj-lightbox__btn sj-lightbox__btn--close" aria-label="Close">' + ICON.close + '</button>' +
        '<button type="button" class="sj-lightbox__btn sj-lightbox__btn--prev" aria-label="Previous photo">' + ICON.prev + '</button>' +
        '<button type="button" class="sj-lightbox__btn sj-lightbox__btn--next" aria-label="Next photo">' + ICON.next + '</button>';
      document.body.appendChild(box);

      this.el = box;
      this.img = box.querySelector('.sj-lightbox__img');
      this.caption = box.querySelector('.sj-lightbox__caption');
      this.count = box.querySelector('.sj-lightbox__count');
      this.btnPrev = box.querySelector('.sj-lightbox__btn--prev');
      this.btnNext = box.querySelector('.sj-lightbox__btn--next');
      this.btnClose = box.querySelector('.sj-lightbox__btn--close');

      var self = this;
      this.btnClose.addEventListener('click', function () { self.close(); });
      this.btnPrev.addEventListener('click', function () { self.go(self.index - 1); });
      this.btnNext.addEventListener('click', function () { self.go(self.index + 1); });
      box.addEventListener('click', function (e) {
        if (e.target === box || e.target === self.img) self.close();
      });

      // swipe inside the lightbox
      var startX = null;
      box.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
      box.addEventListener('touchend', function (e) {
        if (startX === null) return;
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 45) self.go(self.index + (dx < 0 ? 1 : -1));
        startX = null;
      }, { passive: true });

      document.addEventListener('keydown', function (e) {
        if (!self.el.classList.contains('is-open')) return;
        if (e.key === 'Escape') { self.close(); }
        else if (e.key === 'ArrowRight') { self.go(self.index + 1); }
        else if (e.key === 'ArrowLeft') { self.go(self.index - 1); }
      });
    },

    open: function (slides, index) {
      this.build();
      this.slides = slides;
      this.lastFocus = document.activeElement;
      this.el.classList.add('is-open');
      document.body.classList.add('sj-lightbox-open');
      this.go(index);
      this.btnClose.focus();
    },

    go: function (i) {
      if (i < 0 || i >= this.slides.length) return;
      this.index = i;
      var img = this.slides[i].querySelector('img');
      var cap = this.slides[i].querySelector('.sj-carousel__caption');
      this.img.src = img.getAttribute('src');
      this.img.alt = img.getAttribute('alt') || '';
      this.caption.textContent = cap ? cap.textContent : '';
      this.count.textContent = (i + 1) + ' / ' + this.slides.length;
      this.btnPrev.disabled = (i === 0);
      this.btnNext.disabled = (i === this.slides.length - 1);
    },

    close: function () {
      this.el.classList.remove('is-open');
      document.body.classList.remove('sj-lightbox-open');
      this.img.src = '';
      if (this.lastFocus && this.lastFocus.focus) this.lastFocus.focus();
    }
  };

  /* ---------------------------------------------------------
     Carousel
     --------------------------------------------------------- */
  function initCarousel(root, id) {
    var stage = root.querySelector('.sj-carousel__stage');
    var viewport = root.querySelector('.sj-carousel__viewport');
    var slides = Array.prototype.slice.call(root.querySelectorAll('.sj-carousel__slide'));
    if (!viewport || slides.length === 0) return;

    var label = root.getAttribute('data-label') || 'Photo gallery';
    var total = slides.length;
    var index = 0;

    viewport.setAttribute('role', 'group');
    viewport.setAttribute('aria-roledescription', 'carousel');
    viewport.setAttribute('aria-label', label);
    viewport.setAttribute('tabindex', '0');

    slides.forEach(function (s, i) {
      s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'slide');
      s.setAttribute('aria-label', (i + 1) + ' of ' + total);
    });

    /* --- counter --- */
    var counter = document.createElement('div');
    counter.className = 'sj-carousel__counter';
    counter.setAttribute('aria-live', 'polite');
    stage.appendChild(counter);

    /* --- arrows (only when there is more than one photo) --- */
    var prev, next;
    if (total > 1) {
      prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'sj-carousel__nav sj-carousel__nav--prev';
      prev.setAttribute('aria-label', 'Previous photo');
      prev.innerHTML = ICON.prev;

      next = document.createElement('button');
      next.type = 'button';
      next.className = 'sj-carousel__nav sj-carousel__nav--next';
      next.setAttribute('aria-label', 'Next photo');
      next.innerHTML = ICON.next;

      stage.appendChild(prev);
      stage.appendChild(next);

      prev.addEventListener('click', function () { goTo(index - 1); });
      next.addEventListener('click', function () { goTo(index + 1); });
    }

    /* --- dots or progress bar --- */
    var dots = null, progress = null;
    if (total > 1 && total <= DOTS_LIMIT) {
      dots = document.createElement('ul');
      dots.className = 'sj-carousel__dots';
      slides.forEach(function (s, i) {
        var li = document.createElement('li');
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'sj-carousel__dot';
        b.setAttribute('aria-label', 'Go to photo ' + (i + 1));
        b.addEventListener('click', function () { goTo(i); });
        li.appendChild(b);
        dots.appendChild(li);
      });
      root.insertBefore(dots, stage.nextSibling);
    } else if (total > 1) {
      progress = document.createElement('div');
      progress.className = 'sj-carousel__progress';
      progress.innerHTML = '<span></span>';
      root.insertBefore(progress, stage.nextSibling);
    }

    /* --- state --- */
    function render() {
      counter.textContent = (index + 1) + ' / ' + total;
      if (prev) prev.disabled = (index === 0);
      if (next) next.disabled = (index === total - 1);
      if (dots) {
        var btns = dots.querySelectorAll('.sj-carousel__dot');
        for (var i = 0; i < btns.length; i++) {
          btns[i].setAttribute('aria-current', i === index ? 'true' : 'false');
        }
      }
      if (progress) {
        progress.firstChild.style.width = ((index + 1) / total * 100) + '%';
      }
    }

    function goTo(i) {
      if (i < 0 || i >= total) return;
      var left = slides[i].offsetLeft - slides[0].offsetLeft;

      /* `scroll-snap-stop: always` keeps a swipe to one photo at a time, but it
         also forces a smooth programmatic scroll to stop at every snap point in
         between — so jumping straight to a distant slide (a dot click) never
         arrives. Jumps of more than one slide are therefore made instantly. */
      if (Math.abs(i - index) > 1) {
        var previous = viewport.style.scrollBehavior;
        viewport.style.scrollBehavior = 'auto';
        viewport.scrollLeft = left;
        window.requestAnimationFrame(function () {
          viewport.style.scrollBehavior = previous;
        });
      } else {
        viewport.scrollTo({ left: left, behavior: 'smooth' });
      }

      index = i;
      render();
    }

    /* --- keep index in sync while the user swipes --- */
    var ticking = false;
    viewport.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var w = slides[0].getBoundingClientRect().width || 1;
        var i = Math.round(viewport.scrollLeft / w);
        if (i !== index && i >= 0 && i < total) { index = i; render(); }
        ticking = false;
      });
    }, { passive: true });

    /* --- keyboard on the viewport --- */
    viewport.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
      else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
      else if (e.key === 'End') { e.preventDefault(); goTo(total - 1); }
    });

    /* --- click a photo to enlarge --- */
    slides.forEach(function (s, i) {
      var img = s.querySelector('img');
      if (!img) return;
      img.addEventListener('click', function () { Lightbox.open(slides, i); });
    });

    /* --- re-align after a resize (orientation change on phones) --- */
    var t;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        viewport.scrollLeft = slides[index].offsetLeft - slides[0].offsetLeft;
      }, 150);
    });

    render();
  }

  function boot() {
    var list = document.querySelectorAll('[data-sj-carousel]');
    for (var i = 0; i < list.length; i++) initCarousel(list[i], i);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
