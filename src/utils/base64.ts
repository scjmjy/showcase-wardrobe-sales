export function base64toBlob(base64Data: string) {
    const commaIndex = base64Data.indexOf(",");
    if (commaIndex === -1) {
        return;
    }
    const meta = base64Data.substr(0, commaIndex);
    const data = base64Data.substr(commaIndex + 1);
    const mimeMatch = meta.match(/:(.*);/);
    if (!mimeMatch) {
        return;
    }
    const mime = mimeMatch[1];

    const sliceSize = 1024;
    const byteCharacters = atob(data);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        const begin = sliceIndex * sliceSize;
        const end = Math.min(begin + sliceSize, bytesLength);

        const bytes = new Array(end - begin);
        for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: mime });
}
