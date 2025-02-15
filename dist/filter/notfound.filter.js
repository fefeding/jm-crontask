"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundFilter = void 0;
const core_1 = require("@midwayjs/core");
let NotFoundFilter = class NotFoundFilter {
    async catch(err, ctx) {
        // 404 错误会到这里
        ctx.redirect('/404.html');
    }
};
NotFoundFilter = __decorate([
    (0, core_1.Catch)(core_1.httpError.NotFoundError)
], NotFoundFilter);
exports.NotFoundFilter = NotFoundFilter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90Zm91bmQuZmlsdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ZpbHRlci9ub3Rmb3VuZC5maWx0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEseUNBQW1FO0FBSTVELElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWM7SUFDdkIsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFvQixFQUFFLEdBQVk7UUFDMUMsYUFBYTtRQUNiLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDOUIsQ0FBQztDQUNKLENBQUE7QUFMWSxjQUFjO0lBRDFCLElBQUEsWUFBSyxFQUFDLGdCQUFTLENBQUMsYUFBYSxDQUFDO0dBQ2xCLGNBQWMsQ0FLMUI7QUFMWSx3Q0FBYyJ9