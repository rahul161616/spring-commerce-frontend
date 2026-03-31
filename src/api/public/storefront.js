import { publicRequest } from './client';
import { PUBLIC_ENDPOINTS } from './endpoints';
import { mapProductPayload, mapProductsPayload, mapStorefrontPayload } from './mappers';
import { mockProductsContent, mockStorefrontContent } from './mockData';

export async function fetchStorefrontContent() {
  try {
    const response = await publicRequest(PUBLIC_ENDPOINTS.homepage);
    return mapStorefrontPayload(response || {});
  } catch (error) {
    return mapStorefrontPayload(mockStorefrontContent);
  }
}

export async function fetchPublicProducts() {
  try {
    const response = await publicRequest(PUBLIC_ENDPOINTS.products);
    return mapProductsPayload(response || []);
  } catch (error) {
    return mapProductsPayload(mockProductsContent);
  }
}

export async function fetchPublicProductBySlug(slug) {
  try {
    const response = await publicRequest(PUBLIC_ENDPOINTS.productBySlug(encodeURIComponent(slug)));
    return mapProductPayload(response || {});
  } catch (error) {
    const fallbackProduct = mockProductsContent.find((item) => item.slug === slug);
    return fallbackProduct ? mapProductPayload(fallbackProduct) : null;
  }
}
