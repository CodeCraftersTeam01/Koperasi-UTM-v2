import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getApiUrl, PLACEHOLDER_IMG } from '../utils/api';
import LazyImage from '../components/LazyImage';

const CartSidebar = () => {
  const navigate = useNavigate();
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQty,
    removeFromCart,
    cartTotal,
  } = useCart();

  const handleCheckout = () => {
    if (cart.length === 0) {
      window.Swal.fire({
        icon: 'warning',
        title: 'Keranjang Masih Kosong',
        text: 'Silakan tambahkan produk terlebih dahulu sebelum melanjutkan ke checkout.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#00754A'
      });
      return;
    }
    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      <div 
        id="cart-overlay" 
        className={`cart-overlay ${isCartOpen ? 'active' : ''}`}
        onClick={closeCart}
      ></div>
      <div 
        id="cart-sidebar" 
        className={`cart-sidebar ${isCartOpen ? 'active' : ''}`}
      >
        <div className="cart-header">
          <h3>Keranjang <span id="cart-count">({cart.length})</span></h3>
          <button className="cart-close" onClick={closeCart}><i className="fas fa-times"></i></button>
        </div>
        <div id="cart-items" className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <i className="fas fa-shopping-cart"></i>
              <h4>Keranjang Kosong</h4>
              <p>Belum ada produk yang ditambahkan.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item">
                <LazyImage
                  src={getApiUrl(item.gambar) || PLACEHOLDER_IMG}
                  alt={item.nama}
                  className="cart-item-img"
                  wrapperStyle={{ width: '60px', height: '60px' }}
                />
                <div className="cart-item-info">
                  <h4>{item.nama}</h4>
                  <div className="cart-item-price">Rp {item.harga.toLocaleString()}</div>
                  <div className="cart-item-qty">
                    <button onClick={() => updateQty(item.id, -1)} disabled={item.qty <= 1}><i className="fas fa-minus"></i></button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)}><i className="fas fa-plus"></i></button>
                  </div>
                </div>
                <button 
                  className="cart-item-remove" 
                  onClick={() => removeFromCart(item.id)}
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            ))
          )}
        </div>
        <div className="cart-footer">
          <div className="cart-total">
            <span>Total Pembayaran</span>
            <strong id="cart-total">Rp {cartTotal.toLocaleString()}</strong>
          </div>
          <button className="btn-primary" onClick={handleCheckout}>
            Lanjut ke Checkout
          </button>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
