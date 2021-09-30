import { IStl } from "./stl.api";
import { Cube, Item, Manifest, PartType, Position, Size, SizeConfig } from "./scheme";
import { Area, AreaHints, CubeAreaHint } from "./model/hint";
import { IAreaDivider, IAreaFilter } from "./spi/spi";
import { CompositeFilter } from "./spi/filters";
import { CompositeAreaDivider } from "./spi/dividers";
import { AnchorMeta, Interval, Scope } from "./model/pscope";
import { ConfigTypeMap } from "dayjs";

export class StlConfig {
    area_bias_x: number;
    area_bias_y: number;
    area_bias_z: number;
    sizeConfig: SizeConfig;


    constructor(area_bias_x: number = 0, area_bias_y: number = Number.MAX_VALUE, area_bias_z: number = Number.MAX_VALUE, sizeConfig: SizeConfig = new SizeConfig()) {
        this.area_bias_x = area_bias_x;
        this.area_bias_y = area_bias_y;
        this.area_bias_z = area_bias_z;
        this.sizeConfig = sizeConfig;
    }
}

export class GeneralStl implements IStl {
    config: StlConfig;
    filter: IAreaFilter;
    divider: IAreaDivider;

    constructor(config: StlConfig = new StlConfig()) {
        this.config = config;
        this.filter = new CompositeFilter(config.area_bias_x, config.area_bias_y, config.area_bias_z);
        this.divider = new CompositeAreaDivider();
    }

    computeMovementScope(cube: Cube, item: Item): Scope {
        let remain: Array<Item> = [];
        for (let cubeItem of cube.items) {
            if (cubeItem.id != item.id) {
                remain.push(cubeItem);
            }
        }

        let areas: Array<Area> = this.fetchDividedAreas(cube, remain);
        for (let area of areas) {
            if (this.checkItemIntersected(area, item)) {
                return this.calculateScope(area, item.partType, item.size);
            }
        }
        throw new Error("Error occurs!");
    }

    computeAnchorMeta(area: Area, partType: number, partSize: Size): AnchorMeta {
        let pivot = this.calculateAnchor(area, partType, partSize);
        let scope = this.calculateScope(area, partType, partSize);
        return new AnchorMeta(pivot, scope);
    }

    private calculateAnchor(area: Area, partType: number, partSize: Size): Position {
        return new Position(0, area.startPoint.y, 0);
    }

    private calculateScope(area: Area, partType: number, partSize: Size): Scope {
        let invertalX = new Array<Interval>();
        let invertalY = new Array<Interval>();
        let invertalZ = new Array<Interval>();
        if (PartType.GENERAL == partType) {
            let minY = area.startPoint.y;
            let maxY = area.endPoint.y - partSize.y;
            invertalY.push(new Interval(minY, maxY));

            let minX = 0;
            let maxX = 0;
            invertalX.push(new Interval(minX, maxX));

            let minZ = 0;
            let maxZ = 0;
            invertalZ.push(new Interval(minZ, maxZ));
        }
        return new Scope(invertalX, invertalY, invertalZ);
    }

    computeAreaHints(manifest: Manifest, partType: number, partSize: Size): AreaHints {
        let cubeHintArray: Array<CubeAreaHint> = [];
        for (let cube of manifest.cubes) {
            let cubeHint: CubeAreaHint = this.computeCubeAreaHint(cube, partType, partSize);
            cubeHintArray.push(cubeHint);
        }
        return new AreaHints(cubeHintArray);
    }

    private computeCubeAreaHint(cube: Cube, partType: PartType, partSize: Size): CubeAreaHint {
        let hintAreas: Array<Area> = [];
        let areas: Array<Area> = this.fetchDividedAreas(cube, cube.items);
        for (let area of areas) {
            if (this.filter.doFilter(area, partType, partSize)) {
                hintAreas.push(area);
            }
        }
        return new CubeAreaHint(cube.id, hintAreas);
    }

    private fetchDividedAreas(cube: Cube, items: Array<Item>): Array<Area> {
        let config = this.config.sizeConfig;
        let cubeArea: Area = new Area(cube.id,
            new Position(cube.size.x / 2 - config.cube_thick_left, config.cube_thick_bottom, cube.size.z / 2),
            new Position(-cube.size.x / 2 + config.cube_thick_right, cube.size.y - config.cube_thick_top,
                -cube.size.z / 2 + config.cube_thick_back));
        return this.divideArea(this.divider, cubeArea, items);
    }

    private divideArea(divider: IAreaDivider, area: Area, items: Array<Item>): Array<Area> {
        let divideItem = null;
        for (let item of items) {
            if (!this.checkItemIntersected(area, item)) {
                continue;
            }
            divideItem = item;
            break;
        }

        if (divideItem == null) {
            return [area];
        }

        let areas: Array<Area> = [];
        let dividedAreas: Array<Area> = divider.divide(area, divideItem);

        for (let dividedArea of dividedAreas) {
            let moreAreas = this.divideArea(divider, dividedArea, items);
            areas = areas.concat(moreAreas);
        }
        return areas;
    }

    private checkItemIntersected(area: Area, item: Item): boolean {
        let areaStartPoint = area.startPoint;
        let areaEndPoint = area.endPoint;
        let itemBtmY = item.location.startPos.y;
        let itemTopY = itemBtmY + item.size.y;

        return (itemBtmY > areaStartPoint.y && itemBtmY < areaEndPoint.y) ||
            (itemTopY > areaStartPoint.y && itemTopY < areaEndPoint.y) ||
            (areaStartPoint.y > itemBtmY && areaStartPoint.y < itemTopY) ||
            (areaEndPoint.y > itemBtmY && areaEndPoint.y < itemTopY);
    }
}
