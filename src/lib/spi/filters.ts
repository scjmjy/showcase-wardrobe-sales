import { Area } from "../model/hint";
import { PartType, Size } from "../scheme";
import { IAreaFilter } from "./spi";

export class CompositeFilter implements IAreaFilter {
    filterMap: Map<PartType, Array<IAreaFilter>>;

    constructor(bias_x: number = 0, bias_y: number = 0, bias_z: number = 0) {
        this.filterMap = new Map<PartType, Array<IAreaFilter>>();
        let generalAreaFilter = new GeneralAreaFilter(bias_x, bias_y, bias_z);
        let bottomAreaFilter = new BottomAreaFilter();
        this.filterMap.set(PartType.GENERAL, [generalAreaFilter]);
        this.filterMap.set(PartType.T_FRAME, [generalAreaFilter, bottomAreaFilter]);
    }

    doFilter(area: Area, partType: PartType, partSize: Size): boolean {
        let filters: Array<IAreaFilter> | undefined = this.filterMap.get(partType);
        if (filters === undefined) {
            return false;
        }

        let retain = true;
        for (let filter of filters) {
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

    constructor(bias_x: number = 0, bias_y: number = 0, bias_z: number = 0) {
        this.bias_x = bias_x;
        this.bias_y = bias_y;
        this.bias_z = bias_z;
    }

    doFilter(area: Area, partType: PartType, partSize: Size): boolean {
        let x_area = Math.abs(area.startPoint.x - area.endPoint.x);
        let y_area = Math.abs(area.startPoint.y - area.endPoint.y);
        let z_area = Math.abs(area.startPoint.z - area.endPoint.z);

        let diff_x = x_area - partSize.x;
        let diff_y = y_area - partSize.y;
        let diff_z = z_area - partSize.z;

        return Math.abs(diff_x) <= this.bias_x && diff_y >= 0 && Math.abs(diff_z) <= z_area;
    }
}

export class BottomAreaFilter implements IAreaFilter {

    doFilter(area: Area, partType: PartType, partSize: Size): boolean {
        return area.startPoint.y == 0 || area.endPoint.y == 0;
    }

}
