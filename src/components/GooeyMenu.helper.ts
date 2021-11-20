export interface MenuItem {
    label?: string;
    value: string | number;
    icon: string;
    unactiveIcon?: string;
    active?: boolean;
    type?: "menuitem" | "button";
    noClose?: boolean;
    onActive?: () => void;
    onUnactive?: () => void;
    onClick?: () => void;
}
