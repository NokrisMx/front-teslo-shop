import { Component, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '@products/services/products-service';
import { map } from 'rxjs';
import { ProductCard } from '@products/components/product-card/product-card';
import { Pagination } from '@shared/components/pagination/pagination';
import { PaginationService } from '@shared/components/pagination/pagination-service';

@Component({
  selector: 'app-gender-page',
  imports: [ProductCard, Pagination],
  templateUrl: './gender-page.html',
})
export class GenderPage {
  route = inject(ActivatedRoute);
  productService = inject(ProductsService);
  paginationService = inject(PaginationService);

  gender = toSignal(this.route.params.pipe(map(({ gender }) => gender)));

  productResource = rxResource({
    params: () => ({ gender: this.gender(), page: this.paginationService.currentPage() - 1 }),
    stream: ({ params }) => {
      return this.productService.getProducts({
        limit: 9,
        offset: params.page * 9,
        gender: params.gender,
      });
    },
  });
}
