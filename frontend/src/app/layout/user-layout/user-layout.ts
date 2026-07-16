import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-user-layout',
  imports: [RouterOutlet, RouterLink, CommonModule, Header, Footer],
  templateUrl: './user-layout.html'
})
export class UserLayout {
  cartService = inject(CartService);
}
