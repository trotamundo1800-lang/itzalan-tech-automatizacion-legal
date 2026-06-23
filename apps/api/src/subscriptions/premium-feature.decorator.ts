import { SetMetadata } from '@nestjs/common';

export const PREMIUM_FEATURE_KEY = 'premium_feature_required';
export const PremiumFeature = () => SetMetadata(PREMIUM_FEATURE_KEY, true);
