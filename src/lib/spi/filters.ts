import { Area } from "../model/hint";
import { PartType, Vector3 } from "../scheme";
import { IAreaFilter } from "./spi";

export class CompositeFilter implements IAreaFilter {
    filterMap: Map<PartType, Array<IAreaFilter>>;

    constructor(bias_x = 0, bias_y = 0, bias_z = 0) {
        this.filterMap = new Map<PartType, Array<IAreaFilter>>();
        const generalAreaFilter = new GeneralAreaFilter(bias_x, bias_y, bias_z);
        const bottomAreaFilter = new BottomAreaFilter();
        this.filterMap.set(PartType.GENERAL, [generalAreaFilter]);
        this.filterMap.set(PartType.VERTICAL_SCALE, [generalAreaFilter]);
        this.filterMap.set(PartType.HORIZONTAL_SCALE, [generalAreaFilter]);
        this.filterMap.set(PartType.T_FRAME, [generalAreaFilter, bottomAreaFilter]);
    }

    doFilter(area: Area, partType: PartType, partSize: Vector3): boolean {
        const filters: Array<IAreaFilter> | undefined = this.filterMap.get(partType);
        if (filters === undefined) {
            return false;
        }

        let retain = true;
        for (const filter of filters) {
            retain = filter.doFilter(area, partType, partSize);
            if (!retain) {
                break;
            }
        }
        return retain;
    }
}

export class GeneralAreaFilter implements IAreaFilter {
    bias_x: number;
    bias_y: number;
    bias_z: number;

    constructor(bias_x = 0, bias_y = 0, bias_z = 0) {
        this.bias_x = bias_x;
        this.bias_y = bias_y;
        this.bias_z = bias_z;
    }

    doFilter(area: Area, partType: PartType, partSize: Vector3): boolean {
        if (partType == PartType.VERTICAL_SCALE) return true;
        this.bias_x = 0.015;
        const x_area = Math.abs(area.startPoint.x - area.endPoint.x);
        const y_area = Math.abs(area.startPoint.y - area.endPoint.y);
        const z_area = Math.abs(area.startPoint.z - area.endPoint.z);

        const diff_x = x_area - partSize.x;
        const diff_y = y_area - partSize.y;
        const diff_z = z_area - partSize.z;

        return Math.abs(diff_x) <= this.bias_x && diff_y >= 0 && Math.abs(diff_z) <= z_area;
    }
}

export class BottomAreaFilter implements IAreaFilter {
    doFilter(area: Area, partType: PartType, partSize: Vector3): boolean {
        return area.startPoint.y == 0 || area.endPoint.y == 0;
    }
}
