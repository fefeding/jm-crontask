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
exports.BaseSelectDTO = void 0;
const validate_1 = require("@midwayjs/validate");
class BaseSelectDTO {
    page;
    limit;
    filter;
}
__decorate([
    (0, validate_1.Rule)(validate_1.RuleType.number().optional().min(1).default(1)),
    __metadata("design:type", Number)
], BaseSelectDTO.prototype, "page", void 0);
__decorate([
    (0, validate_1.Rule)(validate_1.RuleType.number().optional().min(5).default(20)),
    __metadata("design:type", Number)
], BaseSelectDTO.prototype, "limit", void 0);
__decorate([
    (0, validate_1.Rule)(validate_1.RuleType.string()),
    __metadata("design:type", String)
], BaseSelectDTO.prototype, "filter", void 0);
exports.BaseSelectDTO = BaseSelectDTO;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5kdG8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYmFzZS9iYXNlLmR0by50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxpREFBb0Q7QUFDcEQsTUFBYSxhQUFhO0lBRXRCLElBQUksQ0FBVTtJQUVkLEtBQUssQ0FBVTtJQUVmLE1BQU0sQ0FBVTtDQUNuQjtBQU5HO0lBQUMsSUFBQSxlQUFJLEVBQUMsbUJBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDOzsyQ0FDdkM7QUFDZDtJQUFDLElBQUEsZUFBSSxFQUFDLG1CQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQzs7NENBQ3ZDO0FBQ2Y7SUFBQyxJQUFBLGVBQUksRUFBQyxtQkFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDOzs2Q0FDUjtBQU5wQixzQ0FPQyJ9