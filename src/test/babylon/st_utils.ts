/**
 * @author Guilin
 *
 * @description     [Test] Downlaod a BABYLON mesh
 *                  Based on: https://doc.babylonjs.com/extensions/Exporters/Save_Babylon
 */

let objectUrl: string;

/**
 * Export a mesh into *.babylon file.
 *
 * Problem: material is NOT included in the exported file!
 *
 * @deprecated seems a very old test file?
 *
 * @param {String} filename
 * @param {BABYLON.Mesh} mesh
 */
export function st_download_mesh(filename: string, mesh: BABYLON.Mesh): void {
    console.debug("serialize mesh into file: %o", filename);
    if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
    }
    const serializedMesh = BABYLON.SceneSerializer.SerializeMesh(mesh, false, true);
    alert("serializedMesh");

    const strMesh = JSON.stringify(serializedMesh);

    /*
    if (filename.toLowerCase().lastIndexOf(".gltf") !== filename.length - 8 || filename.length < 9){
        filename += ".gltf" ;
    }*/
    if (filename.toLowerCase().lastIndexOf(".babylon") !== filename.length - 8 || filename.length < 9) {
        filename += ".babylon";
    }

    const blob = new Blob([strMesh], { type: "octet/stream" });

    // turn blob into an object URL; saved as a member, so can be cleaned out later
    objectUrl = (window.webkitURL || window.URL).createObjectURL(blob);

    const link = window.document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    const click = document.createEvent("MouseEvents");
    click.initEvent("click", true, false);
    link.dispatchEvent(click);
}
