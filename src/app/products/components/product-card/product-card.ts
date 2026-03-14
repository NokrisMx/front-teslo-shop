import { SlicePipe } from '@angular/common';
import { Product } from './../../interfaces/product-interface';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductImagePipe } from '@products/pipes/product-image-pipe';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, SlicePipe, ProductImagePipe],
  templateUrl: './product-card.html',
})
export class ProductCard {
  product = input.required<Product>();

  imageUrl = computed(() => {
    return `http://localhost:3000/api/files/product/${this.product().images[0]}`;
  });
}
