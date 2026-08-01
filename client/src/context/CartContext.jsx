import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [cartLoading, setCartLoading] = useState(false);

  // Fetch cart from server whenever authentication status changes
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], totalPrice: 0 });
      return;
    }
    try {
      const { data } = await api.get('/cart');
      setCart(data.cart);
    } catch {
      setCart({ items: [], totalPrice: 0 });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    setCartLoading(true);
    try {
      const { data } = await api.post('/cart', { productId, quantity });
      setCart(data.cart);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add to cart',
      };
    } finally {
      setCartLoading(false);
    }
  }, []);

  const updateCartItem = useCallback(async (productId, quantity) => {
    setCartLoading(true);
    try {
      const { data } = await api.put(`/cart/${productId}`, { quantity });
      setCart(data.cart);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update cart',
      };
    } finally {
      setCartLoading(false);
    }
  }, []);

  const removeCartItem = useCallback(async (productId) => {
    setCartLoading(true);
    try {
      const { data } = await api.delete(`/cart/${productId}`);
      setCart(data.cart);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove item',
      };
    } finally {
      setCartLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    setCartLoading(true);
    try {
      await api.delete('/cart');
      setCart({ items: [], totalPrice: 0 });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to clear cart',
      };
    } finally {
      setCartLoading(false);
    }
  }, []);

  const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{ cart, cartLoading, cartItemCount, fetchCart, addToCart, updateCartItem, removeCartItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};
