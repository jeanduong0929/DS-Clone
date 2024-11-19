import { ProductImage } from "./product-image";

export interface Product {
  id: string;
  name: string;
  description: null;
  price: string;
  createdAt: string;
  updatedAt: string;
  productImages: ProductImage[];
}
