import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductTable } from '@products/components/product-table/product-table';
import { ProductsService } from '@products/services/products-service';
import { PaginationService } from '@shared/components/pagination/pagination-service';
import { Pagination } from '@shared/components/pagination/pagination';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-products-admin-page',
  imports: [ProductTable, Pagination, RouterLink],
  templateUrl: './products-admin-page.html',
})
export class ProductsAdminPage {
  productService = inject(ProductsService);
  paginationService = inject(PaginationService);
  productsPerPage = signal<number>(10);

  productResource = rxResource({
    params: () => ({
      page: this.paginationService.currentPage() - 1,
      limit: this.productsPerPage(),
    }),
    stream: ({ params }) => {
      return this.productService.getProducts({
        limit: params.limit,
        offset: params.page * 9,
        gender: '',
      });
    },
  });
}
