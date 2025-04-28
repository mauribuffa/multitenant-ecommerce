import { useCartStore } from "../store/use-cart-store";

export const useCart = (tenantSlug: string) => {
  const {
    clearAllCarts,
    addProduct,
    removeProduct,
    clearCart,
    getCartByTenant,
  } = useCartStore();

  const productIds = getCartByTenant(tenantSlug);

  const toggleProduct = (productId: string) => {
    if (productIds.includes(productId)) {
      removeProduct(tenantSlug, productId);
    } else {
      addProduct(tenantSlug, productId);
    }
  };

  const isProductInCart = (productId: string) => {
    return productIds.includes(productId);
  };

  const clearTenantCart = () => {
    clearCart(tenantSlug);
  };

  return {
    addProduct: (productId: string) => addProduct(tenantSlug, productId),
    clearAllCarts,
    clearCart: () => clearTenantCart(),
    isProductInCart,
    productIds,
    removeProduct: (productId: string) => removeProduct(tenantSlug, productId),
    toggleProduct,
    totalItems: productIds.length,
  };
};
