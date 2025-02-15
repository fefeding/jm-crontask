"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportMiddleware = void 0;
const core_1 = require("@midwayjs/core");
let ReportMiddleware = class ReportMiddleware {
    resolve() {
        return async (ctx, next) => {
            // 控制器前执行的逻辑
            const startTime = Date.now();
            // 执行下一个 Web 中间件，最后执行到控制器
            // 这里可以拿到下一个中间件或者控制器的返回值
            const result = await next();
            // 控制器之后执行的逻辑
            console.info(`Report, ${ctx.href} rt = ${Date.now() - startTime}ms`);
            // 返回给上一个中间件的结果
            return result;
        };
    }
    static getName() {
        return 'report';
    }
};
ReportMiddleware = __decorate([
    (0, core_1.Middleware)()
], ReportMiddleware);
exports.ReportMiddleware = ReportMiddleware;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0Lm1pZGRsZXdhcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWlkZGxld2FyZS9yZXBvcnQubWlkZGxld2FyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSx5Q0FBeUQ7QUFJbEQsSUFBTSxnQkFBZ0IsR0FBdEIsTUFBTSxnQkFBZ0I7SUFDekIsT0FBTztRQUNILE9BQU8sS0FBSyxFQUFFLEdBQVksRUFBRSxJQUFrQixFQUFFLEVBQUU7WUFDOUMsWUFBWTtZQUNaLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUM3Qix5QkFBeUI7WUFDekIsd0JBQXdCO1lBQ3hCLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxFQUFFLENBQUM7WUFDNUIsYUFBYTtZQUNiLE9BQU8sQ0FBQyxJQUFJLENBQ1IsV0FBVyxHQUFHLENBQUMsSUFBSSxTQUFTLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLElBQUksQ0FDekQsQ0FBQztZQUNGLGVBQWU7WUFDZixPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDLENBQUM7SUFDTixDQUFDO0lBRUQsTUFBTSxDQUFDLE9BQU87UUFDVixPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0NBQ0osQ0FBQTtBQXBCWSxnQkFBZ0I7SUFENUIsSUFBQSxpQkFBVSxHQUFFO0dBQ0EsZ0JBQWdCLENBb0I1QjtBQXBCWSw0Q0FBZ0IifQ==