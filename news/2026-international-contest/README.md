# Article folder: 2026 International Soil Judging Contest

Everything this article needs lives in this folder. Nothing outside it was
changed except `news.html`, which now links here.

```
news/2026-international-contest/
├── index.html        the article
├── carousel.css      carousel styles
├── carousel.js       carousel behaviour
├── README.md         this file
└── images/
    ├── training/     9 photos   (classroom training)
    ├── field/       21 photos   (field training)
    ├── social/       5 photos   (Soil Museum of China, Xuanwu Lake)
    ├── contest/     20 photos   (contest day)
    ├── awards/      23 photos   (awards ceremony, on stage)
    ├── extra/       21 photos   (awards ceremony, indoor)
    └── final-results.png        results infographic
```

Total: 99 photos, ~22 MB. The originals were 217 MB — they were converted from
HEIC where needed, rotated according to their EXIF orientation, resized to
1600 px on the long side and saved as progressive JPEG at quality 82. Two exact
duplicates were dropped (`grp 4 poland.jpg` = `8 poland-12.jpg`, and
`contest (13).jpg` = `field (13).jpg`).

## Starting the next article

Copy this folder, rename it (`news/2027-something/`), replace `images/` and the
text in `index.html`, then add a card to `news.html` pointing at the new folder.
Paths inside `index.html` are relative: `../../assets/...` for the shared site
files, `images/...` for this article's own photos.

If you later want the carousel shared across several articles instead of copied
into each one, move `carousel.css` and `carousel.js` to `assets/css/` and
`assets/js/` and update the two `<link>` / `<script>` tags. Both work; keeping a
copy per article means an old article never breaks when the component changes.

## Adding or removing a photo

One `<figure>` per photo. Nothing else to update — the arrows, the counter, the
dots and the lightbox are all generated from the slides that are present:

```html
<figure class="sj-carousel__slide">
  <img src="images/field/field-22.jpg" width="1600" height="1200"
       loading="lazy" decoding="async" alt="Describe the photo here">
  <figcaption class="sj-carousel__caption">Optional caption</figcaption>
</figure>
```

Keep `width` and `height` — they stop the page from jumping while photos load.
`loading="lazy"` on every photo except the very first one of the page.

## Adding a whole new carousel

```html
<div class="sj-carousel" data-sj-carousel data-label="Short label for screen readers">
  <p class="sj-carousel__title">Heading shown above the photos</p>
  <div class="sj-carousel__stage">
    <div class="sj-carousel__viewport">
      <!-- figures here -->
    </div>
  </div>
  <p class="sj-carousel__hint">Swipe or use the arrows &middot; tap a photo to enlarge it</p>
</div>
```

Up to 12 photos get dots; more than that get a progress bar instead, so the
controls stay usable with 20+ photos.

## Notes on the carousel

- No dependencies. It does not use Owl Carousel, Slick or the site's
  `lightbox.js`, so it cannot be broken by them.
- Works with swipe, the arrow buttons, the dots, and the keyboard
  (&larr; &rarr;, Home, End). Tapping a photo opens the full-size viewer;
  Esc closes it.
- Responsive: 16:10 stage on desktop, 3:2 on tablets, 4:3 on phones, capped at
  70% of the screen height so a carousel never fills the whole screen.
- Respects `prefers-reduced-motion`.
- Photos are letterboxed rather than cropped, because the set mixes landscape
  and portrait shots and cropping cut people out of the portrait ones.

## Two things worth knowing about the rest of the site

1. `news.html` was truncated in the repository — it ended mid-tag after the last
   card, with no closing `</section>`, no footer and no `<script>` tags, so the
   mobile "Menu" button did not work on that page. The version delivered with
   this article has the tail rebuilt.

2. `index.html` loads `vendor/bootstrap/js/bootstrap.bundle.min.js`, which does
   not exist in the repository (the file there is `bootstrap.min.js`). It is a
   silent 404 on every visit to the homepage. This article and the rebuilt
   `news.html` point at the file that exists; `index.html` still needs the fix.

3. Optional: the horizontal menu is only replaced by the hamburger below 767 px,
   so between 768 px and 991 px — iPad portrait, 820 px — the menu wraps onto two
   lines and overlaps the page heading. This affects every page. The fix is one
   number in `assets/css/templatemo-edu-meeting.css`: in the block that starts
   `@media (max-width: 767px)` and contains `.header-area .menu-trigger`, change
   `767px` to `991px`. It was left alone here because it changes every page.
