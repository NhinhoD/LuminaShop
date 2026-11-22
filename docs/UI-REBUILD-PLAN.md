# KhoUI — UI Rebuild & GSAP Motion Plan

> Trạng thái: **PLAN — đã chốt phạm vi, chưa sửa code**
> Phạm vi đã xác nhận: **toàn bộ storefront, trừ `/admin`**, chia 6 phase.
> Tài liệu liên quan: [`AGENTS.md`](../AGENTS.md), [`DESIGN.md`](../DESIGN.md), [`docs/STATUS.md`](STATUS.md)

---

## 1. Chẩn đoán hiện trạng

### 1.1 Những gì đang có
- Next.js 16 App Router, Tailwind 4, `gsap ^3.15`, `lenis ^1.3`, `framer-motion ^12`.
- Home page một file lớn `HomePageClient.tsx` (~1.700 dòng) trộn: dữ liệu fallback, i18n inline, Framer Motion, GSAP, 3D mockup PNG, dot grid canvas, marquee CSS.
- Navbar/Footer dùng glassmorphism + gradient xanh, topbar dark, mega menu.
- `SmoothScrollProvider` đã nối Lenis ↔ ScrollTrigger đúng chuẩn, có xử lý reduced-motion.

### 1.2 Vấn đề thiết kế (theo `redesign-skill` + `taste-skill` + `impeccable`)
| # | Vấn đề | Hệ quả |
|---|---|---|
| 1 | Palette xanh dương + gradient aurora + glass = ngôn ngữ "AI SaaS mặc định" | Không khác biệt so với hàng nghìn landing page; không thể hiện "chợ template thiết kế" |
| 2 | Hero phụ thuộc ảnh PNG 3D + 5 badge nổi + hạt orbit | Nặng LCP, khó responsive, cảm giác "demo AI" hơn là sản phẩm thật |
| 3 | 3 card ưu điểm bằng nhau, 3 testimonial bằng nhau, 3 bước bằng nhau | Nhịp điệu đơn điệu, đúng pattern bị skill cảnh báo |
| 4 | Eyebrow uppercase ở mọi section + tiêu đề căn giữa | Thiếu phân cấp thị giác, đọc như template |
| 5 | Marquee + float + pulse + scanline + ping + tilt + counter + parallax cùng lúc | Chuyển động không có "lý do", tranh nhau sự chú ý, khó đạt 60fps |
| 6 | Framer Motion và GSAP cùng điều khiển transform trên một số cụm | Hai engine giành quyền ghi style, khó debug, tốn bundle |
| 7 | `NavbarClient` dùng `window.addEventListener("scroll")` | Vi phạm skill GSAP (phải dùng ScrollTrigger) |
| 8 | Test hiện tại khẳng định **trang trí** (texture, 5 header, hero-inner) chứ không khẳng định hành vi | Rebuild sẽ làm test đỏ; test cần được viết lại theo behavior |

### 1.3 Ràng buộc bắt buộc
- Không thêm dependency (không cài `@gsap/react`) → dùng `useEffect` + `gsap.context()` + `ctx.revert()`.
- Không hardcode UI string → mọi chữ mới phải vào `src/i18n/dictionaries/vi.ts` + `en.ts`.
- Không đổi schema/DB/server actions, không đụng `src/server/*`.
- Không commit/push; không ghi đè thay đổi của người dùng.
- Animation chỉ `transform` / `opacity`; tôn trọng `prefers-reduced-motion`; một page chỉ một marquee.
- Quality gate cuối: `npx tsc --noEmit`, `npm test`, `npm run lint`, `npm run build` và báo cáo PASS/FAIL thật.

---

## 2. Hướng thiết kế mới: **SPEC SHEET — “Danh mục bản vẽ”**

### 2.1 Ý tưởng
KhoUI không trình bày mình như một SaaS khác, mà như **một catalogue thiết kế in ấn / bản vẽ kỹ thuật**: mỗi template là một “specimen” có số thứ tự, thông số kỹ thuật, giấy phép, và preview được đóng khung như bản in thử.

- Người xem cảm nhận ngay: đây là nơi bán **vật phẩm thiết kế có cấu trúc**, không phải kho landing page ngẫu nhiên.
- Bản thân UI là bằng chứng năng lực design → tăng niềm tin mua template.
- Khác biệt rõ với 3 template tĩnh vừa làm (Aster editorial ấm, Relay technical-lime, Northline private-bank) và với bản hiện tại (SaaS xanh).

### 2.2 Dials
| Dial | Cũ | Mới | Lý do |
|---|---|---|---|
| `DESIGN_VARIANCE` | 7 | **8** | Bố cục bất đối xứng 5/7, 4/8, section số thứ tự, lưới hairline |
| `MOTION_INTENSITY` | 5 | **7** | Có pinned sequence + scrub + mask reveal, nhưng chỉ 1 pin |
| `VISUAL_DENSITY` | 5 | **6** | Nhiều metadata kiểu spec sheet nhưng vẫn thoáng |

### 2.3 Palette
| Token | Hex | Dùng cho |
|---|---|---|
| `paper` | `#F2F0EA` | Nền chính (giấy xám ấm, **không** beige-brass) |
| `ink` | `#0B0B0F` | Chữ, khối CTA, footer |
| `ink-soft` | `#4A4A50` | Body phụ |
| `signal` | `#FF4A1C` | CTA, stamp, underline, active index |
| `cobalt` | `#1B2AFF` | Link kỹ thuật, hairline nhấn, chip |
| `acid` | `#D9FF3D` | Highlight **chỉ** trên nền ink |
| `line` | `#D8D5CC` | Hairline / viền 1px |

Quy tắc: tối đa 1 vùng acid mỗi trang; signal không dùng cho khối lớn; không gradient nhiều màu.

### 2.4 Typography (đã xác minh có subset `vietnamese`)
| Vai trò | Font | Ghi chú |
|---|---|---|
| Display | **Archivo** (variable 400–900) | Tiêu đề lớn, tracking `-0.04em`, uppercase cho stamp/số |
| Body | **Be Vietnam Pro** | Tối ưu tiếng Việt, thay Plus Jakarta Sans |
| Mono | **IBM Plex Mono** | Số thứ tự `01`, tech chip, license, meta |

Bỏ: Inter, Fraunces/Instrument Serif, serif luxury.

### 2.5 Hình ngôn ngữ
- Hairline 1px (`--line`) làm cấu trúc; radius 2–6px (bỏ `rounded-3xl`).
- Preview template đặt trong **khung browser giả** (thanh địa chỉ + 3 chấm) thay vì card glass.
- Số thứ tự section `01 — CATALOG`, `02 — SPECS`… đóng vai trò nhãn, **không** dùng eyebrow uppercase cho mọi section.
- Nền có lưới mảnh 1 lớp + noise rất nhẹ (CSS/SVG, không ảnh nặng).
- Loại bỏ: aurora blob, dot-grid canvas, ảnh mockup 3D PNG, badge PNG, scanline.

---

## 3. Bố cục Home mới (section-by-section)

| # | Section | Bố cục mới | Tương tác / Motion |
|---|---|---|---|
| 01 | **Hero / Cover** | 7/5: trái là display 3 dòng + meta; phải là “specimen stack” 3 preview thật (ảnh sản phẩm) lệch nhau, có nhãn số + tech chip | Mask reveal từng dòng; stack vào bằng `y + rotate`; parallax nhẹ khi scroll; không 3D PNG |
| 02 | **Statement ticker** | 1 dải chữ chạy duy nhất: `HTML5 · CSS3 · JS · BOOTSTRAP 5 · RESPONSIVE` | Marquee CSS (pause on hover/reduced-motion) — **chỉ 1 lần/trang** |
| 03 | **Category index** | Danh sách hàng `01–04` full-width, hover đổi màu + hiện preview ảnh đi theo cursor | `gsap.quickTo` cho preview; filter điều hướng giữ nguyên logic hiện tại |
| 04 | **Featured catalog** | Bento bất đối xứng: 1 card lớn + 2 nhỏ + hàng tiếp; card = khung browser + meta (giá, license, tech) | `ScrollTrigger.batch` reveal; hover: ảnh scale 1.04 + nút “Xem demo” trượt lên |
| 05 | **Engineering specs** | Sticky trái (claim lớn + progress dọc), phải là 3–4 “spec row” kích hoạt theo scroll | CSS sticky + ScrollTrigger toggle active; thanh tiến trình `scaleY` |
| 06 | **Journey 3 bước** | Desktop: pin ngang 3 panel; Mobile: stack dọc | `pin + scrub` trong `gsap.matchMedia("(min-width: 1024px)")`; mobile chỉ reveal |
| 07 | **Testimonials** | 1 pull-quote lớn + danh sách quote nhỏ bên cạnh (không 3 card đều) | Reveal theo dòng; không float vô hạn |
| 08 | **Newsletter / CTA** | Khối ink full-bleed, tiêu đề lớn + acid underline + form | Underline `scaleX` khi vào viewport; magnetic button |
| — | **Footer** | Ink, wordmark lớn, cột link + mono index, giữ nguyên nội dung/i18n | Reveal nhẹ, không marquee |

---

## 4. Inventory GSAP

### 4.1 Hạ tầng dùng chung
- `useGsapEffect(callback, deps)` — wrapper `useEffect` + `gsap.context(cb, scopeRef)` + `ctx.revert()`, SSR-safe, có return type rõ ràng.
- `gsap.matchMedia()` cho 3 nhánh: `(prefers-reduced-motion: reduce)`, `(min-width: 1024px)`, `(max-width: 1023px)`.
- `ScrollTrigger.config({ ignoreMobileResize: true })`.
- Sau khi ảnh/font load: `document.fonts.ready.then(...)` + `ScrollTrigger.refresh()` (debounced, cleanup đầy đủ) — chỉ khi layout thực sự đổi.
- Xoá `window.addEventListener("scroll")` ở Navbar → `ScrollTrigger.create({ start: 20, onToggle })`.

### 4.2 Choreography
1. **Hero intro timeline** — `defaults: { ease: "power4.out", duration: 1 }`; label `intro`; masked lines (`yPercent: 110 → 0`), specimen stack (`y: 40, rotate: 2 → 0`, stagger 0.12), meta fade.
2. **Hero exit scrub** — `yPercent: 6`, `opacity: 0.35`, `scrub: 0.6`; chỉ desktop.
3. **Section reveals** — `ScrollTrigger.batch(".reveal", { start: "top 88%", once: true })`, `y: 24`, `opacity: 0`, stagger 0.06.
4. **Specs stepper** — mỗi row `ScrollTrigger` `toggleClass: "is-active"`, progress `scaleY` scrub 0.4.
5. **Journey pin** — `xPercent: -66.66`, `pin: true`, `scrub: 1`, `end: "+=" + (panels * 60%)`; `invalidateOnRefresh: true`.
6. **Category preview** — `quickTo(x/y)` + `quickTo(scale/opacity)`; chỉ bật khi `matchMedia("(pointer: fine)")`.
7. **Magnetic CTA** — giữ pattern `quickTo`, giới hạn 0.24–0.3, reset khi `mouseleave`.
8. **Counters** — `ScrollTrigger once`, format bằng `Intl.NumberFormat(locale)` thay vì `toLocaleString()` mặc định.
9. **Reduced motion** — set final states bằng `gsap.set`, tắt pin/scrub/marquee; không chạy timeline.

### 4.3 Kỷ luật hiệu năng
- Chỉ animate `transform`/`opacity`; `will-change` chỉ trên phần tử thực sự animate.
- Tối đa **1 pin**/trang; batch reveal thay vì 18 ScrollTrigger rời.
- Không tạo tween trong `mousemove` (dùng `quickTo`).
- Kill toàn bộ context khi unmount; `ScrollTrigger.getAll()` chỉ dùng để debug, không dùng production.
- Ảnh preview: `next/image` với `sizes` đúng, `priority` chỉ ảnh hero.

---

## 5. Kế hoạch triển khai theo phase

### Phase 0 — Chuẩn bị (không đổi UI)
- Ghi nhận baseline: chạy 4 lệnh quality gate, lưu kết quả.
- Xác nhận branch/working tree (không tự chuyển branch, không commit).

### Phase 1 — Design foundation
- `src/app/globals.css`: token mới (paper/ink/signal/cobalt/acid/line), font vars, utilities: `.hairline-grid`, `.rule`, `.stamp`, `.mono-meta`, `.focus-ring`, marquee, noise.
- `src/app/layout.tsx`: thay `Plus_Jakarta_Sans` bằng `Archivo` + `Be_Vietnam_Pro` + `IBM_Plex_Mono` (subsets `latin`, `vietnamese`).
- Cập nhật `DESIGN.md` (tokens, dials, anti-patterns mới).
- **Gate:** tsc + build xanh trước khi đụng layout.

### Phase 2 — Motion primitives
- `src/client/components/common/motion/`:
  - `useGsapEffect.ts`
  - `Reveal.tsx` (wrapper `ScrollTrigger.batch`/`fromTo`)
  - `SplitLines.tsx` (mask lines, nhận `as` prop)
  - `MagneticButton.tsx` (quickTo, tôn trọng reduced-motion)
  - `Marquee.tsx` (CSS-driven, pause on hover)
- Unit test nhỏ cho hook cleanup + reduced-motion branch.

### Phase 3 — Shared chrome
- `NavbarClient.tsx`: bỏ glass + gradient; topbar mỏng mono; nav underline; mega menu dạng “spec panel” (hairline, số thứ tự); ScrollTrigger thay scroll listener; giữ nguyên search Ctrl+K, cart, language, auth state.
- `Footer.tsx`: ink, wordmark lớn, mono index, giữ nguyên link/i18n.
- Breadcrumb/AutoBreadcrumbs: style theo hệ mới (chỉ CSS, không đổi logic).

### Phase 4 — Home rebuild
- Tách `HomePageClient.tsx` thành `sections/` (Hero, Ticker, CategoryIndex, Catalog, Specs, Journey, Testimonials, Newsletter).
- Giữ nguyên props contract từ `page.tsx` (products, categories, pagination, dict) và hành vi filter/pagination/URL hash.
- Thay toàn bộ asset trang trí PNG bằng preview sản phẩm thật + CSS.
- Viết lại `HomePageClient.test.ts` theo **behavior**: filter → URL, pagination, reduced-motion, cleanup, không còn assert texture/5 header.

### Phase 5 — Các trang storefront còn lại (nếu scope = toàn bộ)
- `/shop` (grid + filter sidebar), `/product/[id]`, `/cart`, `/checkout`, `/login`, `/register`, `/forgot-password`, `/profile/*`, `/orders/*`.
- Chủ yếu là token + chrome + vài block; không đổi logic form/validation/server actions.
- Trang lỗi `not-found`, `loading`, `error` theo hệ mới.

### Phase 6 — QA & tài liệu
- Viewports: 1440 / 1280 / 1024 / 768 / 390 / 320.
- Kiểm tra: keyboard tab, focus visible, contrast ≥ 4.5:1, `prefers-reduced-motion`, console/network sạch, ảnh không vỡ, không layout shift do pin.
- Chạy quality gate, cập nhật `docs/STATUS.md` + `DESIGN.md`, báo cáo bảng PASS/FAIL.

---

## 6. Bản đồ file dự kiến

| File | Hành động |
|---|---|
| `src/app/globals.css` | Thay token + utilities |
| `src/app/layout.tsx` | Đổi font |
| `src/client/components/home/HomePageClient.tsx` | Giảm còn orchestrator |
| `src/client/components/home/sections/*.tsx` | **Mới** — 8 section |
| `src/client/components/common/motion/*` | **Mới** — hook + primitives |
| `src/client/components/layout/NavbarClient.tsx` | Restyle + ScrollTrigger |
| `src/client/components/layout/Footer.tsx` | Restyle |
| `src/i18n/dictionaries/vi.ts`, `en.ts` | Thêm key mới (index, spec, license, CTA) |
| `src/client/components/home/HomePageClient.test.ts` | Viết lại theo behavior |
| `DESIGN.md`, `docs/STATUS.md` | Cập nhật sau khi xong |

Không đụng: `src/server/**`, `src/shared/validations/**`, `supabase/**`, `src/app/(admin)/**`.

---

## 7. Rủi ro & cách giảm thiểu

| Rủi ro | Giảm thiểu |
|---|---|
| Test cũ đỏ do DOM đổi | Viết lại test cùng phase, assert hành vi thay vì trang trí |
| Lenis + pin gây giật/nhảy | 1 pin duy nhất, `invalidateOnRefresh`, `matchMedia` chỉ desktop, refresh sau `fonts.ready` |
| Mất “chất” vì bỏ ảnh 3D | Bù bằng preview thật + khung browser + typography lớn + lưới hairline |
| Quá nhiều chữ tiếng Anh trong UI Việt | Toàn bộ label qua i18n; mono chỉ dùng cho số/ký hiệu kỹ thuật |
| Thời gian dài, khó review | Chia 6 phase, mỗi phase build xanh; Phase 1–2 có thể review riêng |
| Xung đột thay đổi người dùng | Chỉ sửa file trong bản đồ; kiểm tra diff trước mỗi phase |

---

## 8. Quyết định đã chốt

1. **Phạm vi**: toàn bộ storefront **trừ `/admin`** (Home, Shop, Product, Cart, Checkout, Auth, Profile/Orders, Navbar/Footer, error/loading).
2. **Nội dung/số liệu**: giữ nguyên (50+ template, 1.240 khách, 4.9/5) — không tự thay số liệu.
3. **Framer Motion**: giữ cho Navbar pill + CartDrawer; gỡ khỏi Home để chỉ còn một engine điều khiển transform trên mỗi phần tử.
4. **Thứ tự**: làm đủ 6 phase, dừng ở mỗi phase để review nếu cần.
