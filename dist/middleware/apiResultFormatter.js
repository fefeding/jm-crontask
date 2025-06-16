"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResultFormatterMiddleware = void 0;
const core_1 = require("@midwayjs/core");
// 校验api路径规则的
const apiReg = /^\/([^/]+\/)?api\//i;
let ApiResultFormatterMiddleware = class ApiResultFormatterMiddleware {
    ignore(ctx) {
        // 下面的路由将忽略此中间件
        return ctx.path === '/' || /^\/([^/]+\/)?api\/cos\/get/.test(ctx.path);
    }
    resolve() {
        return async (ctx, next) => {
            const isApi = apiReg.test(ctx.request.path);
            //console.log(ctx.URL.toString(), isApi);
            if (isApi) {
                try {
                    await next();
                    const res = ctx.body;
                    ctx.body = Object.assign({
                        ret: 0,
                        msg: 'success',
                        data: null,
                    }, typeof res?.ret === 'number' ? res : { data: res });
                    ctx.logger.info(ctx.request.rawBody, ctx.body);
                }
                catch (err) {
                    console.error(err);
                    if (typeof err.ret === 'number') {
                        ctx.body = err;
                    }
                    else {
                        ctx.body = {
                            ret: 1001,
                            msg: err.message,
                        };
                    }
                    ctx.logger.error(ctx.request.rawBody, ctx.body);
                }
                finally {
                    ctx.status = 200;
                }
            }
            else {
                await next();
            }
        };
    }
};
ApiResultFormatterMiddleware = __decorate([
    (0, core_1.Middleware)()
], ApiResultFormatterMiddleware);
exports.ApiResultFormatterMiddleware = ApiResultFormatterMiddleware;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpUmVzdWx0Rm9ybWF0dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21pZGRsZXdhcmUvYXBpUmVzdWx0Rm9ybWF0dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLHlDQUF5RDtBQUd6RCxhQUFhO0FBQ2IsTUFBTSxNQUFNLEdBQUcscUJBQXFCLENBQUM7QUFFOUIsSUFBTSw0QkFBNEIsR0FBbEMsTUFBTSw0QkFBNEI7SUFHckMsTUFBTSxDQUFDLEdBQVk7UUFDZixlQUFlO1FBQ2YsT0FBTyxHQUFHLENBQUMsSUFBSSxLQUFLLEdBQUcsSUFBSSw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFFRCxPQUFPO1FBQ0gsT0FBTyxLQUFLLEVBQUUsR0FBWSxFQUFFLElBQWtCLEVBQUUsRUFBRTtZQUM5QyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUMseUNBQXlDO1lBQ3pDLElBQUksS0FBSyxFQUFFO2dCQUNQLElBQUk7b0JBQ0EsTUFBTSxJQUFJLEVBQUUsQ0FBQztvQkFDYixNQUFNLEdBQUcsR0FBUSxHQUFHLENBQUMsSUFBSSxDQUFDO29CQUMxQixHQUFHLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQ3BCO3dCQUNJLEdBQUcsRUFBRSxDQUFDO3dCQUNOLEdBQUcsRUFBRSxTQUFTO3dCQUNkLElBQUksRUFBRSxJQUFJO3FCQUNiLEVBQ0QsT0FBTyxHQUFHLEVBQUUsR0FBRyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FDckQsQ0FBQztvQkFDRixHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2xEO2dCQUFDLE9BQU8sR0FBRyxFQUFFO29CQUNWLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ25CLElBQUksT0FBTyxHQUFHLENBQUMsR0FBRyxLQUFLLFFBQVEsRUFBRTt3QkFDN0IsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7cUJBQ2xCO3lCQUFNO3dCQUNILEdBQUcsQ0FBQyxJQUFJLEdBQUc7NEJBQ1AsR0FBRyxFQUFFLElBQUk7NEJBQ1QsR0FBRyxFQUFFLEdBQUcsQ0FBQyxPQUFPO3lCQUNuQixDQUFDO3FCQUNMO29CQUNELEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDbkQ7d0JBQ087b0JBQ0osR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7aUJBQ3BCO2FBQ0o7aUJBQU07Z0JBQ0gsTUFBTSxJQUFJLEVBQUUsQ0FBQzthQUNoQjtRQUNMLENBQUMsQ0FBQztJQUNOLENBQUM7Q0FDSixDQUFBO0FBN0NZLDRCQUE0QjtJQUR4QyxJQUFBLGlCQUFVLEdBQUU7R0FDQSw0QkFBNEIsQ0E2Q3hDO0FBN0NZLG9FQUE0QiJ9