export interface MenuItem {
    label?: string;
    value: string | number;
    icon: string;
    active?: boolean;
    type?: "menuitem" | "button";
    onActive?: () => void;
    onUnactive?: () => void;
    onClick?: () => void;
}
