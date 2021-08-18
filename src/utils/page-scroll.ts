export type OnReachBottom = () => void;

const OFFSET = 40;

export function checkReachBottom(el: HTMLElement, onReachBottom: OnReachBottom) {
    const { scrollTop, clientHeight, scrollHeight } = el;
    if (clientHeight === 0 && scrollHeight === 0) {
        return;
    }
    console.log("clientHeight", scrollTop, clientHeight, scrollHeight);

    const reachBottom = scrollTop + clientHeight + OFFSET >= scrollHeight;
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
