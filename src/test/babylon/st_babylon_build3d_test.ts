import { StBabylonBuild3d } from "@/lib/babylonjs/st_babylon_build3d";
import { StSketchPoint, StSketchRect } from "@/lib/geometry/st_geometric_2d";
import { StSketchVector3 } from "@/lib/geometry/st_geometric_3d";
import { StMaterial } from "@/lib/utility/st_material";

export class StBabylonBuild3dTest {
    /**
     * Test the rotate and translate(LOCAL/WORLD) after setting the pivot point.
     * @param scene
     * @returns
     */
    createBox_setPivotPoint(scene: BABYLON.Scene): string {
        const build3d = new StBabylonBuild3d({ scene: scene });
        const rect = StSketchRect.buildRectByStartPoint(new StSketchPoint(0, 0), 400, 200);
        const depth = 20;
        const trans = new StSketchVector3(rect.a / 2, rect.b / 2, depth / 2);

        {
            const [uuid, mesh] = build3d.createTiledBox(rect, depth, StMaterial.OAK_02);
            console.log(`create success. uuid:${uuid}, mesh:${mesh.name}`);
        }

        {
            console.log("===== setPivotPoint() -> translate(WORLD) --> rorate() --> translate(LOCAL) =====");
            const [uuid, mesh] = build3d.createTiledBox(rect, depth, StMaterial.OAK_01);
            console.log(`create success. uuid:${uuid}, mesh:${mesh.name}`);
            console.debug(`##1. [original[] position: ${mesh.position}, pivot: ${mesh.getPivotPoint()}`);

            mesh.setPivotPoint(trans.multiple(-1).scaleToBabylon());
            console.debug(
                `##1.1 [set pivot to LEFT_BOTTOM corner] position: ${mesh.position}, pivot: ${mesh.getPivotPoint()}`,
            );

            mesh.translate(BABYLON.Axis.X, trans.x / 1000);
            mesh.translate(BABYLON.Axis.Y, trans.y / 1000);
            mesh.translate(BABYLON.Axis.Z, trans.z / 1000);
            console.debug(`##2. [translate to corner] position: ${mesh.position}, pivot: ${mesh.getPivotPoint()}`);

            mesh.rotate(BABYLON.Axis.Y, Math.PI / -2);
            console.debug(`##3. [rotate 90 Y] position: ${mesh.position}, pivot: ${mesh.getPivotPoint()}`);

            mesh.translate(BABYLON.Axis.X, rect.a / 1000);
            console.debug(`##4. [translatet --> X ] position: ${mesh.position}, pivot: ${mesh.getPivotPoint()}`);
        }

        {
            console.log("===== setPivotPoint() -> translate(WORLD) --> rorate() --> translate(WORLD) =====");
            const [uuid, mesh] = build3d.createTiledBox(rect, depth, StMaterial.OAK_01);
            console.log(`create success. uuid:${uuid}, mesh:${mesh.name}`);
            console.debug(`##1. [original[] position: ${mesh.position}, pivot: ${mesh.getPivotPoint()}`);

            mesh.setPivotPoint(trans.multiple(-1).scaleToBabylon());
            console.debug(
                `##1.1 [set pivot to LEFT_BOTTOM corner] position: ${mesh.position}, pivot: ${mesh.getPivotPoint()}`,
            );

            mesh.translate(BABYLON.Axis.X, trans.x / 1000);
            mesh.translate(BABYLON.Axis.Y, trans.y / 1000);
            mesh.translate(BABYLON.Axis.Z, trans.z / 1000);
            console.debug(`##2. [translate to corner] position: ${mesh.position}, pivot: ${mesh.getPivotPoint()}`);

            mesh.rotate(BABYLON.Axis.Y, Math.PI / -2);
            console.debug(`##3. [rotate 90 Y] position: ${mesh.position}, pivot: ${mesh.getPivotPoint()}`);

            mesh.translate(BABYLON.Axis.X, rect.a / 1000, BABYLON.Space.WORLD);
            console.debug(
                `##4. [translatet --> X (WORLD) ] position: ${mesh.position}, pivot: ${mesh.getPivotPoint()}`,
            );
        }

        return "[TODO] QUESTION: Changing Pivot makes translate(WORLD) NOT work as expected! Reason??"; //  translate() after rotating with new PIVOT does not work as expected!! Reason???";
    }

    createBox_1(scene: BABYLON.Scene): string {
        const build3d = new StBabylonBuild3d({ scene: scene });
        const rect = StSketchRect.buildRectByStartPoint(new StSketchPoint(0, 0), 400, 200);
        const depth = 20;
        const trans = new StSketchVector3(rect.a / 2, rect.b / 2, depth / 2);

        {
            const [uuid, mesh] = build3d.createTiledBox(rect, depth, StMaterial.OAK_02);
            console.log(`create success. uuid:${uuid}, mesh:${mesh.name}`);
        }

        {
            console.log("===== LOCAL space: translate() --> rorate() =====");
            const [uuid, mesh] = build3d.createTiledBox(rect, depth, StMaterial.OAK_01);
            console.log(`create success. uuid:${uuid}, mesh:${mesh.name}`);
            console.debug(`##1. [original[] position: ${mesh.position}, pivot: ${mesh.getPivotPoint()}`);
            mesh.translate(BABYLON.Axis.X, trans.x / 1000);
            mesh.translate(BABYLON.Axis.Y, trans.y / 1000);
            mesh.translate(BABYLON.Axis.Z, trans.z / 1000);
            console.debug(`##2. [translate to corner] position: ${mesh.position}, pivot: ${mesh.getPivotPoint()}`);
            mesh.rotate(BABYLON.Axis.Y, Math.PI / -2);
            console.debug(`##3. [rotate 90 Y] position: ${mesh.position}, pivot: ${mesh.getPivotPoint()}`);
        }

        {
            console.log("===== WORLD space: translate() =====");
            const [uuid, mesh] = build3d.createTiledBox(rect, depth, StMaterial.OAK_01);
            console.log(`create success. uuid:${uuid}, mesh:${mesh.name}`);
            console.debug(`##1. [original[] position: ${mesh.position}, pivot: ${mesh.getPivotPoint()}`);
            mesh.translate(BABYLON.Axis.X, (trans.x / 1000) * 2, BABYLON.Space.WORLD);
            mesh.translate(BABYLON.Axis.Y, trans.y / 1000, BABYLON.Space.WORLD);
            mesh.translate(BABYLON.Axis.Z, trans.z / 1000, BABYLON.Space.WORLD);
            console.debug(`##2. [translate to corner] position: ${mesh.position}, pivot: ${mesh.getPivotPoint()}`);
        }

        return "translate in LOCAL and WORLD space";
    }

    createBox_2(scene: BABYLON.Scene): string {
        const build3d = new StBabylonBuild3d({ scene: scene });
        const rect = StSketchRect.buildRectByStartPoint(new StSketchPoint(0, 0), 400, 200);
        const depth = 20;
        {
            console.log("===== Rotate(LOCAL) --> translate(WORLD) =====");
            const [uuid, mesh] = build3d.createTiledBox(rect, depth, StMaterial.OAK_01);
            console.log(`create success. uuid:${uuid}, mesh:${mesh.name}`);
            console.debug(`##1. [original[] position: ${mesh.position}, pivot: ${mesh.getPivotPoint()}`);

            mesh.rotate(BABYLON.Axis.Y, Math.PI / -2);
            console.debug(`##3. [rotate 90 Y] position: ${mesh.position}, pivot: ${mesh.getPivotPoint()}`);

            mesh.translate(BABYLON.Axis.X, depth / 2 / 1000, BABYLON.Space.WORLD);
            mesh.translate(BABYLON.Axis.Y, rect.b / 2 / 1000, BABYLON.Space.WORLD);
            mesh.translate(BABYLON.Axis.Z, rect.a / 2 / 1000, BABYLON.Space.WORLD);
            console.debug(`##2. [translate to corner] position: ${mesh.position}, pivot: ${mesh.getPivotPoint()}`);
        }

        {
            console.log("===== Rotate(LOCAL) --> translate(WORLD) --> translate(WROLD) =====");
            const [uuid, mesh] = build3d.createTiledBox(rect, depth, StMaterial.OAK_01);
            console.log(`create success. uuid:${uuid}, mesh:${mesh.name}`);
            console.debug(`##1. [original[] position: ${mesh.position}, pivot: ${mesh.getPivotPoint()}`);

            mesh.rotate(BABYLON.Axis.Y, Math.PI / -2);
            console.debug(`##3. [rotate 90 Y] position: ${mesh.position}, pivot: ${mesh.getPivotPoint()}`);

            mesh.translate(BABYLON.Axis.X, depth / 2 / 1000, BABYLON.Space.WORLD);
            mesh.translate(BABYLON.Axis.Y, rect.b / 2 / 1000, BABYLON.Space.WORLD);
            mesh.translate(BABYLON.Axis.Z, rect.a / 2 / 1000, BABYLON.Space.WORLD);
            console.debug(`##2. [translate to corner] position: ${mesh.position}, pivot: ${mesh.getPivotPoint()}`);

            mesh.translate(BABYLON.Axis.X, rect.a / 1000, BABYLON.Space.WORLD);
        }

        return "[INF] rotate --> translate is OK";
    }
}
