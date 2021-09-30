import { IAreaDivider } from "./spi";
import { Area } from "../model/hint";
import { Item, PartType, Position } from "../scheme";

export class CompositeAreaDivider implements IAreaDivider {
    dividerMap: Map<PartType, IAreaDivider>;

    constructor() {
        this.dividerMap = new Map<PartType, IAreaDivider>();
        this.dividerMap.set(PartType.GENERAL, new GeneralAreaDivider());
    }

    divide(area: Area, item: Item): Array<Area> {
        let divider = this.dividerMap.get(item.partType);
        if (divider === undefined) {
            return [];
        }
        return divider.divide(area, item);
    }

}

export class GeneralAreaDivider implements IAreaDivider {
    divide(area: Area, item: Item): Array<Area> {
        let areaStartPoint = area.startPoint;
        let areaEndPoint = area.endPoint;
        let pivot = item.location.startPos;
        let itemSize = item.size;

        let area1StartPoint = new Position(areaStartPoint.x,areaStartPoint.y,areaStartPoint.z);
        let area1EndPoint = new Position(areaEndPoint.x,pivot.y,areaEndPoint.z);

        let area2EndPoint = new Position(areaEndPoint.x,areaEndPoint.y,areaEndPoint.z);
        let area2StartPoint = new Position(areaStartPoint.x,pivot.y + itemSize.y,areaStartPoint.z);

        let newArea1 = new Area(area.cubeId, area1StartPoint, area1EndPoint);
        let newArea2 = new Area(area.cubeId, area2StartPoint, area2EndPoint);
        return [ newArea1, newArea2 ];
    }
}
