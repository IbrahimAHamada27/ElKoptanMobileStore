import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart {
  cartService = inject(CartService);

  checkoutWhatsApp() {
    if (this.cartService.cartItems().length === 0) return;

    const phoneNumber = "201012345678"; // Placeholder
    
    let message = `مرحباً القبطان، أود طلب:\n`;
    this.cartService.cartItems().forEach(item => {
      const price = item.product.discountPrice || item.product.price;
      message += `- ${item.product.name} (الكمية: ${item.quantity}) - السعر: ${price * item.quantity} جنيه\n`;
    });
    message += `الإجمالي: ${this.cartService.totalPrice()} جنيه`;
    
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  }
}
