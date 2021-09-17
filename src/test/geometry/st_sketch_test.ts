export class StSketchTest {
    assertTrue(v: boolean, msg?: string): void {
        if (!v) {
            throw Error(`[Failure] ${msg}`);
        }
    }

    assertValid<T>(v: T | undefined | null, msg?: string): T {
        if (v == undefined) {
            throw Error(`[Failure] value is undefined. -- ${msg}`);
        }
        if (v == null) {
            throw Error(`[Failure] value is null . -- ${msg}`);
        }
        return v;
    }

    assertEqual<T>(result: T, expected: T, msg?: string): void {
        if (result != expected) {
            throw Error(`[Failure] Expected: ${expected}, Result: ${result} -- ${msg} `);
        }
    }
}
