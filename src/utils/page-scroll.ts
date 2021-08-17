export type OnReachBottom = () => void;

export function checkReachBottom(el: HTMLElement, onReachBottom: OnReachBottom) {
    const { scrollTop, clientHeight, scrollHeight } = el;
    const reachBottom = scrollTop + clientHeight >= scrollHeight;
    if (reachBottom) {
        onReachBottom();
    }
}

export default class PageScroll {
    constructor(public el: HTMLElement, private onReachBottom: OnReachBottom) {
        checkReachBottom(el, onReachBottom);
        el.addEventListener("scroll", (e: Event) => {
            checkReachBottom(e.currentTarget as HTMLElement, onReachBottom);
        });
    }
}
