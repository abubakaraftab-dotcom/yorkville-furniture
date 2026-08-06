"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { CartItem, Product } from "@/types/product";
import { useProvince } from "@/context/ProvinceContext";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, sizeLabel: string, colourName: string, qty: number) => void;
  removeFromCart: (productId: string, sizeLabel: string, colourName: string) => void;
  updateQuantity: (productId: string, sizeLabel: string, colourName: string, qty: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

  export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedProvince } = useProvince();

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("yorkville-furniture-cart");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cart data", e);
      }
    }
    setIsLoading(false);
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("yorkville-furniture-cart", JSON.stringify(newCart));
  };

  const addToCart = (product: Product, sizeLabel: string, colourName: string, qty: number) => {
    const provinceCode = selectedProvince?.code || "ON";
    const basePrice = product.priceByProvince[provinceCode as keyof typeof product.priceByProvince] || 0;
    const size = product.sizes.find((s) => s.label === sizeLabel);
    const priceAdjustment = size?.priceAdjustment ?? 0;
    const itemPrice = basePrice + priceAdjustment;

    const existingIdx = cart.findIndex(
      (item) =>
        item.productId === product.id &&
        item.selectedSize === sizeLabel &&
        item.selectedColour === colourName
    );

    const newCart = [...cart];
    if (existingIdx > -1) {
      newCart[existingIdx].quantity += qty;
    } else {
      newCart.push({
        productId: product.id,
        slug: product.slug,
        title: product.title,
        price: itemPrice,
        quantity: qty,
        selectedSize: sizeLabel,
        selectedColour: colourName,
        image: product.images[0] || "",
      });
    }
    saveCart(newCart);
  };

  const removeFromCart = (productId: string, sizeLabel: string, colourName: string) => {
    const newCart = cart.filter(
      (item) =>
        !(
          item.productId === productId &&
          item.selectedSize === sizeLabel &&
          item.selectedColour === colourName
        )
    );
    saveCart(newCart);
  };

  const updateQuantity = (productId: string, sizeLabel: string, colourName: string, qty: number) => {
    const newCart = cart.map((item) => {
      if (
        item.productId === productId &&
        item.selectedSize === sizeLabel &&
        item.selectedColour === colourName
      ) {
        return { ...item, quantity: qty };
      }
      return item;
    });
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
