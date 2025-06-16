"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestInitMiddleware = void 0;
const core_1 = require("@midwayjs/core");
const uuid_1 = require("uuid");
let RequestInitMiddleware = class RequestInitMiddleware {
    resolve() {
        return async (ctx, next) => {
            const body = (ctx.request.body || {});
            let request_id = ctx.URL.searchParams.get('request_id') || body.request_id ||
                ctx.request.header['x-request-id'] ||
                ctx.cookies.get('request_id', {
                    signed: false,
                });
            if (!request_id)
                request_id = (0, uuid_1.v4)().replace(/-/g, '');
            ctx.request_id = request_id;
            console.log('request start', request_id, ctx.url);
            return next();
        };
    }
};
RequestInitMiddleware = __decorate([
    (0, core_1.Middleware)()
], RequestInitMiddleware);
exports.RequestInitMiddleware = RequestInitMiddleware;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdEluaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWlkZGxld2FyZS9yZXF1ZXN0SW5pdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSx5Q0FBeUQ7QUFFekQsK0JBQWtDO0FBRzNCLElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXFCO0lBQzlCLE9BQU87UUFDSCxPQUFPLEtBQUssRUFBRSxHQUFZLEVBQUUsSUFBa0IsRUFBRSxFQUFFO1lBQzlDLE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFRLENBQUM7WUFDN0MsSUFBSSxVQUFVLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVO2dCQUN0RSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUM7Z0JBQ2xDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRTtvQkFDdEIsTUFBTSxFQUFFLEtBQUs7aUJBQ2hCLENBQUMsQ0FBQztZQUVYLElBQUksQ0FBQyxVQUFVO2dCQUFFLFVBQVUsR0FBRyxJQUFBLFNBQUksR0FBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFdkQsR0FBRyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7WUFDNUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsVUFBVSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNsRCxPQUFPLElBQUksRUFBRSxDQUFDO1FBQ2xCLENBQUMsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFBO0FBakJZLHFCQUFxQjtJQURqQyxJQUFBLGlCQUFVLEdBQUU7R0FDQSxxQkFBcUIsQ0FpQmpDO0FBakJZLHNEQUFxQiJ9