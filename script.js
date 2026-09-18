/* 탭 전환: 주소의 #해시로 패널을 연다. 없으면 워드마크만 보인다. */
(function () {
  var panels = Array.prototype.slice.call(document.querySelectorAll(".panel"));
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tabs a[data-tab]"));
  var ids = panels.map(function (p) { return p.id; });

  function open(id) {
    var found = ids.indexOf(id) !== -1;
    panels.forEach(function (p) { p.hidden = p.id !== id; });
    tabs.forEach(function (t) {
      if (t.getAttribute("data-tab") === id) t.setAttribute("aria-current", "page");
      else t.removeAttribute("aria-current");
    });
    document.body.classList.toggle("is-open", found);
    document.title = found ? (document.getElementById(id + "-title").textContent + " — KYNN TECHNOLOGY") : "KYNN TECHNOLOGY";
    if (found) {
      var panel = document.getElementById(id);
      panel.setAttribute("tabindex", "-1");
      panel.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
  }

  function route() {
    open(location.hash.replace("#", ""));
  }

  window.addEventListener("hashchange", route);
  document.querySelectorAll("a[data-home]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      if (location.hash) history.pushState("", document.title, location.pathname + location.search);
      open("");
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("is-open")) {
      history.pushState("", document.title, location.pathname + location.search);
      open("");
    }
  });
  route();
})();
