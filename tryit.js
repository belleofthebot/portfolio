/* try it — full screen for any demo panel on a case study page.
 *
 * Any element carrying data-tryit is a demo. Any button carrying data-fs
 * inside it toggles full screen for it.
 *
 * Two paths, because one is not enough. The Fullscreen API is the good one:
 * it hides the browser chrome and gives the demo the whole display. Safari on
 * iPhone does not implement it for arbitrary elements at all, and it can be
 * refused by permissions policy anywhere, so the fallback is a fixed overlay
 * that covers the viewport. Both end up in the same visual state and both
 * leave on Escape, so nothing downstream has to know which one ran.
 */
(function () {
  'use strict';

  var LOCK = 'tryit-locked';
  var MAX = 'is-max';
  var faked = null;

  function native(el) {
    return el.requestFullscreen || el.webkitRequestFullscreen ||
           el.msRequestFullscreen || null;
  }

  function current() {
    return document.fullscreenElement || document.webkitFullscreenElement ||
           document.msFullscreenElement || null;
  }

  function fakeOpen(el) {
    faked = el;
    el.classList.add(MAX);
    document.body.classList.add(LOCK);
    label(el, true);
  }

  function fakeClose() {
    if (!faked) return;
    faked.classList.remove(MAX);
    document.body.classList.remove(LOCK);
    label(faked, false);
    faked = null;
  }

  /* The label has to say what the button will do next, not what state you are
     in. "full screen" opens, "close" leaves. */
  function label(el, isOpen) {
    var b = el.querySelector('[data-fs]');
    if (!b) return;
    var t = b.querySelector('.fsl');
    if (t) t.textContent = isOpen ? 'close' : 'full screen';
    b.setAttribute('aria-pressed', isOpen ? 'true' : 'false');
    el.classList.toggle('fs-on', !!isOpen);
  }

  function open(el) {
    var fn = native(el);
    if (!fn) { fakeOpen(el); return; }
    var r;
    try { r = fn.call(el); } catch (e) { fakeOpen(el); return; }
    if (r && typeof r.catch === 'function') r.catch(function () { fakeOpen(el); });
  }

  function close() {
    if (faked) { fakeClose(); return; }
    var fn = document.exitFullscreen || document.webkitExitFullscreen ||
             document.msExitFullscreen;
    if (fn) fn.call(document);
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-fs]');
    if (!b) return;
    var panel = b.closest('[data-tryit]');
    if (!panel) return;
    e.preventDefault();
    if (current() === panel || faked === panel) close();
    else open(panel);
  });

  /* Escape leaves the overlay. The native path already handles its own
     Escape, and fires a change event we pick up below. */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && faked) fakeClose();
  });

  ['fullscreenchange', 'webkitfullscreenchange', 'MSFullscreenChange']
    .forEach(function (evt) {
      document.addEventListener(evt, function () {
        var el = current();
        document.querySelectorAll('[data-tryit]').forEach(function (p) {
          label(p, p === el);
        });
      });
    });
})();
