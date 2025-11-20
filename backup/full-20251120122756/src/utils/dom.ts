export function addClickAndTouchListener(
  element: Element,
  handler: (event: Event) => void,
): void {
  element.addEventListener("click", handler);
  element.addEventListener(
    "touchstart",
    (event) => {
      event.preventDefault();
      handler(event);
    },
    { passive: false },
  );
}

export function $(selector: string): HTMLElement | null {
  return document.querySelector(selector);
}

export function $all<T extends Element = Element>(selector: string): NodeListOf<T> {
  return document.querySelectorAll<T>(selector);
}
