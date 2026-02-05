'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import type { Id } from '@/convex/_generated/dataModel';
import { api } from '@/convex/_generated/api';
import { useCustomerAuth } from '@/app/(site)/auth/context';

type CartItem = {
  _id: Id<'cartItems'>;
  cartId: Id<'carts'>;
  price: number;
  productId: Id<'products'>;
  productImage?: string;
  productName: string;
  quantity: number;
  subtotal: number;
  variantId?: Id<'productVariants'>;
};

type Cart = {
  _id: Id<'carts'>;
  customerId?: Id<'customers'>;
  expiresAt?: number;
  itemsCount: number;
  note?: string;
  status: 'Active' | 'Converted' | 'Abandoned';
  totalAmount: number;
};

type CartContextValue = {
  cart: Cart | null;
  items: CartItem[];
  itemsCount: number;
  totalAmount: number;
  isLoading: boolean;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (productId: Id<'products'>, quantity?: number, variantId?: Id<'productVariants'>) => Promise<void>;
  removeItem: (itemId: Id<'cartItems'>) => Promise<void>;
  updateQuantity: (itemId: Id<'cartItems'>, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  updateNote: (note?: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { customer, isAuthenticated, openLoginModal } = useCustomerAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const cart = useQuery(
    api.cart.getByCustomer,
    isAuthenticated && customer ? { customerId: customer.id as Id<'customers'> } : 'skip'
  );

  const items = useQuery(
    api.cart.listCartItems,
    cart?._id ? { cartId: cart._id } : 'skip'
  );

  const createCart = useMutation(api.cart.create);
  const addItemMutation = useMutation(api.cart.addItem);
  const removeItemMutation = useMutation(api.cart.removeItem);
  const updateQuantityMutation = useMutation(api.cart.updateItemQuantity);
  const clearCartMutation = useMutation(api.cart.clearCart);
  const updateNoteMutation = useMutation(api.cart.updateNote);

  const isLoading = Boolean(isAuthenticated && (cart === undefined || (cart && items === undefined)));

  const ensureAuthenticated = useCallback(() => {
    if (!isAuthenticated || !customer) {
      openLoginModal();
      return false;
    }
    return true;
  }, [customer, isAuthenticated, openLoginModal]);

  const addItem = useCallback(async (productId: Id<'products'>, quantity = 1, variantId?: Id<'productVariants'>) => {
    if (!ensureAuthenticated()) {
      return;
    }

    if (cart === undefined) {
      return;
    }

    const activeCartId = cart?._id ?? await createCart({ customerId: customer!.id as Id<'customers'> });
    await addItemMutation({ cartId: activeCartId, productId, quantity, variantId });
  }, [addItemMutation, cart, createCart, customer, ensureAuthenticated]);

  const removeItem = useCallback(async (itemId: Id<'cartItems'>) => {
    if (!ensureAuthenticated()) {
      return;
    }
    await removeItemMutation({ itemId });
  }, [ensureAuthenticated, removeItemMutation]);

  const updateQuantity = useCallback(async (itemId: Id<'cartItems'>, quantity: number) => {
    if (!ensureAuthenticated()) {
      return;
    }
    await updateQuantityMutation({ itemId, quantity });
  }, [ensureAuthenticated, updateQuantityMutation]);

  const clearCart = useCallback(async () => {
    if (!ensureAuthenticated()) {
      return;
    }
    if (!cart?._id) {
      return;
    }
    await clearCartMutation({ cartId: cart._id });
  }, [cart, clearCartMutation, ensureAuthenticated]);

  const updateNote = useCallback(async (note?: string) => {
    if (!ensureAuthenticated()) {
      return;
    }
    if (!cart?._id) {
      return;
    }
    await updateNoteMutation({ id: cart._id, note });
  }, [cart, ensureAuthenticated, updateNoteMutation]);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const value = useMemo<CartContextValue>(() => ({
    cart: cart ?? null,
    items: items ?? [],
    itemsCount: cart?.itemsCount ?? 0,
    totalAmount: cart?.totalAmount ?? 0,
    isLoading,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    updateNote,
  }), [addItem, cart, clearCart, closeDrawer, isDrawerOpen, isLoading, items, openDrawer, removeItem, updateNote, updateQuantity]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
