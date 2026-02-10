'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/admin/components/ui';
import { DEFAULT_VARIANT_PRESET_KEY } from '@/lib/modules/variant-presets';
import { WizardProgress } from './seed-wizard/WizardProgress';
import { WebsiteTypeStep } from './seed-wizard/steps/WebsiteTypeStep';
import { ExtraFeaturesStep } from './seed-wizard/steps/ExtraFeaturesStep';
import { SaleModeStep } from './seed-wizard/steps/SaleModeStep';
import { ProductTypeStep } from './seed-wizard/steps/ProductTypeStep';
import { ProductVariantsStep } from './seed-wizard/steps/ProductVariantsStep';
import { BusinessInfoStep } from './seed-wizard/steps/BusinessInfoStep';
import { ReviewStep } from './seed-wizard/steps/ReviewStep';
import {
  buildModuleSelection,
  buildSeedConfigs,
  getBaseModules,
} from './seed-wizard/wizard-presets';
import type {
  BusinessInfo,
  DigitalDeliveryType,
  ProductType,
  SaleMode,
  WizardState,
} from './seed-wizard/types';

type SeedWizardDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
};

const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  address: '',
  email: 'contact@example.com',
  phone: '',
  siteName: 'VietAdmin',
  tagline: '',
};

const DEFAULT_STATE: WizardState = {
  businessInfo: DEFAULT_BUSINESS_INFO,
  clearBeforeSeed: true,
  dataScale: 'medium',
  digitalDeliveryType: 'account',
  extraFeatures: new Set(),
  productType: 'physical',
  saleMode: 'cart',
  variantEnabled: false,
  variantImages: 'inherit',
  variantPresetKey: DEFAULT_VARIANT_PRESET_KEY,
  variantPricing: 'variant',
  variantStock: 'variant',
  websiteType: 'landing',
};

const DIGITAL_TEMPLATE_MAP: Record<DigitalDeliveryType, Record<string, string>> = {
  account: { password: 'password123', username: 'user@example.com' },
  custom: { customContent: 'Thông tin giao hàng số sẽ được gửi sau khi thanh toán.' },
  download: { downloadUrl: 'https://example.com/download/sample.zip' },
  license: { licenseKey: 'XXXX-YYYY-ZZZZ-1234' },
};

export function SeedWizardDialog({ open, onOpenChange, onComplete }: SeedWizardDialogProps) {
  const [state, setState] = useState<WizardState>(DEFAULT_STATE);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSeeding, setIsSeeding] = useState(false);

  const modules = useQuery(api.admin.modules.listModules);
  const productsList = useQuery(api.products.listAll, { limit: 200 });
  const productsRef = useRef(productsList ?? []);

  const seedBulk = useMutation(api.seedManager.seedBulk);
  const clearAll = useMutation(api.seedManager.clearAll);
  const setModuleSetting = useMutation(api.admin.modules.setModuleSetting);
  const setSettings = useMutation(api.settings.setMultiple);
  const toggleModule = useMutation(api.admin.modules.toggleModule);
  const updateProduct = useMutation(api.products.update);

  useEffect(() => {
    if (productsList) {
      productsRef.current = productsList;
    }
  }, [productsList]);

  const selectedModules = useMemo(() => buildModuleSelection(state), [state]);
  const baseModules = useMemo(() => getBaseModules(state.websiteType), [state.websiteType]);
  const hasProducts = selectedModules.includes('products');
  const hasPosts = selectedModules.includes('posts');
  const hasServices = selectedModules.includes('services');

  const steps = useMemo(() => {
    const list = ['website', 'extras'];
    if (hasProducts) {
      list.push('saleMode', 'productType', 'variants');
    }
    list.push('business', 'review');
    return list;
  }, [hasProducts]);

  useEffect(() => {
    setCurrentStep(0);
  }, [state.websiteType, hasProducts]);

  useEffect(() => {
    setState((prev) => {
      const next = new Set(prev.extraFeatures);
      if (!hasProducts) {
        next.delete('wishlist');
        next.delete('promotions');
      }
      if (!hasProducts && !hasPosts) {
        next.delete('comments');
      }
      if (hasServices) {
        next.delete('services');
      }
      return { ...prev, extraFeatures: next };
    });
  }, [hasProducts, hasPosts, hasServices]);

  const handleToggleFeature = (featureKey: string, enabled: boolean) => {
    setState((prev) => {
      const next = new Set(prev.extraFeatures);
      if (enabled) {
        next.add(featureKey);
      } else {
        next.delete(featureKey);
      }
      return { ...prev, extraFeatures: next };
    });
  };

  const handleSaleModeChange = (saleMode: SaleMode) => {
    setState((prev) => ({ ...prev, saleMode }));
  };

  const handleProductTypeChange = (productType: ProductType) => {
    setState((prev) => ({ ...prev, productType }));
  };

  const handleDigitalDeliveryChange = (deliveryType: DigitalDeliveryType) => {
    setState((prev) => ({ ...prev, digitalDeliveryType: deliveryType }));
  };

  const handleVariantToggle = (enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      variantEnabled: enabled,
      variantPresetKey: enabled ? prev.variantPresetKey : DEFAULT_VARIANT_PRESET_KEY,
    }));
  };

  const stepKey = steps[currentStep];
  const totalSteps = steps.length;

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }
    void handleSeed();
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const buildSummary = () => {
    const saleModeLabel = state.saleMode === 'cart'
      ? 'Giỏ hàng & thanh toán'
      : state.saleMode === 'contact'
        ? 'Nút liên hệ'
        : 'Affiliate (Mua ngay)';
    const productTypeLabel = state.productType === 'both'
      ? 'Vật lý + Số'
      : state.productType === 'digital'
        ? 'Chỉ hàng số'
        : 'Chỉ hàng vật lý';
    const variantLabel = state.variantEnabled ? state.variantPresetKey : 'Không có phiên bản';

    return [
      { label: 'Website', value: state.websiteType },
      { label: 'Chế độ bán', value: saleModeLabel },
      { label: 'Loại sản phẩm', value: productTypeLabel },
      { label: 'Phiên bản SP', value: variantLabel },
      { label: 'Tên website', value: state.businessInfo.siteName || 'VietAdmin' },
    ];
  };

  const syncModules = async (desiredModules: string[]) => {
    if (!modules) {
      return;
    }

    const moduleMap = new Map(modules.map((module) => [module.key, module]));
    const desiredSet = new Set(desiredModules);

    const toEnable = modules
      .filter((module) => desiredSet.has(module.key) && !module.enabled)
      .map((module) => module.key);

    const toDisable = modules
      .filter((module) => !desiredSet.has(module.key) && module.enabled && !module.isCore)
      .map((module) => module.key);

    const orderedEnable = orderModulesByDependencies(toEnable, moduleMap);

    for (const moduleKey of orderedEnable) {
      await toggleModule({ enabled: true, key: moduleKey });
    }

    for (const moduleKey of toDisable) {
      await toggleModule({ enabled: false, key: moduleKey });
    }
  };

  const applyProductOverrides = async () => {
    if (!hasProducts) {
      return;
    }
    if (state.saleMode !== 'affiliate' && state.productType === 'physical') {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
    const products = productsRef.current ?? [];
    if (products.length === 0) {
      return;
    }

    const shouldDigital = state.productType !== 'physical';
    const digitalTemplate = DIGITAL_TEMPLATE_MAP[state.digitalDeliveryType];

    const updates = products.map((product, index) => {
      const isDigital = shouldDigital && (state.productType === 'digital' || index % 2 === 0);
      return updateProduct({
        affiliateLink: state.saleMode === 'affiliate'
          ? `https://example.com/buy/${product.slug}`
          : undefined,
        digitalCredentialsTemplate: isDigital ? digitalTemplate : undefined,
        digitalDeliveryType: isDigital ? state.digitalDeliveryType : undefined,
        id: product._id,
        productType: isDigital ? 'digital' : 'physical',
      });
    });

    await Promise.all(updates);
  };

  const handleSeed = async () => {
    if (isSeeding) {
      return;
    }

    setIsSeeding(true);
    const toastId = toast.loading('Đang seed theo wizard...');

    try {
      if (state.clearBeforeSeed) {
        await clearAll({ excludeSystem: false });
      }

      await syncModules(selectedModules);

      const seedConfigs = buildSeedConfigs(selectedModules, state.dataScale).map((config) => ({
        ...config,
        force: false,
        variantPresetKey: config.module === 'products' && state.variantEnabled
          ? state.variantPresetKey
          : undefined,
      }));

      await seedBulk({ configs: seedConfigs });

      await setModuleSetting({ moduleKey: 'products', settingKey: 'saleMode', value: state.saleMode });
      await setModuleSetting({ moduleKey: 'products', settingKey: 'variantEnabled', value: state.variantEnabled });
      await setModuleSetting({ moduleKey: 'products', settingKey: 'variantPricing', value: state.variantPricing });
      await setModuleSetting({ moduleKey: 'products', settingKey: 'variantStock', value: state.variantStock });
      await setModuleSetting({ moduleKey: 'products', settingKey: 'variantImages', value: state.variantImages });
      await setModuleSetting({ moduleKey: 'products', settingKey: 'outOfStockDisplay', value: 'blur' });
      await setModuleSetting({ moduleKey: 'products', settingKey: 'imageChangeAnimation', value: 'fade' });
      await setModuleSetting({
        moduleKey: 'products',
        settingKey: 'enableDigitalProducts',
        value: state.productType !== 'physical',
      });
      await setModuleSetting({
        moduleKey: 'products',
        settingKey: 'defaultDigitalDeliveryType',
        value: state.digitalDeliveryType,
      });

      await setSettings({
        settings: [
          { group: 'site', key: 'site_name', value: state.businessInfo.siteName || 'VietAdmin' },
          { group: 'site', key: 'site_tagline', value: state.businessInfo.tagline || '' },
          { group: 'contact', key: 'contact_email', value: state.businessInfo.email || 'contact@example.com' },
          { group: 'contact', key: 'contact_phone', value: state.businessInfo.phone || '' },
          { group: 'contact', key: 'contact_address', value: state.businessInfo.address || '' },
          {
            group: 'seo',
            key: 'seo_title',
            value: state.businessInfo.tagline
              ? `${state.businessInfo.siteName} - ${state.businessInfo.tagline}`
              : state.businessInfo.siteName,
          },
          { group: 'seo', key: 'seo_description', value: state.businessInfo.tagline || '' },
        ],
      });

      await applyProductOverrides();

      toast.success('Seed wizard hoàn tất!', { id: toastId });
      onComplete?.();
      onOpenChange(false);
      setState(DEFAULT_STATE);
      setCurrentStep(0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Seed thất bại', { id: toastId });
    } finally {
      setIsSeeding(false);
    }
  };

  const summary = buildSummary();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-cyan-500" /> Seed Wizard
          </DialogTitle>
          <DialogDescription>
            Seed dữ liệu theo wizard hỏi thẳng từng quyết định quan trọng.
          </DialogDescription>
        </DialogHeader>

        <WizardProgress currentStep={currentStep + 1} totalSteps={totalSteps} />

        <div className="flex-1 overflow-y-auto pr-2 mt-2 space-y-6">
          {stepKey === 'website' && (
            <WebsiteTypeStep
              value={state.websiteType}
              onChange={(websiteType) => setState((prev) => ({ ...prev, websiteType }))}
            />
          )}

          {stepKey === 'extras' && (
            <ExtraFeaturesStep
              enabledFeatures={state.extraFeatures}
              hasPosts={baseModules.includes('posts') || state.extraFeatures.has('posts')}
              hasProducts={baseModules.includes('products') || state.extraFeatures.has('products')}
              hasServices={baseModules.includes('services') || state.extraFeatures.has('services')}
              onToggle={handleToggleFeature}
            />
          )}

          {stepKey === 'saleMode' && (
            <SaleModeStep value={state.saleMode} onChange={handleSaleModeChange} />
          )}

          {stepKey === 'productType' && (
            <ProductTypeStep
              deliveryType={state.digitalDeliveryType}
              productType={state.productType}
              onDeliveryChange={handleDigitalDeliveryChange}
              onProductTypeChange={handleProductTypeChange}
            />
          )}

          {stepKey === 'variants' && (
            <ProductVariantsStep
              variantEnabled={state.variantEnabled}
              variantImages={state.variantImages}
              variantPresetKey={state.variantPresetKey}
              variantPricing={state.variantPricing}
              variantStock={state.variantStock}
              onToggleEnabled={handleVariantToggle}
              onPresetChange={(presetKey) => setState((prev) => ({ ...prev, variantPresetKey: presetKey }))}
              onPricingChange={(value) => setState((prev) => ({ ...prev, variantPricing: value }))}
              onStockChange={(value) => setState((prev) => ({ ...prev, variantStock: value }))}
              onImagesChange={(value) => setState((prev) => ({ ...prev, variantImages: value }))}
            />
          )}

          {stepKey === 'business' && (
            <BusinessInfoStep
              value={state.businessInfo}
              onChange={(businessInfo) => setState((prev) => ({ ...prev, businessInfo }))}
            />
          )}

          {stepKey === 'review' && (
            <ReviewStep
              clearBeforeSeed={state.clearBeforeSeed}
              dataScale={state.dataScale}
              modules={selectedModules}
              summary={summary}
              onClearChange={(value) => setState((prev) => ({ ...prev, clearBeforeSeed: value }))}
              onScaleChange={(value) => setState((prev) => ({ ...prev, dataScale: value }))}
              state={state}
            />
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex w-full items-center justify-between">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 0 || isSeeding}>
              Quay lại
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSeeding}>
                Hủy
              </Button>
              <Button onClick={nextStep} disabled={isSeeding}>
                {currentStep === totalSteps - 1 ? 'Bắt đầu Seed' : 'Tiếp tục'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function orderModulesByDependencies(
  modules: string[],
  moduleMap: Map<string, { dependencyType?: string; dependencies?: string[]; enabled: boolean }>
) {
  const ordered: string[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (moduleKey: string) => {
    if (visited.has(moduleKey)) {
      return;
    }
    if (visiting.has(moduleKey)) {
      return;
    }
    visiting.add(moduleKey);
    const module = moduleMap.get(moduleKey);
    const dependencies = module?.dependencies ?? [];
    if ((module?.dependencyType ?? 'all') === 'all') {
      for (const dependency of dependencies) {
        if (modules.includes(dependency) || moduleMap.get(dependency)?.enabled) {
          visit(dependency);
        }
      }
    }
    visiting.delete(moduleKey);
    visited.add(moduleKey);
    if (modules.includes(moduleKey)) {
      ordered.push(moduleKey);
    }
  };

  modules.forEach(visit);
  return ordered;
}
