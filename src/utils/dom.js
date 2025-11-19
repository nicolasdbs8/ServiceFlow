export function addClickAndTouchListener(element, handler) {
    element.addEventListener("click", handler);
    element.addEventListener("touchstart", (event) => {
        event.preventDefault();
        handler(event);
    }, { passive: false });
}
export function $(selector) {
    return document.querySelector(selector);
}
export function $all(selector) {
    return document.querySelectorAll(selector);
}
