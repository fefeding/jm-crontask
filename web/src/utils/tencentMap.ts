import axios from 'axios';
// @ts-ignore
import jsonpAdapter from 'axios-jsonp';
import config from '../base/config';

// 1. 定义API响应类型（与腾讯地图文档对齐）
interface TencentGeocoderResponse {
  status: number;
  message: string;
  request_id: string;
  result: {
    title: string;
    location: {
      lat: number;
      lng: number;
    };
    address_components: {
      province: string;
      city: string;
      district: string;
      street: string;
      street_number: string;
    };
    ad_info: {
      adcode: string;
      reliability: number;
      level?: number;
    };
  };
}

// 2. 定义函数入参类型
interface GeocoderParams {
  key?: string;         // 腾讯地图API Key（必填）
  address: string;     // 要解析的地址（必填，需包含城市）
  policy?: 0 | 1;      // 解析策略：0=标准（默认），1=宽松
}

// 3. 定义返回结果类型
interface AddressParseResult {
  ret: number;
  data?: {
    province: string;
    city: string;
    district: string;
    street: string;
    streetNumber: string;
    lat: number;
    lng: number;
    adcode: string;
    reliability: number;
    level?: number;
  };
  msg?: string;
  requestId?: string;
}

/**
 * 使用axios + axios-jsonp调用腾讯地图地址解析API
 * @param params 解析参数
 * @returns Promise<AddressParseResult>
 */
async function getAddressInfo(
  params: GeocoderParams
): Promise<AddressParseResult> {
  //@ts-ignore
  const { key = config.tencentMapKey, address, policy = 0 } = params;

  // 参数验证
  if (!key.trim()) {
    return { ret: 1, msg: '缺少腾讯地图API Key' };
  }
  if (!address.trim()) {
    return { ret: 1, msg: '请输入要解析的地址' };
  }
  
  try {
    // 构建请求配置（使用jsonp适配器）
    const response = await axios({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/',
      adapter: jsonpAdapter, // 使用JSONP适配器
      params: {
        key: key.trim(),
        address: encodeURIComponent(address.trim()), // 地址URL编码
        policy,
        output: 'jsonp', // 明确指定JSONP格式
      },
      timeout: 5000, // 超时设置（5秒）
    });

    // 类型转换
    const result = response.data as TencentGeocoderResponse;

    // 处理API响应
    if (result.status === 0) {
      return {
        ret: 0,
        requestId: result.request_id,
        data: {
          province: result.result.address_components.province,
          city: result.result.address_components.city,
          district: result.result.address_components.district,
          street: result.result.address_components.street,
          streetNumber: result.result.address_components.street_number,
          lat: result.result.location.lat,
          lng: result.result.location.lng,
          adcode: result.result.ad_info.adcode,
          reliability: result.result.ad_info.reliability,
          level: result.result.ad_info.level,
        },
      };
    } else {
      return {
        ret: 1,
        requestId: result.request_id,
        msg: `解析失败：${result.message}（状态码：${result.status}）`,
      };
    }
  } catch (error) {
    // 捕获网络错误/超时等异常
    let errorMsg = '请求失败';
    if (axios.isCancel(error)) {
      errorMsg = '请求已取消';
    } else if (error instanceof Error) {
      errorMsg = error.message;
    }
    return { ret: 1, msg: errorMsg };
  }
}


// 导出函数供其他模块使用
export {
    getAddressInfo
}
