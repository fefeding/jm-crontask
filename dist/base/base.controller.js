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
exports.BaseController = void 0;
const core_1 = require("@midwayjs/core");
class BaseController {
    app;
    ctx;
}
__decorate([
    (0, core_1.App)(),
    __metadata("design:type", Object)
], BaseController.prototype, "app", void 0);
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", Object)
], BaseController.prototype, "ctx", void 0);
exports.BaseController = BaseController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Jhc2UvYmFzZS5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHlDQUE2QztBQUc3QyxNQUFzQixjQUFjO0lBRXRCLEdBQUcsQ0FBYztJQUdqQixHQUFHLENBQVU7Q0FDMUI7QUFMRztJQUFDLElBQUEsVUFBRyxHQUFFOzsyQ0FDcUI7QUFFM0I7SUFBQyxJQUFBLGFBQU0sR0FBRTs7MkNBQ2M7QUFMM0Isd0NBTUMifQ==