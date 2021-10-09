/**
 *
 * @param path
 * @returns
 */
export function isExternal(path: string): boolean {
    return /^(https?:|mailto:|tel:)/.test(path);
}
/**
 * 支持手机号码，3-4位区号，7-8位直播号码，1－4位分机号
 * @param phoneNumber 手机号码
 * @returns true/false
 */
export function isPhoneNumber(phoneNumber: string) {
    return /((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/.test(
        phoneNumber,
    );
}
