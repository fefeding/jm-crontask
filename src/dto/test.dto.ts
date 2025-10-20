import { Rule, RuleType } from '@midwayjs/validate';

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
