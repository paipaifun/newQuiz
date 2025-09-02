import { GZPlatform } from "./gzplatform";

export interface PriceInfo {
    amount: number;
    currency: string;
    formattedPrice: string;
    amount_in_hundredths: string;
    offsetted_amount: string;
}

export interface ProductInfo {
    productID: string;
    price: PriceInfo;
    title: string;
    description: string;
}

export type PurchaseConfirmCallback = (purchase: FBInstant.Purchase) => Promise<void>;

export enum PurchaseErrorCode {
    PAYMENT_NOT_INITIALIZED = "PAYMENT_NOT_INITIALIZED",
    PAYMENT_NOT_SUPPORTED = "PAYMENT_NOT_SUPPORTED",
}

export class PurchaseError extends Error {
    code: PurchaseErrorCode;

    constructor(message: string, code: PurchaseErrorCode) {
        super(message);
        this.code = code;
    }
}

/// 为方便mock简化了参数
export interface FBProductInfo {
    productID: string;
    price: string;
    priceAmount: number;
    priceCurrencyCode: string;
    title: string;
    description?: string;
}

export interface FBInstantInterface {
    getSupportedAPIs(): string[];
    payments: {
        onReady(callback: () => void): void;
        getCatalogAsync(): Promise<Array<FBProductInfo>>;
        getPurchasesAsync(): Promise<Array<{
            productID: string;
            paymentID: string;
            purchaseTime: string;
            purchaseToken: string;
            signedRequest: string;
        }>>;
        purchaseAsync(options: { productID: string; }): Promise<{
            productID: string;
            paymentID: string;
            purchaseTime: string;
            purchaseToken: string;
            signedRequest: string;
        }>;
        consumePurchaseAsync(purchaseToken: string): Promise<void>;
    };
}

export class PurchaseManager {
    private static instance: PurchaseManager;
    private initialized = false;
    private notSupported = false;
    private fbInstant!: FBInstantInterface;
    private purchaseConfirmCallback?: PurchaseConfirmCallback;

    private productCache: { [key: string]: ProductInfo; } = {};

    private constructor(fbInstant?: FBInstantInterface) {
        if (fbInstant) {
            this.fbInstant = fbInstant;
        } else if (!GZPlatform.hasFBInstant) {
            this.fbInstant = mockFBInstant;
            console.warn('FBInstant not supported, using mockFBInstant');
        } else if (typeof FBInstant !== 'undefined') {
            this.fbInstant = FBInstant as FBInstantInterface;
        } else {
            console.error('FBInstant not supported');
        }
    }

    public static getInstance(fbInstant?: FBInstantInterface): PurchaseManager {
        if (!PurchaseManager.instance) {
            PurchaseManager.instance = new PurchaseManager(fbInstant);
        }
        return PurchaseManager.instance;
    }

    private checkReady(): void {
        if (!this.initialized) {
            throw new PurchaseError('Payments not initialized', PurchaseErrorCode.PAYMENT_NOT_INITIALIZED);
        }
        if (this.notSupported) {
            throw new PurchaseError('Payments not supported', PurchaseErrorCode.PAYMENT_NOT_SUPPORTED);
        }
    }

    public isSupported(): boolean {
        return !this.notSupported;
    }

    /**
     * 设置消费确认回调
     * @param callback 确认回调函数
     */
    public setPurchaseConfirmCallback(callback: PurchaseConfirmCallback): void {
        this.purchaseConfirmCallback = callback;
    }

    /**
     * 初始化购买模块
     */
    public async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        try {
            // 检查支付功能是否支持
            const apis = this.fbInstant.getSupportedAPIs();
            this.notSupported = apis.indexOf('payments.purchaseAsync') === -1;

            if (!this.notSupported) {
                // 等待支付系统就绪
                await new Promise<void>((resolve, reject) => {
                    this.fbInstant.payments.onReady(resolve);
                });

                // 消费未完成的购买记录
                const purchases = await this.fbInstant.payments.getPurchasesAsync();
                for (const purchase of purchases) {
                    try {
                        if (this.purchaseConfirmCallback) {
                            await this.purchaseConfirmCallback(purchase);
                        }
                        await this.fbInstant.payments.consumePurchaseAsync(purchase.purchaseToken);
                    } catch (error) {
                        console.error('Purchase confirmation failed:', error);
                    }
                }
            }

            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize purchase manager:', error);
            throw error;
        }
    }

    public async getProductInfoList(forcedRefresh: boolean = false): Promise<{ [key: string]: ProductInfo; }> {
        try {
            this.checkReady();
            if (!forcedRefresh && Object.keys(this.productCache).length > 0) {
                return this.productCache;
            }

            const catalog = await this.fbInstant.payments.getCatalogAsync();
            const result: { [key: string]: ProductInfo; } = {};
            for (const item of catalog) {
                result[item.productID] = this.convertFBProductInfo(item);
            }
            this.productCache = result;
            return result;
        } catch (error) {
            console.error('Failed to get product info:', error);
            throw error;
        }
    }

    /**
     * 获取商品信息
     * @param productID 商品ID
     */
    public async getProductInfo(productID: string, forcedRefresh: boolean = false): Promise<ProductInfo> {
        try {
            this.checkReady();
            let product = forcedRefresh ? undefined : this.productCache[productID];
            if (!product) {
                const catalog = await this.fbInstant.payments.getCatalogAsync();
                const item = catalog.find(item => item.productID === productID);
                if (item) {
                    product = this.convertFBProductInfo(item);
                    this.productCache[productID] = product;
                }
            }
            if (!product) {
                throw new Error('Product not found');
            }
            return product;
        } catch (error) {
            console.error('Failed to get product info:', error);
            throw error;
        }
    }

    private convertFBProductInfo(product: FBProductInfo): ProductInfo {
        return {
            productID: product.productID,
            price: {
                amount: product.priceAmount,
                currency: product.priceCurrencyCode || 'USD',
                formattedPrice: product.price,
                amount_in_hundredths: (product as any).amount_in_hundredths ?? "",
                offsetted_amount: (product as any).offsetted_amount ?? "",
            },
            title: product.title,
            description: product.description || '',
        };
    }

    /**
     * 购买商品
     * @param productID 商品ID
     */
    public async purchase(productID: string): Promise<FBInstant.Purchase> {
        try {
            this.checkReady();

            // 检查商品是否存在
            const product = await this.getProductInfo(productID);
            if (!product) {
                throw new Error('Product not found');
            }

            let purchase: FBInstant.Purchase | undefined;
            if (!purchase) {
                // 如果是持有型商品，检查是否已购买
                const purchases = await this.fbInstant.payments.getPurchasesAsync();
                purchase = purchases.filter(p => p.productID === productID)[0];
            }
            if (!purchase) {
                // 执行购买
                purchase = await this.fbInstant.payments.purchaseAsync({
                    productID
                });
            }

            // 验证并消费购买
            if (this.purchaseConfirmCallback) {
                await this.purchaseConfirmCallback(purchase);
            }
            await this.fbInstant.payments.consumePurchaseAsync(purchase.purchaseToken);
            return purchase;
        } catch (error) {
            console.error('Purchase failed:', error);
            throw error;
        }
    }
}

// 创建 mock 的 FBInstant 实例
export const mockFBInstant: FBInstantInterface = {
    getSupportedAPIs: () => [
        // 'payments.purchaseAsync',
        'payments.getCatalogAsync',
        'payments.getPurchasesAsync',
        'payments.consumePurchaseAsync'
    ],
    payments: {
        onReady: (callback: () => void) => callback(),
        getCatalogAsync: async () => [{
            productID: 'mock_product',
            price: '$0.99',
            priceAmount: 0.99,
            priceCurrencyCode: 'USD',
            title: 'Mock Product',
            description: 'Mock Description'
        }],
        getPurchasesAsync: async () => [],
        purchaseAsync: async () => {
            throw new PurchaseError('Purchase failed', PurchaseErrorCode.PAYMENT_NOT_SUPPORTED);
        },
        consumePurchaseAsync: async () => { }
    }
};
