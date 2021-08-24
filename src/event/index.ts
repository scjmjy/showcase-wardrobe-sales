import mitt from "mitt";

export type Events = {
    "logged-in": string;
    "logged-out": string;
    "start-serving": number;
    "stop-serving": number;
    "customer-created": string;
};

export default mitt<Events>();
