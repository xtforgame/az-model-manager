import { AmmSchemas } from '../core/interfaces';
export default class AzModelManager {
    connectString: string;
    constructor(connectString: string);
    reportDb(): Promise<void>;
    testParseSchema(): AmmSchemas | Error;
}
