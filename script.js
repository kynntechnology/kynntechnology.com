/* KYNN TECHNOLOGY — 「웨이퍼」
   1) 배경 캔버스에 실리콘 웨이퍼(다이 격자)를 아주 낮은 밝기로 그린다.
      8초쯤마다 좁은 빛의 띠가 한 번 훑고(노광 스캔), 아주 가끔 차가운 섬광이 격자를 들었다 놓는다.
   2) 워드마크를 글자 단위로 쪼개 순서대로 등장시킨다. 진행은 CSS가 아니라 JS가 직접 그린다.
   3) 탭 전환: 주소의 #해시로 패널을 연다. 없으면 워드마크만 보인다.
   외부 스크립트·폰트·이미지 없음. 라이브러리 없음. */

(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var T0 = Date.now();
  function clock() { return Date.now() - T0; }

  /* ── 1. 워드마크 글자 쪼개기 ───────────────────────────── */
  var chars = [];
  try {
    var h1 = doc.querySelector(".wordmark");
    if (h1) {
      var text = h1.textContent;
      h1.setAttribute("aria-label", text);
      var frag = doc.createDocumentFragment();
      for (var ci = 0; ci < text.length; ci++) {
        var c = text.charAt(ci);
        var sp = doc.createElement("span");
        sp.className = "ch";
        sp.textContent = c === " " ? "\u00A0" : c;
        frag.appendChild(sp);
        chars.push(sp);
      }
      h1.textContent = "";
      h1.appendChild(frag);
      if (!reduce) h1.style.opacity = "1";
    }
  } catch (e) { chars = []; }

  /* ── 2. 웨이퍼 배경 ────────────────────────────────────── */
  var wafer = (function (canvas) {
    if (!canvas || !canvas.getContext) return null;
    var ctx = canvas.getContext("2d");
    var base = doc.createElement("canvas");
    var bctx = base.getContext && base.getContext("2d");
    if (!ctx || !bctx) return null;

    var dpr = 1, W = 0, H = 0, cx = 0, cy = 0, R = 0;
    var dies = [];
    var raf = 0, running = false, prev = 0;

    var TILT = 0.13, CT = Math.cos(TILT), ST = Math.sin(TILT);
    var START = 7200, CYCLE = 8200, SWEEP = 2600;   // 조용히 있다가, 8.2초 간격으로 한 번씩 훑는다
    var flash = 0, nextFlash = 21000;

    /* 중심에서 멀어질수록 사라진다 */
    function mask(u) { return u >= 1 ? 0 : Math.pow(1 - u, 0.8); }

    function layout() {
      dies = [];
      var dw = R * 0.062, dh = R * 0.047, gap = Math.max(0.8, R * 0.006);
      var px = dw + gap, py = dh + gap;
      var nx = Math.ceil(R / px) + 1, ny = Math.ceil(R / py) + 1;
      var lim = R * 0.968, lim2 = lim * lim;
      for (var j = -ny; j <= ny; j++) {
        for (var i = -nx; i <= nx; i++) {
          var x = cx + i * px - dw / 2, y = cy + j * py - dh / 2;
          var ex = Math.max(Math.abs(x - cx), Math.abs(x + dw - cx));
          var ey = Math.max(Math.abs(y - cy), Math.abs(y + dh - cy));
          if (ex * ex + ey * ey > lim2) continue;        // 원 안에 온전히 들어오는 다이만 남긴다
          var mx = x + dw / 2 - cx, my = y + dh / 2 - cy;
          dies.push({
            x: x, y: y, w: dw, h: dh, mx: mx, my: my,
            m: mask(Math.sqrt(mx * mx + my * my) / R),
            r: 0.8 + Math.random() * 0.4                // 다이마다 조금씩 다른 반응도
          });
        }
      }
    }

    /* 바탕 레이어: 한 번만 그려 두고 매 프레임 복사해 쓴다 */
    function paintBase() {
      var k, d;
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bctx.globalCompositeOperation = "source-over";
      bctx.clearRect(0, 0, W, H);

      /* 연마된 표면의 아주 옅은 기운 */
      var sg = bctx.createRadialGradient(cx, cy - R * 0.12, 0, cx, cy, R);
      sg.addColorStop(0, "rgba(176,198,226,0.022)");
      sg.addColorStop(1, "rgba(176,198,226,0)");
      bctx.fillStyle = sg;
      bctx.beginPath();
      bctx.arc(cx, cy, R, 0, Math.PI * 2);
      bctx.fill();

      /* 다이 격자 — 사이의 검은 틈이 스트리트 */
      bctx.fillStyle = "rgba(186,206,232,0.040)";
      for (k = 0; k < dies.length; k++) { d = dies[k]; bctx.fillRect(d.x, d.y, d.w, d.h); }
      bctx.strokeStyle = "rgba(206,224,250,0.070)";
      bctx.lineWidth = 0.7;
      for (k = 0; k < dies.length; k++) {
        d = dies[k];
        bctx.strokeRect(d.x + 0.35, d.y + 0.35, d.w - 0.7, d.h - 0.7);
      }

      /* 가장자리를 검게 지운다 */
      bctx.globalCompositeOperation = "destination-in";
      var rg = bctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      rg.addColorStop(0, "rgba(0,0,0,1)");
      rg.addColorStop(0.30, "rgba(0,0,0,0.75)");
      rg.addColorStop(0.55, "rgba(0,0,0,0.53)");
      rg.addColorStop(0.75, "rgba(0,0,0,0.33)");
      rg.addColorStop(0.90, "rgba(0,0,0,0.16)");
      rg.addColorStop(1, "rgba(0,0,0,0)");
      bctx.fillStyle = rg;
      bctx.fillRect(0, 0, W, H);

      /* 웨이퍼 테두리와 노치 — 지운 뒤에 얹어 원의 윤곽만 남긴다 */
      bctx.globalCompositeOperation = "source-over";
      var g = 0.045, a0 = Math.PI / 2 + g, a1 = Math.PI / 2 - g;
      bctx.strokeStyle = "rgba(208,226,250,0.085)";
      bctx.lineWidth = 1;
      bctx.beginPath();
      bctx.arc(cx, cy, R, a0, a1 + Math.PI * 2);
      bctx.stroke();
      bctx.beginPath();
      bctx.moveTo(cx + R * Math.cos(a0), cy + R * Math.sin(a0));
      bctx.lineTo(cx, cy + R * 0.955);
      bctx.lineTo(cx + R * Math.cos(a1), cy + R * Math.sin(a1));
      bctx.stroke();
    }

    function still() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(base, 0, 0, W, H);
    }

    function draw(t, dt) {
      var k, d;

      /* 노광 스캔 — 시각(t)만 보고 위치를 정한다 */
      var bandX = null, env = 0;
      if (t >= START) {
        var c = (t - START) % CYCLE;
        if (c <= SWEEP) {
          var p = c / SWEEP;
          bandX = -R * 1.28 + p * R * 2.56;
          env = Math.max(0, Math.min(1, Math.sin(Math.PI * p) * 2.4));
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(base, 0, 0, W, H);

      /* 띠가 지나간 자리의 다이는 밝아졌다가 뒤쪽으로 길게 식는다.
         프레임 히스토리가 아니라 띠와의 거리로만 계산한다 — 프레임률과 무관하게 같은 그림. */
      if (env > 0) {
        var ahead = R * 0.075, behind = R * 0.30;
        ctx.globalCompositeOperation = "lighter";
        for (k = 0; k < dies.length; k++) {
          d = dies[k];
          var u = d.mx * CT + d.my * ST - bandX;
          var f = u > 0 ? 1 - u / ahead : 1 + u / behind;
          if (f <= 0.04) continue;
          var a = f * f * env * d.r * d.m * 0.105;
          if (a < 0.004) continue;
          ctx.fillStyle = "rgba(202,222,248," + a.toFixed(3) + ")";
          ctx.fillRect(d.x, d.y, d.w, d.h);
        }
      }

      /* 빛의 띠 자체 — 앞은 짧고 뒤로 길게, 가장자리 없는 부드러운 띠. 웨이퍼 원 안쪽으로만. */
      if (env > 0) {
        ctx.globalCompositeOperation = "lighter";
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.clip();
        ctx.translate(cx, cy);
        ctx.rotate(TILT);
        var g1 = ctx.createLinearGradient(bandX - R * 0.34, 0, bandX + R * 0.12, 0);
        g1.addColorStop(0, "rgba(198,218,246,0)");
        g1.addColorStop(0.74, "rgba(198,218,246," + (env * 0.030).toFixed(3) + ")");
        g1.addColorStop(1, "rgba(198,218,246,0)");
        ctx.fillStyle = g1;
        ctx.fillRect(-R * 1.6, -R * 1.6, R * 3.2, R * 3.2);
        var g2 = ctx.createLinearGradient(bandX - R * 0.035, 0, bandX + R * 0.035, 0);
        g2.addColorStop(0, "rgba(220,236,255,0)");
        g2.addColorStop(0.5, "rgba(220,236,255," + (env * 0.050).toFixed(3) + ")");
        g2.addColorStop(1, "rgba(220,236,255,0)");
        ctx.fillStyle = g2;
        ctx.fillRect(-R * 1.6, -R * 1.6, R * 3.2, R * 3.2);
        ctx.restore();
      }

      /* 아주 가끔, 차갑고 짧은 섬광 */
      if (t >= nextFlash) { flash = 1; nextFlash = t + 17000 + Math.random() * 13000; }
      if (flash > 0.003) {
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = flash * 0.7;
        ctx.drawImage(base, 0, 0, W, H);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "rgba(150,178,214," + (flash * 0.015).toFixed(4) + ")";
        ctx.fillRect(0, 0, W, H);
        flash *= Math.pow(0.9924, dt);
      } else {
        flash = 0;
      }

      ctx.globalCompositeOperation = "source-over";
    }

    function frame() {
      if (!running) { raf = 0; return; }
      var t = clock();
      var dt = prev ? Math.min(100, t - prev) : 16;
      prev = t;
      draw(t, dt);
      raf = window.requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduce) return;
      running = true;
      prev = 0;
      raf = window.requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
    }

    /* 크기가 실제로 바뀐 경우에만 다시 만든다. 뷰포트를 묻지 않고 캔버스 상자를 직접 잰다
       — 모바일 주소창이 오르내릴 때도, 로드 직후 뷰포트가 한 번 더 잡힐 때도 맞는다. */
    function build() {
      var w = Math.max(1, canvas.clientWidth || window.innerWidth);
      var h = Math.max(1, canvas.clientHeight || window.innerHeight);
      var d = Math.min(window.devicePixelRatio || 1, 2);
      if (w === W && h === H && d === dpr) return false;
      W = w; H = h; dpr = d;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      base.width = canvas.width;
      base.height = canvas.height;
      cx = W / 2;
      cy = H / 2;
      R = Math.min(H * 0.45, W * 0.44);      // 지름 ≈ 90vh
      layout();
      paintBase();
      still();
      return true;
    }

    return {
      build: build,
      start: start,
      stop: stop,
      freeze: function () {
        stop();
        flash = 0;
        still();
      }
    };
  }(doc.getElementById("wafer")));

  if (wafer) {
    wafer.build();
    if (!reduce) wafer.start();

    var rt = 0;
    function relayout() {
      window.clearTimeout(rt);
      rt = window.setTimeout(function () {
        if (wafer.build() && !reduce && !doc.body.classList.contains("is-open")) wafer.start();
      }, 100);
    }
    if (window.ResizeObserver) new ResizeObserver(relayout).observe(doc.getElementById("wafer"));
    window.addEventListener("resize", relayout);

    doc.addEventListener("visibilitychange", function () {
      if (doc.hidden) wafer.stop();
      else if (!doc.body.classList.contains("is-open")) wafer.start();
    });
  }

  /* ── 3. 등장 연출 ──────────────────────────────────────── */
  if (!reduce) {
    var cues = [];
    function cue(el, at, dur, dy) { if (el) cues.push({ e: el, s: at, d: dur, y: dy || 0 }); }

    cue(doc.querySelector(".mark"), 320, 700, 0);
    for (var n = 0; n < chars.length; n++) cue(chars[n], 160 + n * 55, 620, 0);
    cue(doc.querySelector(".tagline"), 1250, 750, 8);
    var tabEls = doc.querySelectorAll(".tabs a");
    for (var m = 0; m < tabEls.length; m++) cue(tabEls[m], 1450 + m * 80, 620, -6);
    cue(doc.querySelector(".hint"), 2200, 900, 0);

    if (cues.length) {
      root.classList.add("anim");
      (function step() {
        var t = clock();
        for (var i = cues.length - 1; i >= 0; i--) {
          var it = cues[i];
          var q = (t - it.s) / it.d;
          if (q <= 0) continue;
          if (q >= 1) {
            it.e.style.opacity = "1";
            if (it.y) it.e.style.transform = "none";
            cues.splice(i, 1);
            continue;
          }
          var k = 1 - Math.pow(1 - q, 3);
          it.e.style.opacity = k.toFixed(3);
          if (it.y) it.e.style.transform = "translateY(" + ((1 - k) * it.y).toFixed(2) + "px)";
        }
        if (cues.length) window.requestAnimationFrame(step);
      }());
    }
  }

  /* ── 4. 탭 전환 ────────────────────────────────────────── */
  var panels = Array.prototype.slice.call(doc.querySelectorAll(".panel"));
  var tabs = Array.prototype.slice.call(doc.querySelectorAll(".tabs a[data-tab]"));
  var ids = panels.map(function (p) { return p.id; });
  var current = "";

  function open(id) {
    var found = ids.indexOf(id) !== -1;
    panels.forEach(function (p) {
      p.hidden = p.id !== id;
      /* 닫힌 패널에는 임시 tabindex를 남기지 않는다 */
      if (p.hidden) p.removeAttribute("tabindex");
    });
    tabs.forEach(function (t) {
      if (t.getAttribute("data-tab") === id) t.setAttribute("aria-current", "page");
      else t.removeAttribute("aria-current");
    });
    doc.body.classList.toggle("is-open", found);
    doc.title = found ? (doc.getElementById(id + "-title").textContent + " — KYNN TECHNOLOGY") : "KYNN TECHNOLOGY";
    if (wafer) {
      if (found) wafer.freeze();
      else if (!doc.hidden) wafer.start();
    }
    if (found) {
      var panel = doc.getElementById(id);
      panel.setAttribute("tabindex", "-1");
      panel.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
    current = found ? id : "";
  }

  /* 패널을 닫을 때는 열었던 탭으로 초점을 돌려준다.
     그냥 닫으면 숨겨진 패널에 있던 초점이 body로 떨어져 탭 순서 맨 앞으로 밀린다. */
  function close() {
    var prev = current;
    if (location.hash) history.pushState("", doc.title, location.pathname + location.search);
    open("");
    var back = (prev && doc.querySelector('.tabs a[data-tab="' + prev + '"]')) ||
               doc.querySelector(".home-link");
    if (back) back.focus();
  }

  function route() {
    open(location.hash.replace("#", ""));
  }

  /* 해시로 바로 들어오면 브라우저가 나중에(이미지·웹폰트가 자리를 잡은 뒤) 그 섹션으로
     한 번 더 스크롤한다. 헤더는 sticky라 사라지지 않지만, 시작 위치는 맨 위로 되돌린다. */
  function pin() { if (doc.body.classList.contains("is-open")) window.scrollTo(0, 0); }
  window.addEventListener("load", pin);
  try { if (doc.fonts && doc.fonts.ready && doc.fonts.ready.then) doc.fonts.ready.then(pin); } catch (e) {}

  window.addEventListener("hashchange", route);
  doc.querySelectorAll("a[data-home]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      close();
    });
  });
  doc.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && doc.body.classList.contains("is-open")) {
      close();
    }
  });
  route();
})();
