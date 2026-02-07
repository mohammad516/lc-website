import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import { getDb } from "@/libs/mongodb";
import { isSaleActive, getDisplayPrice } from "@/libs/productUtils";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const db = await getDb();
    const collection = db.collection('Product');
    const product = await collection.findOne({ slug });

    if (!product) {
      return {
        title: "Product Not Found",
      };
    }

    const firstImage = product.images && product.images.length > 0
      ? product.images[0]
      : '/placeholder.svg';

    return {
      title: `${product.title} | MAZE`,
      description: product.description || '',
      openGraph: {
        title: product.title,
        description: product.description || '',
        images: [firstImage],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: "Product | MAZE",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  try {
    const db = await getDb();
    const collection = db.collection('Product');
    const product = await collection.findOne({ slug });

    if (!product) {
      notFound();
    }

    // Check if sale is still active (not expired)
    const saleActive = isSaleActive({
      enableSale: product.enableSale,
      salePrice: product.salePrice,
      saleEndDate: product.saleEndDate,
    });

    // Get display price (salePrice if active, otherwise regular price)
    const displayPrice = getDisplayPrice({
      price: product.price,
      enableSale: product.enableSale,
      salePrice: product.salePrice,
      saleEndDate: product.saleEndDate,
    });

    // Transform product data
    const transformedProduct = {
      id: product._id.toString(),
      sku: product.slug.toUpperCase().replace(/-/g, '-') || `PROD-${product._id.toString().slice(-6)}`,
      title: product.title,
      price: displayPrice,
      originalPrice: product.price,
      salePrice: product.salePrice,
      enableSale: saleActive, // Return effective sale status (false if expired)
      description: product.description || '',
      images: product.images || [],
      image: product.images && product.images.length > 0 ? product.images[0] : '/placeholder.svg',
      options: product.length && product.length.length > 0
        ? { length: product.length }
        : undefined,
      stock: product.stock || 0,
    };

    return (
      <div className="min-h-screen flex flex-col bg-[#f7f5f2]">
        <Navbar />
        <main className="flex-1 pt-24 md:pt-28 lg:pt-32">
          <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[60%_40%] lg:gap-12">
              {/* Left Column: Product Images */}
              <ProductGallery images={transformedProduct.images} />

              {/* Right Column: Product Details */}
              <ProductInfo product={{
                id: transformedProduct.id,
                sku: transformedProduct.sku,
                title: transformedProduct.title,
                price: transformedProduct.price,
                originalPrice: transformedProduct.originalPrice,
                salePrice: transformedProduct.salePrice,
                enableSale: transformedProduct.enableSale,
                description: transformedProduct.description,
                benefits: product.benefits || [],
                ingredients: product.ingredients || undefined,
                howtouse: product.howtouse || undefined,
                image: transformedProduct.image,
                options: transformedProduct.options,
                stock: transformedProduct.stock,
              }} />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('Error fetching product:', error);
    notFound();
  }
}

