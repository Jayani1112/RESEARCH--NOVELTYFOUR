import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [acceptedRecommendations, setAcceptedRecommendations] = useState([]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product._id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === product._id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [...prevItems, { productId: product._id, name: product.name, price: product.price, qty: 1 }];
    });
  };

  const increaseQty = (productId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decreaseQty = (productId) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.productId === productId ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    setAcceptedRecommendations([]);
  };

  const addAcceptedRecommendation = (productId) => {
    if (!acceptedRecommendations.includes(productId)) {
      setAcceptedRecommendations([...acceptedRecommendations, productId]);
    }
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQty,
        decreaseQty,
        removeFromCart,
        clearCart,
        cartTotal,
        acceptedRecommendations,
        addAcceptedRecommendation,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
