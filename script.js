/* 모바일 메뉴 토글 — 순수 JS, 외부 라이브러리 없음.
   JS가 없으면 메뉴는 그냥 펼쳐진 채로 보인다(styles.css의 .js 게이트). */
(function () {
  var nav = document.querySelector(".nav");
  var btn = document.querySelector(".nav-toggle");
  if (!nav || !btn) { return; }

  function isOpen() { return nav.classList.contains("nav-open"); }

  function setOpen(open) {
    nav.classList.toggle("nav-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.textContent = open ? "닫기" : "메뉴";
  }

  btn.addEventListener("click", function () {
    setOpen(!isOpen());
  });

  /* 메뉴 항목을 누르면 닫는다 */
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) { setOpen(false); }
  });

  /* 메뉴 바깥을 누르면 닫는다 */
  document.addEventListener("click", function (e) {
    if (isOpen() && !nav.contains(e.target)) { setOpen(false); }
  });

  /* Esc로 닫고 버튼으로 포커스를 돌려준다 */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) {
      setOpen(false);
      btn.focus();
    }
  });

  /* 탭으로 마지막 항목을 지나 포커스가 메뉴 밖으로 나가면 닫는다(열린 메뉴가 본문을 가리지 않게) */
  nav.addEventListener("focusout", function (e) {
    if (isOpen() && !nav.contains(e.relatedTarget)) { setOpen(false); }
  });
})();
