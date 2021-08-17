import { StSketchRect } from "../geometry/st_geometric_2d";
import { StIAccesory } from "./st_model_interface";
import { StModel } from "./st_model_object";


export abstract class StSketchAccesory extends StModel implements StIAccesory {
    getOccupyRect(): StSketchRect {
        throw new Error("Method not implemented.");
    }
    overlapWith(acce: StSketchAccesory): boolean {
        throw new Error("Method not implemented." + acce.toString());
    }
}
