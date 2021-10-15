export interface LabelValue {
    label: string | number;
    value: string | number;
    disabled?: boolean;
    default?: boolean;
    selected?: boolean;
}
export interface NameValue {
    name: string | number;
    value: string | number;
}

export interface Size3D {
    width: number;
    height: number;
    depth: number;
}

// export interface RadarIndicator {
//     name: string;
//     max: number;
// }

// export interface RadarDataItem {
//     name: string;
//     value: number[];
// }
// export interface LineDataItem {
//     name: string;
//     data: number[];
//     animation?: string;
// }
// export type PieDataItem = NameValue;
// export type BarDataItem = LineDataItem;

// export interface LineChartData {
//     axis: string[];
//     series: LineDataItem[];
// }
// export interface BarChartData {
//     axis: string[];
//     series: BarDataItem[];
// }
// export type PieChartData = PieDataItem[];
