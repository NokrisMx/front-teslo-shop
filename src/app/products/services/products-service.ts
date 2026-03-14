import { User } from './../../auth/interfaces/user-interface';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Gender, Product, ProductsResponse } from '@products/interfaces/product-interface';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.baseUrl;

interface Options {
  limit: number;
  offset?: number;
  gender?: string;
}

const emptyProduct: Product = {
  id: 'new',
  title: '',
  price: 0,
  description: '',
  slug: '',
  stock: 0,
  sizes: [],
  gender: Gender.Men,
  tags: '',
  images: [],
  user: {} as User,
};

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private productsCache = new Map<string, ProductsResponse>();
  private productBySlugCache = new Map<string, Product>();

  getProducts(options: Options): Observable<ProductsResponse> {
    const { limit = 9, offset = 0, gender = '' } = options;
    const key = `${limit}-${offset}-${gender}`;
    if (this.productsCache.has(key)) {
      return of(this.productsCache.get(key)!);
    }

    return this.http
      .get<ProductsResponse>(`${baseUrl}/products`, { params: { limit, offset, gender } })
      .pipe(tap((resp) => this.productsCache.set(key, resp)));
  }

  getProductByIdSlug(idSlug: string): Observable<Product> {
    if (this.productBySlugCache.has(idSlug)) {
      return of(this.productBySlugCache.get(idSlug)!);
    }

    return this.http
      .get<Product>(`${baseUrl}/products/${idSlug}`)
      .pipe(tap((product) => this.productBySlugCache.set(idSlug, product)));
  }

  getProductById(id: string): Observable<Product> {
    if (id === 'new') {
      return of(emptyProduct);
    }

    if (this.productBySlugCache.has(id)) {
      return of(this.productBySlugCache.get(id)!);
    }

    return this.http
      .get<Product>(`${baseUrl}/products/${id}`)
      .pipe(tap((product) => this.productBySlugCache.set(id, product)));
  }

  updateProduct(
    id: string,
    productLike: Partial<Product>,
    imageFileList?: FileList,
  ): Observable<Product> {
    const currentImages = productLike.images ?? [];

    return this.uploadImages(imageFileList).pipe(
      map((imageNames) => ({
        ...productLike,
        images: [...currentImages, ...imageNames],
      })),
      switchMap((updatedProduct) =>
        this.http.patch<Product>(`${baseUrl}/products/${id}`, updatedProduct),
      ),
      tap((product) => this.updateProductCache(product)),
    );
  }

  createProduct(productLike: Partial<Product>, imageFileList?: FileList): Observable<Product> {
    return this.http
      .post<Product>(`${baseUrl}/products`, productLike)
      .pipe(tap((product) => this.updateProductCache(product)));
  }

  updateProductCache(product: Product) {
    const productId = product.id;

    this.productBySlugCache.set(productId, product);

    this.productsCache.forEach((resp) => {
      resp.products = resp.products.map((currentProduct) =>
        currentProduct.id === productId ? product : currentProduct,
      );
    });
    console.log('Caché actualizado');
  }

  uploadImages(images?: FileList): Observable<string[]> {
    if (!images) return of([]);
    const uploadObservables = Array.from(images).map((imageFile) => this.uploadImage(imageFile));

    return forkJoin(uploadObservables).pipe(tap((imageNames) => console.log({ imageNames })));
  }

  uploadImage(imageFile: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', imageFile);

    return this.http
      .post<{ fileName: string }>(`${baseUrl}/files/product`, formData)
      .pipe(map((resp) => resp.fileName));
  }
}
