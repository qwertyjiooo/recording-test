export default class Utils {
    static processDictToArray(dict: { [key: string]: any }): any[];
}
declare module '@/utils/utils' {
    export default processDictToArray;
}
