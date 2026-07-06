import type { IApiKeyModuleService } from '@medusajs/framework/types'
import type { IStoreModuleService } from '@medusajs/framework/types'
import type { ISalesChannelModuleService } from '@medusajs/framework/types'
import type { IProductModuleService } from '@medusajs/framework/types'
import type { IRegionModuleService } from '@medusajs/framework/types'
import type { ICurrencyModuleService } from '@medusajs/framework/types'
import type { ICustomerModuleService } from '@medusajs/framework/types'
import type { ICartModuleService } from '@medusajs/framework/types'
import type { IOrderModuleService } from '@medusajs/framework/types'
import type { IPaymentModuleService } from '@medusajs/framework/types'
import type { IInventoryService } from '@medusajs/framework/types'
import type { IStockLocationService } from '@medusajs/framework/types'
import type { IPricingModuleService } from '@medusajs/framework/types'
import type { IPromotionModuleService } from '@medusajs/framework/types'
import type { ITaxModuleService } from '@medusajs/framework/types'
import type { IFulfillmentModuleService } from '@medusajs/framework/types'
import type { ISettingsModuleService } from '@medusajs/framework/types'
import type { IUserModuleService } from '@medusajs/framework/types'
import type { IAuthModuleService } from '@medusajs/framework/types'
import type { IEventBusModuleService } from '@medusajs/framework/types'
import type WorkflowEngine from '@medusajs/workflow-engine-inmemory'
import type { ICacheService } from '@medusajs/framework/types'
import type { IFileModuleService } from '@medusajs/framework/types'

declare module '@medusajs/framework/types' {
  interface ModuleImplementations {
    'api_key': IApiKeyModuleService,
    'store': IStoreModuleService,
    'sales_channel': ISalesChannelModuleService,
    'product': IProductModuleService,
    'region': IRegionModuleService,
    'currency': ICurrencyModuleService,
    'customer': ICustomerModuleService,
    'cart': ICartModuleService,
    'order': IOrderModuleService,
    'payment': IPaymentModuleService,
    'inventory': IInventoryService,
    'stock_location': IStockLocationService,
    'pricing': IPricingModuleService,
    'promotion': IPromotionModuleService,
    'tax': ITaxModuleService,
    'fulfillment': IFulfillmentModuleService,
    'settings': ISettingsModuleService,
    'user': IUserModuleService,
    'auth': IAuthModuleService,
    'event_bus': IEventBusModuleService,
    'workflow_engine': InstanceType<(typeof WorkflowEngine)['service']>,
    'cache': ICacheService,
    'file': IFileModuleService
  }
}