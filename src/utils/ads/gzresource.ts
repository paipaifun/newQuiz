import { GZPlatform } from "./gzplatform";

/** API配置接口 */
export interface ApiConfig {
    /** API基础URL */
    baseUrl: string;
    /** 应用ID */
    appId: string;
    /** 客户端国家/地区代码 */
    clientCountry: string;
    /** 获取玩家ID的函数 */
    playerId: () => string;
    /** 获取请求签名的异步函数 */
    requestSignature: (payload?: string) => Promise<string>;
}

/** API响应错误类 */
export class ApiResponseError extends Error {
    /** HTTP状态码 */
    status: number;
    /** 请求URL */
    url: string;

    /**
     * 构造函数
     * @param status HTTP状态码
     * @param message 错误信息
     */
    constructor(status: number, url: string, message: string) {
        super(message);
        this.status = status;
        this.url = url;
    }
}

/**
 * 配置API参数
 * @param params API配置参数或简单配置对象
 */
export function config(params: { appId: string, baseUrl: string; debug: boolean; } | ApiConfig) {
    let config: ApiConfig;
    if ("debug" in params) {
        config = makeConfig(params);
    } else {
        config = params;
    }
    ApiConfigManager.getInstance().updateConfig(config);
}

/**
 * 创建API配置
 * @param params 配置参数
 * @returns API配置对象
 */
export function makeConfig(params: { appId: string, baseUrl: string; debug: boolean; }): ApiConfig {
    if (params.debug) {
        return {
            baseUrl: params.baseUrl,
            appId: params.appId,
            clientCountry: GZPlatform.getCountryCode(),
            playerId: () => GZPlatform.getLocalId(),
            requestSignature: async () => {
                return "debug_sign_" + GZPlatform.getLocalId();
            },
        };
    }

    let ts = Date.now();
    let sign = "";
    let signBlock = async (payload?: string) => {
        const toRefresh = payload != null && payload.length > 0;
        if (toRefresh || sign.length == 0 || ts - Date.now() > 30 * 60 * 1000) {
            const info = await FBInstant.player.getSignedPlayerInfoAsync(payload);
            if (toRefresh) {
                return info.getSignature();
            }
            sign = info.getSignature();
            ts = Date.now();
        }
        return sign;
    };

    return {
        baseUrl: params.baseUrl!,
        appId: params.appId,
        clientCountry: GZPlatform.getCountryCode(),
        playerId: () => FBInstant.player.getID() ?? "",
        requestSignature: signBlock,
    };
}

const defaultApiConfig = makeConfig({ appId: "", baseUrl: "", debug: false });

/** API配置管理器类 */
class ApiConfigManager {
    private static instance: ApiConfigManager;
    private config: ApiConfig;

    private constructor() {
        this.config = { ...defaultApiConfig };
    }

    /**
     * 获取单例实例
     * @returns ApiConfigManager实例
     */
    public static getInstance(): ApiConfigManager {
        if (!ApiConfigManager.instance) {
            ApiConfigManager.instance = new ApiConfigManager();
        }
        return ApiConfigManager.instance;
    }

    /**
     * 获取当前配置
     * @returns 当前API配置的副本
     */
    public getConfig(): ApiConfig {
        return { ...this.config };
    }

    /**
     * 更新配置
     * @param newConfig 新的配置参数
     */
    public updateConfig(newConfig: Partial<ApiConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }
}

/** 通用请求头部接口 */
export interface CommonHeaders {
    /** 应用ID */
    'X-App-Id': string;
    /** 客户端国家/地区代码 */
    'X-Client-Country': string;
    /** 玩家ID */
    'X-Player-Id': string;
    /** 请求签名 */
    'X-Request-Signature': string;
}

/** 订单状态枚举 (对应protocol中的OrderStatus) */
export enum OrderStatus {
    CREATED = 0,
    CONSUMED = 1
}

/** 礼包类型枚举 (对应protocol中的PackageType) */
export enum PackageType {
    UNKNOWN = 0,
    IAP = 1,
    COIN = 2,
    PROP = 3,
    SPIN = 4,
    CHECKIN = 5
}

/** 支付类型枚举 (对应protocol中的PayType) */
export enum PayType {
    /** 未知支付类型 */
    PAY_TYPE_UNKNOWN = 0,
    /** FB内购 */
    PAY_TYPE_PURCHASE = 1,
    /** 资源兑换 */
    PAY_TYPE_TRANSACTION = 2,
}

/** 自动恢复资源数据接口 (对应protocol中的AutoRecoverResourceData) */
export interface AutoRecover {
    /** 自动恢复时间戳 */
    auto_recover_ts: number;
    /** 自动恢复上限 */
    auto_recover_limit: number;
    /** 下次恢复时间戳 */
    next_recover_ts: number;
    /** 自动恢复间隔(秒) */
    auto_recover_interval: number;
    /** 服务器当前时间戳 */
    server_cur_ts: number;
}

/** 资源项接口 (对应protocol中的ResourceItem) */
export interface ResourceItem {
    /** 资源键 */
    resource_key: string;
    /** 资源额外键 */
    resource_extra_key: string;
    /** 资源余额 */
    balance: number;
    /** 自动恢复配置 */
    auto_recover?: AutoRecover;
}

/** 资源配置类型 (对应protocol中的AddResource) */
export interface ResourceChange {
    /** 资源ID */
    resource_key: string;
    /** 资源变化值 */
    change_value: number;
    /** 资源描述 */
    resource_desc?: string;
}

/** 商品项基础接口 (对应protocol中的ShopItem) */
export interface BaseItem {
    /** 内部交易ID */
    transaction_rule_id: string;
    /** Facebook商品ID */
    fb_product_id: string;
    /** 礼包类型 */
    pkg_type: PackageType;
    /** 支付类型 */
    pay_type: PayType;
    /** 扣除的资源ID */
    pay_source_id: string;
    /** 价格 */
    pay_amount: string;
    /** 角标标签 */
    corner_label?: string;
    /** 折扣文本 */
    discount_txt?: string;
    /** 增加的资源列表 */
    add_resources: ResourceChange[];
}

/** IAP商品项 */
export interface IAPItem extends BaseItem {
    pkg_type: PackageType.IAP;
}

/** 金币商品项 */
export interface CoinItem extends BaseItem {
    pkg_type: PackageType.COIN;
}

/** 道具商品项 */
export interface PropItem extends BaseItem {
    pkg_type: PackageType.PROP;
    pay_source_id: string;
}

/** 商店数据 (对应protocol中的ShopData) */
export interface ShopData {
    /** 内购礼包列表 */
    iap_items: IAPItem[];
    /** 金币礼包列表 */
    coin_items: CoinItem[];
    /** 道具礼包列表 */
    prop_items: PropItem[];
}

/** 签到奖励项 (对应protocol中的CheckInItem) */
export interface CheckInItem {
    /** 天数 */
    day: number;
    /** 奖励资源列表 */
    add_resources: ResourceChange[];
}

/** 签到数据 (对应protocol中的CheckInData) */
export interface CheckInData {
    /** 签到奖励列表 */
    check_in_items: CheckInItem[];
}

/** 关卡奖励项 (对应protocol中的LevelRewardItem) */
export interface LevelRewardItem {
    /** 关卡ID */
    level_id: number;
    /** 增加资源列表 */
    add_items: ResourceChange[];
}

/** 关卡奖励数据 (对应protocol中的LevelRewardData) */
export interface LevelRewardData {
    /** 关卡奖励列表 */
    level_reward_items: LevelRewardItem[];
}

/** 转盘奖励项 (对应protocol中的SpinItem) */
export interface SpinItem {
    /** 内部交易ID */
    transaction_rule_id: string;
    /** 消耗资源列表 */
    cost_items: ResourceChange[];
    /** 增加资源列表 */
    add_items: ResourceChange[];
}

/** 转盘数据 (对应protocol中的SpinData) */
export interface SpinData {
    /** 转盘奖励列表 */
    spin_items: SpinItem[];
}

/** 配置数据 (对应protocol中的ConfigData) */
export interface ConfigData {
    /** 商店数据 */
    shop_data: ShopData;
    /** 签到奖励数据 */
    check_in_data?: CheckInData;
    /** 转盘奖励数据 */
    spin_data?: SpinData;
    /** 关卡奖励数据 */
    level_reward_data?: LevelRewardData;
}

/** 通用响应接口 (对应protocol中的通用响应结构) */
export interface CommonResponse<T> {
    /** 响应消息 */
    message: string;
    /** 响应数据 */
    data?: T;
}

/** 配置响应 */
export type ConfigResponse = CommonResponse<ConfigData>;

/** 购买价格接口 (对应protocol中的PurchasePrice) */
export interface PurchasePrice {
    /** 金额 */
    amount: string;
    /** 以百分之一为单位的金额 */
    amount_in_hundredths: string;
    /** 货币类型 */
    currency: string;
    /** 优惠后金额 */
    offsetted_amount: string;
}

/** 购买信息接口 (对应protocol中的Purchase) */
export interface Purchase {
    /** 支付ID */
    payment_id: string;
    /** 购买令牌 */
    purchase_token: string;
    /** 商品ID */
    product_id: string;
    /** 购买平台 */
    purchase_platform: string;
    /** 购买价格信息 */
    purchase_price: PurchasePrice;
    /** 购买时间戳 */
    purchase_ts: number;
    /** 支付动作类型 */
    payment_action_type: string;
    /** 购买签名 */
    purchase_signature: string;
}

/** 购买成功提交订单请求结构 (对应protocol中的SubmitPurchasesRequest) */
export interface PurchaseRequest {
    purchases: Purchase[];
}

/** 购买成功提交订单响应结构 (对应protocol中的SubmitPurchasesResponse) */
export type PurchaseResponse = CommonResponse<null>;

/** 查询玩家资源请求结构 (对应protocol中的QueryPlayerResourceRequest) */
export interface QueryResourcesRequest {
    resource_key?: string;
    resource_extra_key?: string;
}

/** 查询玩家资源响应结构 (对应protocol中的QueryPlayerResourceResponse) */
export interface QueryResourcesResponseData {
    bundle: ResourceItem[];
    reward_id?: number;
    add_resource: ResourceChange[];
}

export type QueryResourcesResponse = CommonResponse<QueryResourcesResponseData>;

export interface TransactionDoubleRewardReuest {
    last_reward_id: number;
}

export interface TransactionNormalRequest {
    transaction_rule_id: string;
    extra_key?: string;
}

/** 交易资源请求结构 (对应protocol中的TradingResourceRequest) */
export type TransactionRequest = TransactionDoubleRewardReuest | TransactionNormalRequest;

/** 交易资源响应结构 (对应protocol中的TradingResourceResponse) */
export type TransactionResponse = CommonResponse<QueryResourcesResponseData>;

/** 给予广告奖励请求结构 (对应protocol中的GiveAdAwardRequest) */
export interface AdAwardRequest {
    ad_id: string;
    end_time: number;
    reward_key?: string;
}

/** 给予广告奖励响应结构 (对应protocol中的GiveAdAwardResponse) */
export type AdAwardResponse = CommonResponse<QueryResourcesResponseData>;

/** 订单消费状态项接口 (对应protocol中的OrderConsumptionStatusItem) */
export interface OrderConsumptionStatusItem {
    /** 订单ID */
    payment_id: string;
    /** 购买token */
    purchase_token: string;
    /** 消费状态 */
    status: boolean;
}

/** 消费状态接口 (对应protocol中的ConsumptionStatus) */
export interface ConsumptionStatus {
    /** 消费成功的订单列表 */
    consumed_orders: OrderConsumptionStatusItem[];
}

/** 验证订单消费状态请求接口 (对应protocol中的VerifyOrderConsumptionStatusRequest) */
export interface VerifyOrderConsumptionStatusRequest {
    /** 订单列表 */
    order: Purchase[];
}

/** 验证订单消费状态响应接口 (对应protocol中的VerifyOrderConsumptionStatusResponse) */
export type VerifyOrderConsumptionStatusResponse = CommonResponse<ConsumptionStatus>;

/** 签到请求接口 (对应protocol中的CheckInRequest) */
export interface CheckInRequest {
    /** 无参数 */
}

/** 签到记录数据 (对应protocol中的SignDayData) */
export interface SignDayData {
    /** 已签到时间戳列表 */
    sign_ts_list: string[];
    /** 签到第几天 */
    cur_sign_day: number;
    /** 当天是否已签到 */
    had_signed: boolean;
    /** 下次签到时间戳 */
    next_allow_sign_ts: number;
    /** 当前服务器时间戳 */
    cur_server_ts: number;
}

/** 签到结果数据 (对应protocol中的CheckInResultData) */
export interface CheckInResultData {
    /** 资源数据 */
    resource_data: QueryResourcesResponseData;
    /** 签到记录数据 */
    sign_data: SignDayData;
}

/** 签到响应 */
export type CheckInResponse = CommonResponse<CheckInResultData>;

/** 获取奖励记录请求接口 (对应protocol中的GetRewardsRecordRequest) */
export interface GetRewardsRecordRequest {
    /** 无参数 */
}

/** 宝箱领取状态数据 (对应protocol中的ChestClaimedData) */
export interface ChestClaimedData {
    /** 关卡ID */
    level_id: number;
    /** 领取时间戳 */
    claim_ts: number;
}

/** 奖励记录数据 (对应protocol中的GetRewardsRecordData) */
export interface GetRewardsRecordData {
    /** 7天签到时间戳列表 */
    sign_days: SignDayData;
    /** 通关关卡宝箱领取状态列表 */
    chest_claimed_status: ChestClaimedData[];
}

/** 获取奖励记录响应接口 (对应protocol中的GetRewardsRecordResponse) */
export type GetRewardsRecordResponse = CommonResponse<GetRewardsRecordData>;

/** 提交游戏进度记录请求接口 (对应protocol中的CommitGameProgressRecordRequest) */
export interface SubmitGameProgressRequest {
    /** 进度记录字符串 */
    progress_record: string;
    /** 最后更新时间戳 */
    last_update_ms: number;
}

/** 提交游戏进度记录响应接口 (对应protocol中的CommitGameProgressRecordResponse) */
export type SubmitGameProgressResponse = CommonResponse<null>;

/** 查询游戏进度记录请求接口 (对应protocol中的QueryGameProgressRecordRequest) */
export interface QueryGameProgressRequest {
    /** 无参数 */
}

/** 查询游戏进度记录数据 (对应protocol中的QueryGameProgressRecordData) */
export interface QueryGameProgressData {
    /** 进度记录字符串 */
    progress_record: string;
    /** 最后更新时间戳 */
    last_update_ms: number;
}

/** 查询游戏进度记录响应接口 (对应protocol中的QueryGameProgressRecordResponse) */
export type QueryGameProgressResponse = CommonResponse<QueryGameProgressData>;

/** 提交关卡数据请求接口 (对应protocol中的CommitLevelDataRequest) */
export interface SubmitLevelDataRequest {
    /** 关卡ID */
    level_id: number;
    /** 通关分数 */
    score: number;
    /** 通关时间戳 */
    pass_ts: number;
}

/** 提交关卡数据响应接口 (对应protocol中的CommitLevelDataResponse) */
export type SubmitLevelDataResponse = CommonResponse<null>;

/** 查询关卡数据请求接口 (对应protocol中的QueryLevelDataRequest) */
export interface QueryLevelDataRequest {
    /** 无参数 */
}

/** 关卡数据项 (对应protocol中的LevelItem) */
export interface LevelDataItem {
    /** 关卡ID */
    level_id: number;
    /** 最高分通关分数 */
    score: number;
    /** 通关时间戳 */
    pass_ts: number;
    /** 当前关卡分数 */
    cur_score?: number;
}

/** 关卡数据 (对应protocol中的LevelData) */
export interface LevelData {
    /** 关卡列表 */
    level_list: LevelDataItem[];
}

/** 查询关卡数据响应接口 (对应protocol中的QueryLevelDataResponse) */
export type QueryLevelDataResponse = CommonResponse<LevelData>;

/** 领取关卡奖励请求接口 (对应protocol中的ClaimLevelRewardsRequest) */
export interface ClaimLevelRewardsRequest {
    /** 关卡ID */
    level_id: number;
}

/** 领取关卡奖励响应接口 (对应protocol中的ClaimLevelRewardsResponse) */
export interface ClaimLevelRewardsResponseData {
    bundle: ResourceItem[];
    reward_id: number;
    add_resource: ResourceChange[];
}

export type ClaimLevelRewardsResponse = CommonResponse<ClaimLevelRewardsResponseData>;

/** 查询奖励状态请求接口 (对应protocol中的QueryRewardStatusRequest) */
export interface QueryRewardStatusRequest {
    /** 无参数 */
}

/** 奖励状态数据 (对应protocol中的RewardStatusData) */
export interface RewardStatusData {
    /** 用户签到数据 */
    sign_data: SignDayData;
    /** 已领取关卡奖励列表 */
    level_chest_status: number[];
}

/** 查询奖励状态响应接口 (对应protocol中的QueryRewardStatusResponse) */
export type QueryRewardStatusResponse = CommonResponse<RewardStatusData>;

/**
 * 发送请求
 * @template T 响应数据类型
 * @param endpoint 请求端点
 * @param method 请求方法
 * @param body 请求体
 * @returns Promise<T> 请求响应
 */
async function request<T>(endpoint: string, method: string, body?: any, payload: boolean = false): Promise<T> {
    const payloadStr = payload ? JSON.stringify(body) : undefined;
    const sign = await configManager.getConfig().requestSignature(payloadStr);

    const config = ApiConfigManager.getInstance().getConfig();
    const headers: CommonHeaders = {
        'X-App-Id': config.appId,
        'X-Client-Country': config.clientCountry,
        'X-Player-Id': config.playerId(),
        'X-Request-Signature': sign,
    };

    const options: RequestInit = {
        method,
        headers: {
            ...headers,
            'Content-Type': 'application/json'
        },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    const url = `${config.baseUrl}${endpoint}`;
    const response = await fetch(url, options);
    if (!response.ok) {
        const error = new ApiResponseError(response.status, endpoint, `Request failed with status ${response.status}`);
        throw error;
    }

    const data = await response.json();
    if (typeof data.message !== 'string') {
        throw new ApiResponseError(response.status, endpoint, `Request failed with invalid message`);
    }
    if (data.message.toLowerCase() !== "success") {
        throw new ApiResponseError(response.status, endpoint, data.message);
    }
    return data;
}

/**
 * 提交购买订单
 * @param body 购买请求数据
 * @returns Promise<PurchaseResponse> 购买响应
 */
export async function purchase(body: PurchaseRequest): Promise<PurchaseResponse> {
    return request<PurchaseResponse>('/purchase', 'POST', body);
}

/**
 * 查询玩家资源
 * @param params 查询参数
 * @returns Promise<QueryResourcesResponse> 资源查询响应
 */
export async function queryResources(params: QueryResourcesRequest): Promise<QueryResourcesResponse> {
    const searchParams = new URLSearchParams(params as any);
    return request<QueryResourcesResponse>(`/resources?${searchParams.toString()}`, 'GET');
}

// 交易资源接口
export async function transaction(body: TransactionRequest): Promise<TransactionResponse> {
    return request<TransactionResponse>('/transactions', 'POST', body, true);
}

// 给予广告奖励接口
export async function adAward(body: AdAwardRequest): Promise<AdAwardResponse> {
    return request<AdAwardResponse>('/adawards', 'POST', body, true);
}

// 获取配置接口
export async function getConfig(): Promise<ConfigResponse> {
    return request<ConfigResponse>('/config', 'GET');
}

// 配置管理相关导出
export const configManager = ApiConfigManager.getInstance();

// // 示例请求
// const purchaseBody: PurchaseRequest = {
//     purchases: [
//         {
//             payment_id: '3416667761797027',
//             purchase_token: '122121053246682934',
//             product_id: 'remove.ads01',
//             purchase_platform: 'FB',
//             purchase_price: {
//                 amount: '7.21',
//                 amount_in_hundredths: '721',
//                 currency: 'CNY',
//                 offsetted_amount: '721'
//             },
//             purchase_ts: 1634567890,
//             payment_action_type: 'charge',
//             purchase_signature: 'SIGNED_DATA_FROM_SERVER'
//         }
//     ]
// };

// purchase(purchaseBody).then(response => {
//     console.log('Purchase response:', response);
// }).catch(error => {
//     console.error('Purchase error:', error);
// });

// // 查询玩家资源示例
// const queryParams: QueryResourcesRequest = {
//     resource_key: 'id_stamina'
// };
// queryResources(queryParams).then(response => {
//     console.log('Query resources response:', response);
// }).catch(error => {
//     console.error('Query resources error:', error);
// });

// // 交易资源示例
// const transactionBody: TransactionRequest = {
//     transaction_rule_id: 1,
//     extra_key: 'short_8_1'
// };
// transaction(transactionBody).then(response => {
//     console.log('Transaction response:', response);
// }).catch(error => {
//     console.error('Transaction error:', error);
// });

// // 给予广告奖励示例
// const adAwardBody: AdAwardRequest = {
//     ad_id: '123',
//     end_time: 1212121212
// };
// adAward(adAwardBody).then(response => {
//     console.log('Ad award response:', response);
// }).catch(error => {
//     console.error('Ad award error:', error);
// });

// Mock数据
const mockConfigResponse: ConfigResponse = {
    message: "Success",
    data: {
        shop_data: {
            iap_items: [
                {
                    transaction_rule_id: "6",
                    fb_product_id: "",
                    pkg_type: 1,
                    pay_type: 1,
                    pay_amount: "1.99",
                    corner_label: "Popular",
                    discount_txt: "70% Discount",
                    add_resources: [
                        {
                            resource_key: "id_no_ads",
                            change_value: 1
                        }
                    ],
                    pay_source_id: ""
                },
                {
                    transaction_rule_id: "7",
                    fb_product_id: "",
                    pkg_type: 1,
                    pay_type: 1,
                    pay_amount: "1.99",
                    corner_label: "Popular",
                    discount_txt: "50% Discount",
                    add_resources: [
                        {
                            resource_key: "lives",
                            change_value: 1
                        }
                    ],
                    pay_source_id: ""
                }
            ],
            coin_items: [
                {
                    transaction_rule_id: "8",
                    fb_product_id: "",
                    pkg_type: 2,
                    pay_type: 2,
                    pay_amount: "0",
                    add_resources: [
                        {
                            resource_key: "coin",
                            change_value: 100
                        }
                    ],
                    pay_source_id: ""
                },
                {
                    transaction_rule_id: "9",
                    fb_product_id: "",
                    pkg_type: 2,
                    pay_type: 1,
                    pay_amount: "1.99",
                    corner_label: "HOT",
                    add_resources: [
                        {
                            resource_key: "coin",
                            change_value: 1888
                        }
                    ],
                    pay_source_id: ""
                }
            ],
            prop_items: [
                {
                    transaction_rule_id: "10",
                    fb_product_id: "",
                    pkg_type: 3,
                    pay_type: 2,
                    pay_source_id: "id_coins",
                    pay_amount: "200",
                    add_resources: [
                        {
                            resource_key: "bomb",
                            change_value: 2
                        }
                    ]
                }
            ]
        }
    }
};

/** 游戏进度记录响应 */
export type GameProgressResponse = CommonResponse<QueryGameProgressData>;

/** 关卡数据响应 */
export type LevelDataResponse = CommonResponse<LevelData>;

// 获取关卡数据接口
export async function getLevelData(): Promise<LevelDataResponse> {
    return request<LevelDataResponse>('/leveldata', 'GET');
}

// 提交关卡数据接口
export async function submitLevelData(data: SubmitLevelDataRequest): Promise<SubmitLevelDataResponse> {
    return request<SubmitLevelDataResponse>('/leveldata', 'POST', data);
}

// 查询游戏进度记录接口
export async function getGameProgress(): Promise<GameProgressResponse> {
    return request<GameProgressResponse>('/gameprogress', 'GET');
}

// 提交游戏进度记录接口
export async function submitGameProgress(data: SubmitGameProgressRequest): Promise<SubmitGameProgressResponse> {
    return request<SubmitGameProgressResponse>('/gameprogress', 'POST', data);
}

// 领取关卡奖励接口
export async function claimLevelReward(data: ClaimLevelRewardsRequest): Promise<ClaimLevelRewardsResponse> {
    return request<ClaimLevelRewardsResponse>('/levelrewards', 'POST', data);
}

// 验证订单消费状态接口
export async function verifyOrderConsumptionStatus(data: VerifyOrderConsumptionStatusRequest): Promise<VerifyOrderConsumptionStatusResponse> {
    return request<VerifyOrderConsumptionStatusResponse>('/orders/verify', 'POST', data);
}

// 签到接口
export async function checkIn(data: CheckInRequest): Promise<CheckInResponse> {
    return request<CheckInResponse>('/check-ins', 'POST', data);
}

// 获取奖励记录接口
export async function getRewardsRecord(params: GetRewardsRecordRequest): Promise<GetRewardsRecordResponse> {
    const searchParams = new URLSearchParams(params as any);
    return request<GetRewardsRecordResponse>(`/rewards/record?${searchParams.toString()}`, 'GET');
}

// 查询奖励状态接口
export async function queryRewardStatus(params: QueryRewardStatusRequest): Promise<QueryRewardStatusResponse> {
    const searchParams = new URLSearchParams(params as any);
    return request<QueryRewardStatusResponse>(`/rewardstatus?${searchParams.toString()}`, 'GET');
}
