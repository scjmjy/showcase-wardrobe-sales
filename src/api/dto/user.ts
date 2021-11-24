// import { getToken, setToken } from "@/utils/token";
import jscookie from "js-cookie";
import { Model3DFile } from "@/api/interface/provider.interface";
import { IndexDb } from "@/lib/indexdb"
import { Resource } from "@/lib/model/resource";

const KeyUser = "KEY-HONGMU-SALES-TOOLS-USER";
const KeyCustomer = "KEY-HONGMU-SALES-TOOLS-CUSTOMER";
const Key3DModel = "KEY-HONGMU-SALES-TOOLS-3DMODEL";

export class Customer {
    constructor(
        public customerId = "",
        public customerName = "",
        public phoneNumber = "",
        public currentSvcId?: number,
    ) {}

    save(): string | undefined {
        return jscookie.set(KeyCustomer, JSON.stringify(this));
    }

    static load(): Customer {
        const customerStr = jscookie.get(KeyCustomer) || "{}";
        let customer;
        try {
            customer = JSON.parse(customerStr);
        } catch (err) {
            console.log(err);
        }
        return Object.assign(new Customer(), customer);
    }
}
export class User {
    constructor(
        public userId = 0,
        public userName = "",
        public token = "",
        public eid = 0,
        public accountName = "",
        public organization = "",
        public rank = "",
        public storeId = 0,
        public photo?: string,
    ) {}

    save(): string | undefined {
        return jscookie.set(KeyUser, JSON.stringify(this));
    }

    static load(): User {
        const userStr = jscookie.get(KeyUser) || "{}";
        let user;
        try {
            user = JSON.parse(userStr);
        } catch (err) {
            console.log(err);
        }
        return Object.assign(new User(), user);
    }
}

export class Model3D {
    static save(models: Model3DFile[]) {
        const resources: Array<Resource> = [];
        for (const model of models) {
            const resource = new Resource(model.name, model.url);
            resources.push(resource);
        }

        const indexDB = new IndexDb();
        indexDB.cache(resources);
        // return localStorage.setItem(Key3DModel, JSON.stringify(models));
    }
    static load(): Model3DFile[] {
        const str = localStorage.getItem(Key3DModel) || "[]";

        let models: Model3DFile[] = [];
        try {
            models = JSON.parse(str);
        } catch (_err) {
            //
        }
        return models;
    }
}
