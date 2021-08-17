/**
 * @file    st_sketch_util.ts
 * @author  Guilin
 *
 * @description 3D Model Utils
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-07-01] Created.
 *
 */

import * as geometric from "geometric";
import { StSketchVector3 } from "../geometry/st_geometric_3d";
import StSketchConstant from "../utility/st_sketch_constant";
import { StSketchPoint } from "../geometry/st_geometric_2d";

const ST_SCALE_FROM_MM = StSketchConstant.SCALE_FROM_MM;

export default class StBabylonUtil {
    static scene: BABYLON.Scene;

    /**
     * must be called when the canvas is created.
     * @param opt
     */
    static initialize(opt: { scene: BABYLON.Scene }): void {
        console.log("!!! initializ BABYLON Util !!!");
        StBabylonUtil.scene = opt.scene;
    }

    static scaleToBabylon(sketch_vec: StSketchVector3, scale: number = ST_SCALE_FROM_MM): BABYLON.Vector3 {
        return new BABYLON.Vector3(sketch_vec.x / scale, sketch_vec.y / scale, sketch_vec.z / scale);
    }

    static translate(mesh: BABYLON.Mesh, sketch_vec: StSketchVector3, world = false): BABYLON.Mesh {
        const vec = this.scaleToBabylon(sketch_vec);
        if (world) {
            mesh.translate(BABYLON.Axis.X, vec.x, BABYLON.Space.WORLD);
            mesh.translate(BABYLON.Axis.Y, vec.y, BABYLON.Space.WORLD);
            mesh.translate(BABYLON.Axis.Z, vec.z, BABYLON.Space.WORLD);
        } else {
            mesh.translate(BABYLON.Axis.X, vec.x);
            mesh.translate(BABYLON.Axis.Y, vec.y);
            mesh.translate(BABYLON.Axis.Z, vec.z);
        }
        return mesh;
    }

    static st_model_scale_polygon(s: Array<BABYLON.Vector2>): Array<BABYLON.Vector2> {
        const rect: geometric.Polygon = [];
        s.forEach((p) => {
            rect.push([p.x, p.y]);
        });

        const rect2 = geometric.polygonScale(rect, 0.9);
        const shape: Array<BABYLON.Vector2> = [];
        rect2.forEach((p: Array<number>) => {
            shape.push(new BABYLON.Vector2(p[0], p[1]));
        });
        return shape;
    }

    /**
     *
     * @param {[BABYLON.Vector2]} line
     * @param {[BABYLON.Vector2]} polygen
     * @returns Array of 2 Polygens
     */
    static lineDividePolygen(
        line: Array<BABYLON.Vector2>,
        polygen: Array<BABYLON.Vector2>,
    ): null | Array<Array<BABYLON.Vector2>> {
        //console.debug("## line ( %o ) is dividing polygen: %o", line, polygen);
        if (line.length != 2) {
            console.error("Not a line: " + line);
            return null;
        }
        if (polygen.length < 3) {
            console.error("Not a polygen: " + polygen);
            return null;
        }
        const e0 = StBabylonUtil.pointOnPolygenEdge(line[0], polygen);
        const e1 = StBabylonUtil.pointOnPolygenEdge(line[1], polygen);
        if (e0 == null || e1 == null) {
            // console.debug("#### Line (P: %o ) fail to divide polygen: %o", line, polygen);
            return null;
        }

        // the 2 divided polygens
        const d0: Array<BABYLON.Vector2> = [];
        const d1: Array<BABYLON.Vector2> = [];
        let flag = 0;
        polygen.forEach((v) => {
            // check if v is on the divided edge
            let divide_edge = null; // polygon edge which is to be divided. NOTE: it will be used in future?
            let index = -1;
            if (StBabylonUtil.pointAtEdgeStart(v, e0)) {
                divide_edge = e0;
                index = 0;
                flag++;
            } else if (StBabylonUtil.pointAtEdgeStart(v, e1)) {
                divide_edge = e1;
                index = 1;
                flag++;
            } else {
                divide_edge = null;
            }

            if (divide_edge != null) {
                console.log("#### find polygon divide edge!");
            }
            if (flag === 0) {
                d0.push(v);
            } else if (flag === 1) {
                d0.push(v);
                d0.push(line[index]);
                d1.push(line[index]);
                flag++;
            } else if (flag === 2) {
                d1.push(v);
            } else if (flag === 3) {
                d1.push(v);
                d1.push(line[index]);
                d0.push(line[index]);
                flag++;
            } else if (flag === 4) {
                d0.push(v);
            } else {
                console.error("unknown flag: %d", flag);
            }
            //console.debug("##Divide Edge: %o", divide_edge);
        });
        console.debug(
            "Line (%s) divided polygen: \n\t %s  \n\t --> 1) %s \n\t --> 2) %s",
            line.toString(),
            polygen.toString(),
            d0.toString(),
            d1.toString(),
        );
        return [d0, d1];
    }

    /**
     * Find the edge where the point is located.
     *
     * An edge is an array of 2 BABYLONG.Vector2.
     *
     * @param {BABYLON.Vector2} p
     * @param {Array of BABYLON.Vector2} polygen
     * @returns edge/null
     */
    static pointOnPolygenEdge(p: BABYLON.Vector2, polygen: Array<BABYLON.Vector2>): Array<BABYLON.Vector2> | null {
        const NUM = polygen.length;
        let edge: Array<BABYLON.Vector2> | null = null;
        polygen.forEach((e, i) => {
            if (edge != null) {
                // find the edge, ignore following edges
                return;
            }
            const p0 = e;
            let p1;
            if (i < NUM - 1) {
                p1 = polygen[i + 1];
            } else {
                p1 = polygen[0];
            }
            if (StBabylonUtil.ponitOnEdge(p, [p0, p1])) {
                edge = [p0, p1];
            }
        });
        if (edge == null) {
            // console.debug("Point %o is NOT on any edge of polygen %o", p, polygen);
        } else {
            //console.log(`## --> Point ${p} is ON edge: ${edge}`);
        }
        return edge;
    }

    static pointAtEdgeStart(p: BABYLON.Vector2, edge: Array<BABYLON.Vector2>): boolean {
        const p0 = edge[0];
        return p.x === p0.x && p.y === p0.y;
    }

    /**
     * Check is 'p' is on a line section
     * @returns boolean
     */
    static ponitOnEdge(p: BABYLON.Vector2, edge: Array<BABYLON.Vector2>): boolean {
        const p0 = edge[0];
        const p1 = edge[1];
        const pt: geometric.Point = [p.x, p.y];
        const line: geometric.Line = [
            [p0.x, p0.y],
            [p1.x, p1.y],
        ];
        const on_line = geometric.pointOnLine(pt, line);
        // console.debug("Checking Point %o is %s edge: %o ", p, (on_line ? "ON" : "OFF"), edge);
        return on_line;
    }

    static debugPos(mesh: BABYLON.Mesh): void {
        mesh.computeWorldMatrix();
        const world_mtx = mesh.getWorldMatrix();
        const local_pos = mesh.getPositionExpressedInLocalSpace();
        const global_pos = BABYLON.Vector3.TransformCoordinates(local_pos, world_mtx);
        console.log("[DBG] Local postion: " + local_pos);
        console.log("[DBG] World postion: " + global_pos);
    }

    /**
     *
     *
     *   /\
     * Y |
     *   |                 p0
     *   |
     *   |   p1
     *   |
     *   +---------------------> X
     *
     *   /\
     * Y |
     *   |                 p1
     *   |
     *   |   p0
     *   |
     *   +---------------------> X
     *
     * @param {*} mesh_name
     * @param {Vector2} p0
     * @param {Vector2} p1
     * @param {*} depthZ
     * @returns the extruded mesh
     */
    static extrudeRect(
        mesh_name: string,
        p0: BABYLON.Vector2,
        p1: BABYLON.Vector2,
        depthZ: number,
        scene: BABYLON.Scene,
        mat?: BABYLON.Material,
    ): BABYLON.Mesh {
        if (p1.y == p0.y || p1.x == p0.x) {
            console.error("Invalid p0(%o) or  p1(%o)", p0, p1);
            throw "Invalid p0/p1: " + p0 + "," + p1;
        }
        const shape = [p0, new BABYLON.Vector2(p0.x, p1.y), p1, new BABYLON.Vector2(p1.x, p0.y)];
        return StBabylonUtil.extrudeShape(mesh_name, shape, depthZ, scene, mat);
    }

    /**
     * SCALE a list of points to BABYLON Vector3
     */
    static toScaledVector3(points: StSketchPoint[]): Array<BABYLON.Vector3> {
        const list: BABYLON.Vector3[] = [];
        for (const p of points) {
            const [x, y] = p.toArray();
            const v = new BABYLON.Vector3(x / ST_SCALE_FROM_MM, y / ST_SCALE_FROM_MM, 0);
            list.push(v);
        }
        return list;
    }

    /**
     *
     * @param {j} mesh_name
     * @param {Array[Vector2](4)} shape
     * @param {*} myPath
     * @param {*} scene
     * @returns the extruded mesh
     */
    static extrudeShape(
        mesh_name: string,
        shape: Array<BABYLON.Vector2>,
        depthZ: number,
        scene: BABYLON.Scene,
        mat?: BABYLON.Material,
    ): BABYLON.Mesh {
        //Shape profile in XY plane
        const myShape: Array<BABYLON.Vector3> = [];
        shape.forEach((p) => {
            //shape.forEach((p, i) => {
            // console.debug("##add piont[%i]: %o", i, p);
            myShape.push(new BABYLON.Vector3(p.x / 1000, p.y / 1000, 0));
        });
        myShape.push(myShape[0]); //close profile

        const myPath = [new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 0, depthZ / 1000)];
        const options = {
            shape: myShape, // vec3 array with z = 0,
            path: myPath, // vec3 array
            updatable: true,
            cap: BABYLON.Mesh.CAP_ALL,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE,
        };
        const extruded = BABYLON.MeshBuilder.ExtrudeShape(mesh_name, options, scene);
        if (mat != null) {
            extruded.material = mat;
        }
        return extruded;
    }

    /**
     * Edit for TS from: https://doc.babylonjs.com/toolsAndResources/utilities/World_Axes
     *
     * @param size
     * @param scene
     */
    static showWorldAxis(size: number, scene: BABYLON.Scene): void {
        const makeTextPlane = function (text: string, color: string, size: number) {
            const dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, scene, true);
            dynamicTexture.hasAlpha = true;
            dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
            const plane = BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
            const mat = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
            mat.backFaceCulling = false;
            mat.specularColor = new BABYLON.Color3(0, 0, 0);
            mat.diffuseTexture = dynamicTexture;
            plane.material = mat;
            return plane;
        };
        const axisX = BABYLON.Mesh.CreateLines(
            "axisX",
            [
                BABYLON.Vector3.Zero(),
                new BABYLON.Vector3(size, 0, 0),
                new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
                new BABYLON.Vector3(size, 0, 0),
                new BABYLON.Vector3(size * 0.95, -0.05 * size, 0),
            ],
            scene,
        );
        axisX.color = new BABYLON.Color3(1, 0, 0);
        const xChar = makeTextPlane("X", "red", size / 10);
        xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
        const axisY = BABYLON.Mesh.CreateLines(
            "axisY",
            [
                BABYLON.Vector3.Zero(),
                new BABYLON.Vector3(0, size, 0),
                new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
                new BABYLON.Vector3(0, size, 0),
                new BABYLON.Vector3(0.05 * size, size * 0.95, 0),
            ],
            scene,
        );
        axisY.color = new BABYLON.Color3(0, 1, 0);
        const yChar = makeTextPlane("Y", "green", size / 10);
        yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
        const axisZ = BABYLON.Mesh.CreateLines(
            "axisZ",
            [
                BABYLON.Vector3.Zero(),
                new BABYLON.Vector3(0, 0, size),
                new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
                new BABYLON.Vector3(0, 0, size),
                new BABYLON.Vector3(0, 0.05 * size, size * 0.95),
            ],
            scene,
        );
        axisZ.color = new BABYLON.Color3(0, 0, 1);
        const zChar = makeTextPlane("Z", "blue", size / 10);
        zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
    }
}
