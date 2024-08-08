import { Rule, RuleType } from '@midwayjs/validate';
export class BaseSelectDTO {
    @Rule(RuleType.number().optional().min(1).default(1))
    page?: number;
    @Rule(RuleType.number().optional().min(5).default(20))
    limit?: number;
    @Rule(RuleType.string())
    filter?: string;
}
