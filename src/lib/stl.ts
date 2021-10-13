import { IStl } from "./stl.api";
import { Cube, Item, Manifest, PartType, Position, Size, SizeConfig } from "./scheme";
import { Area, AreaHints, CubeAreaHint } from "./model/hint";
import { IAreaDivider, IAreaFilter } from "./spi/spi";
import { CompositeFilter } from "./spi/filters";
import { CompositeAreaDivider } from "./spi/dividers";
import { AnchorMeta, Interval, Scope } from "./model/pscope";

export class StlConfig {
    area_bias_x: number;
    area_bias_y: number;
    area_bias_z: number;
    sizeConfig: SizeConfig;

    constructor(
        area_bias_x: number = 0,
        area_bias_y: number = Number.MAX_VALUE,
        area_bias_z: number = Number.MAX_VALUE,
        sizeConfig: SizeConfig = new SizeConfig(),
    ) {
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
        const remain: Array<Item> = [];
        for (const cubeItem of cube.items) {
            if (cubeItem.id != item.id) {
                remain.push(cubeItem);
            }
        }

        const areas: Array<Area> = this.fetchDividedAreas(cube, remain);
        for (const area of areas) {
            if (this.checkItemIntersected(area, item)) {
                return this.calculateScope(area, item.partType, item.size);
            }
        }
        const invertalX = new Array<Interval>();
        const invertalY = new Array<Interval>();
        const invertalZ = new Array<Interval>();
        const minY = 0;
        const maxY = 0;
        invertalY.push(new Interval(minY, maxY));

        const minX = 0;
        const maxX = 0;
        invertalX.push(new Interval(minX, maxX));

        const minZ = 0;
        const maxZ = 0;
        invertalZ.push(new Interval(minZ, maxZ));
        return new Scope(invertalX, invertalY, invertalZ);
        //throw new Error("Error occurs!");
    }

    computeAnchorMeta(area: Area, partType: number, partSize: Size): AnchorMeta {
        const pivot = this.calculateAnchor(area, partType, partSize);
        const scope = this.calculateScope(area, partType, partSize);
        return new AnchorMeta(pivot, scope);
    }

    private calculateAnchor(area: Area, partType: number, partSize: Size): Position {
        console.log(partType, partSize);
        return new Position(0, area.startPoint.y, 0);
    }

    private calculateScope(area: Area, partType: number, partSize: Size): Scope {
        const invertalX = new Array<Interval>();
        const invertalY = new Array<Interval>();
        const invertalZ = new Array<Interval>();
        if (PartType.GENERAL == partType) {
            const minY = area.startPoint.y;
            const maxY = area.endPoint.y - partSize.y;
            invertalY.push(new Interval(minY, maxY));

            const minX = 0;
            const maxX = 0;
            invertalX.push(new Interval(minX, maxX));

            const minZ = 0;
            const maxZ = 0;
            invertalZ.push(new Interval(minZ, maxZ));
        }
        return new Scope(invertalX, invertalY, invertalZ);
    }

    computeAreaHints(manifest: Manifest, partType: number, partSize: Size): AreaHints {
        const cubeHintArray: Array<CubeAreaHint> = [];
        for (const cube of manifest.cubes) {
            const cubeHint: CubeAreaHint = this.computeCubeAreaHint(cube, partType, partSize);
            cubeHintArray.push(cubeHint);
        }
        return new AreaHints(cubeHintArray);
    }

    private computeCubeAreaHint(cube: Cube, partType: PartType, partSize: Size): CubeAreaHint {
        const hintAreas: Array<Area> = [];
        const areas: Array<Area> = this.fetchDividedAreas(cube, cube.items);
        for (const area of areas) {
            if (this.filter.doFilter(area, partType, partSize)) {
                hintAreas.push(area);
            }
        }
        return new CubeAreaHint(cube.id, hintAreas);
    }

    private fetchDividedAreas(cube: Cube, items: Array<Item>): Array<Area> {
        const config = this.config.sizeConfig;
        const cubeArea: Area = new Area(
            cube.id,
            new Position(cube.size.x / 2 - config.cube_thick_left, config.cube_thick_bottom, cube.size.z / 2),
            new Position(
                -cube.size.x / 2 + config.cube_thick_right,
                cube.size.y - config.cube_thick_top,
                -cube.size.z / 2 + config.cube_thick_back,
            ),
        );
        return this.divideArea(this.divider, cubeArea, items);
    }

    private divideArea(divider: IAreaDivider, area: Area, items: Array<Item>): Array<Area> {
        let divideItem = null;
        for (const item of items) {
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
        const dividedAreas: Array<Area> = divider.divide(area, divideItem);

        for (const dividedArea of dividedAreas) {
            const moreAreas = this.divideArea(divider, dividedArea, items);
            areas = areas.concat(moreAreas);
        }
        return areas;
    }

    private checkItemIntersected(area: Area, item: Item): boolean {
        const areaStartPoint = area.startPoint;
        const areaEndPoint = area.endPoint;
        const itemBtmY = item.location.startPos.y;
        const itemTopY = itemBtmY + item.size.y;

        return (
            (itemBtmY > areaStartPoint.y && itemBtmY < areaEndPoint.y) ||
            (itemTopY > areaStartPoint.y && itemTopY < areaEndPoint.y) ||
            (areaStartPoint.y > itemBtmY && areaStartPoint.y < itemTopY) ||
            (areaEndPoint.y > itemBtmY && areaEndPoint.y < itemTopY)
        );
    }
}
