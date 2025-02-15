"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTestListDTO = exports.CreateTestDTO = exports.GetTestDTO = void 0;
const validate_1 = require("@midwayjs/validate");
const base_dto_1 = require("../base/base.dto");
class GetTestDTO {
    id;
}
__decorate([
    (0, validate_1.Rule)(validate_1.RuleType.number()),
    __metadata("design:type", Number)
], GetTestDTO.prototype, "id", void 0);
exports.GetTestDTO = GetTestDTO;
class CreateTestDTO {
    name;
    commit;
}
__decorate([
    (0, validate_1.Rule)(validate_1.RuleType.string()),
    __metadata("design:type", String)
], CreateTestDTO.prototype, "name", void 0);
__decorate([
    (0, validate_1.Rule)(validate_1.RuleType.string()),
    __metadata("design:type", String)
], CreateTestDTO.prototype, "commit", void 0);
exports.CreateTestDTO = CreateTestDTO;
class GetTestListDTO extends base_dto_1.BaseSelectDTO {
}
exports.GetTestListDTO = GetTestListDTO;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5kdG8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZHRvL3Rlc3QuZHRvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLGlEQUFvRDtBQUNwRCwrQ0FBaUQ7QUFFakQsTUFBYSxVQUFVO0lBRW5CLEVBQUUsQ0FBUztDQUNkO0FBRkc7SUFBQyxJQUFBLGVBQUksRUFBQyxtQkFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDOztzQ0FDYjtBQUZmLGdDQUdDO0FBRUQsTUFBYSxhQUFhO0lBRXRCLElBQUksQ0FBVTtJQUVkLE1BQU0sQ0FBVTtDQUNuQjtBQUpHO0lBQUMsSUFBQSxlQUFJLEVBQUMsbUJBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7MkNBQ1Y7QUFDZDtJQUFDLElBQUEsZUFBSSxFQUFDLG1CQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7OzZDQUNSO0FBSnBCLHNDQUtDO0FBRUQsTUFBYSxjQUFlLFNBQVEsd0JBQWE7Q0FBRztBQUFwRCx3Q0FBb0QifQ==