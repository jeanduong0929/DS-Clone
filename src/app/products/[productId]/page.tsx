import React from "react";
import ProductPagez from "@/app/collections/all-products/products/[productId]/page";

interface ProductPageProps {
  params: {
    productId: string;
  };
}

const ProductPage = ({ params: { productId } }: ProductPageProps) => {
  return (
    <ProductPagez
      params={{
        productId,
      }}
    />
  );
};

export default ProductPage;
