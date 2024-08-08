import { Rule, RuleType } from '@midwayjs/validate';
import { BaseSelectDTO } from '../base/base.dto';

export class GetTestDTO {
    @Rule(RuleType.number())
    id: number;
}

export class CreateTestDTO {
    @Rule(RuleType.string())
    name?: string;
    @Rule(RuleType.string())
    commit?: string;
}

export class GetTestListDTO extends BaseSelectDTO {}
