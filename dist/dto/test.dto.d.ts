import { BaseSelectDTO } from '../base/base.dto';
export declare class GetTestDTO {
    id: number;
}
export declare class CreateTestDTO {
    name?: string;
    commit?: string;
}
export declare class GetTestListDTO extends BaseSelectDTO {
}
