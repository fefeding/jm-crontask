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
exports.APIController = void 0;
const core_1 = require("@midwayjs/core");
let APIController = class APIController {
    ctx;
};
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", Object)
], APIController.prototype, "ctx", void 0);
APIController = __decorate([
    (0, core_1.Provide)(),
    (0, core_1.Controller)('/api')
], APIController);
exports.APIController = APIController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbnRyb2xsZXIvYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHlDQUE2RDtBQUt0RCxJQUFNLGFBQWEsR0FBbkIsTUFBTSxhQUFhO0lBRXRCLEdBQUcsQ0FBVTtDQUNoQixDQUFBO0FBRkc7SUFBQyxJQUFBLGFBQU0sR0FBRTs7MENBQ0k7QUFGSixhQUFhO0lBRnpCLElBQUEsY0FBTyxHQUFFO0lBQ1QsSUFBQSxpQkFBVSxFQUFDLE1BQU0sQ0FBQztHQUNOLGFBQWEsQ0FHekI7QUFIWSxzQ0FBYSJ9