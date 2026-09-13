const LOCK_CLASS = "scroll-locked";
let lockCount = 0;

function scrollbarWidth() {
  // Must run while the page scrollbar is still visible
  return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
}

/** Lock page scroll without layout jump when the scrollbar disappears. */
export function lockBodyScroll() {
  lockCount += 1;
  if (lockCount > 1) return;

  const width = scrollbarWidth();
  document.documentElement.style.setProperty(
    "--scrollbar-compensation",
    `${width}px`,
  );
  // Apply compensation first, then hide overflow (via CSS class)
  document.body.classList.add(LOCK_CLASS);
}

export function unlockBodyScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;

  document.body.classList.remove(LOCK_CLASS);
  document.body.classList.remove("drawer-open");
  document.documentElement.style.setProperty("--scrollbar-compensation", "0px");
}
