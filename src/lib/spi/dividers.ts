import { IAreaDivider } from "./spi";
import { Area } from "../model/hint";
import { Item, PartType, Vector3 } from "../scheme";

export class CompositeAreaDivider implements IAreaDivider {
    dividerMap: Map<PartType, IAreaDivider>;

    constructor() {
        this.dividerMap = new Map<PartType, IAreaDivider>();
        this.dividerMap.set(PartType.GENERAL, new GeneralAreaDivider());
        this.dividerMap.set(PartType.GENERAL_2, new GeneralAreaDivider());
        this.dividerMap.set(PartType.HORIZONTAL_SCALE, new GeneralAreaDivider());
        this.dividerMap.set(PartType.VERTICAL_SCALE, new GeneralAreaDivider());
    }

    divide(area: Area, item: Item): Array<Area> {
        const divider = this.dividerMap.get(item.partType);
        if (divider === undefined) {
            return [];
        }
        return divider.divide(area, item);
    }
}

export class GeneralAreaDivider implements IAreaDivider {
    divide(area: Area, item: Item): Array<Area> {
        const areaStartPoint = area.startPoint;
        const areaEndPoint = area.endPoint;
        const pivot = item.location.startPos;
        const itemSize = item.size;
        const partType = item.partType;

        let area1StartPoint, area1EndPoint, area2StartPoint, area2EndPoint;
        if (partType == PartType.VERTICAL_SCALE) {
            area1StartPoint = new Vector3(areaStartPoint.x, areaStartPoint.y, areaStartPoint.z);
            area1EndPoint = new Vector3(item.getBoundingBox()[0].x, areaEndPoint.y, areaEndPoint.z);
            area2EndPoint = new Vector3(areaEndPoint.x, areaEndPoint.y, areaEndPoint.z);
            area2StartPoint = new Vector3(item.getBoundingBox()[1].x, areaStartPoint.y, areaStartPoint.z);
        } else {
            area1StartPoint = new Vector3(areaStartPoint.x, areaStartPoint.y, areaStartPoint.z);
            area1EndPoint = new Vector3(areaEndPoint.x, pivot.y, areaEndPoint.z);
            area2EndPoint = new Vector3(areaEndPoint.x, areaEndPoint.y, areaEndPoint.z);
            area2StartPoint = new Vector3(areaStartPoint.x, pivot.y + itemSize.y, areaStartPoint.z);
        }

        const newArea1 = new Area(area.cubeId, area1StartPoint, area1EndPoint);
        const newArea2 = new Area(area.cubeId, area2StartPoint, area2EndPoint);
        return [newArea1, newArea2];
    }
}
