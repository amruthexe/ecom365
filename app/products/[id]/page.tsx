"use client";

import { IKImage } from "imagekitio-next";
import {
  IProduct,
  ImageVariant,
  IMAGE_VARIANTS,
  ImageVariantType,
} from "@/models/Product";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { useNotification } from "@/app/components/Notification";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api-client";
import CheckoutForm from "@/app/components/CheckoutForm";

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const { showNotification } = useNotification();
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchProduct = async () => {
      const id = params?.id;

      if (!id) {
        setError("Product ID is missing");
        setLoading(false);
        return;
      }

      try {
        const data = await apiClient.getProduct(id.toString());
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params?.id]);

  const handlePurchase = async (variant: ImageVariant, shippingAddress: any) => {
    console.log('handlePurchase called', { variant, shippingAddress });
    if (!session) {
      showNotification("Please login to make a purchase", "error");
      router.push("/login");
      return;
    }

    if (!product?._id) {
      showNotification("Invalid product", "error");
      return;
    }

    try {
      console.log('Creating order...');
      const { orderId, amount } = await apiClient.createOrder({
        productId: product._id,
        variant,
        quantity,
        shippingAddress,
      });
      console.log('Order created', { orderId, amount });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: "INR",
        name: "vevvion Shop",
        description: `${product.name} - ${variant.type} Version x${quantity}`,
        order_id: orderId,
        handler: function () {
          showNotification("Payment successful!", "success");
          router.push("/orders");
        },
        prefill: {
          email: shippingAddress.email,
          contact: shippingAddress.phone,
          name: shippingAddress.fullName,
        },
      };

      if (!(window as any).Razorpay) {
        console.error('Razorpay script not loaded');
        showNotification('Razorpay script not loaded', 'error');
        return;
      }
      console.log('Opening Razorpay...', options);
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error in handlePurchase:', error);
      showNotification(
        error instanceof Error ? error.message : "Payment failed",
        "error"
      );
    }
  };

  const getTransformation = (variantType: ImageVariantType) => {
    const variant = IMAGE_VARIANTS[variantType];
    return [
      {
        width: variant.dimensions.width.toString(),
        height: variant.dimensions.height.toString(),
        cropMode: "extract",
        focus: "center",
        quality: "60",
      },
    ];
  };

  // Calculate total price whenever quantity or variant changes
  const calculateTotalPrice = (variant: ImageVariant) => {
    return variant.price * quantity;
  };

  if (loading)
    return (
      <div className="min-h-[70vh] flex justify-center items-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );

  if (error || !product)
    return (
      <div className="alert alert-error max-w-md mx-auto my-8">
        <AlertCircle className="w-6 h-6" />
        <span>{error || "Product not found"}</span>
      </div>
    );

  const defaultVariant = product.variants[0];
  const totalPrice = calculateTotalPrice(defaultVariant);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="space-y-4">
          <div
            className="relative rounded-lg overflow-hidden"
            style={{
              aspectRatio: defaultVariant
                ? `${IMAGE_VARIANTS[defaultVariant.type].dimensions.width} / ${IMAGE_VARIANTS[defaultVariant.type].dimensions.height}`
                : "1 / 1",
            }}
          >
            <IKImage
              urlEndpoint={process.env.NEXT_PUBLIC_URL_ENDPOINT}
              path={product.imageUrl}
              alt={product.name}
              transformation={getTransformation(defaultVariant.type)}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>

          <div className="text-sm text-center text-base-content/70">
            Preview:{" "}
            {IMAGE_VARIANTS[
              defaultVariant.type.toUpperCase() as keyof typeof IMAGE_VARIANTS
            ].dimensions.width}{" "}
            x{" "}
            {IMAGE_VARIANTS[
              defaultVariant.type.toUpperCase() as keyof typeof IMAGE_VARIANTS
            ].dimensions.height}
            px
          </div>
        </div>

        {/* Product Details Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
            <p className="text-base-content/80 text-lg">{product.description}</p>
          </div>

          {/* Quantity & Buy Now */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setQuantity((prev) => Math.max(prev - 1, 1))}
                >
                  −
                </button>
                <span className="text-xl font-medium w-8 text-center">
                  {quantity}
                </span>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setQuantity((prev) => prev + 1)}
                >
                  +
                </button>
              </div>

              <div className="text-right">
                <div className="text-sm text-base-content/70">Total Price</div>
                <span className="text-2xl font-bold">
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>

              <button
                className="btn btn-primary btn-lg w-full"
                onClick={() => setShowCheckout(true)}
              >
                Buy Now
              </button>

              {showCheckout && (
                <CheckoutForm
                  totalAmount={totalPrice}
                  onSubmit={(shippingAddress) => {
                    handlePurchase(defaultVariant, shippingAddress);
                    setShowCheckout(false);
                  }}
                  onCancel={() => setShowCheckout(false)}
                />
              )}
            </div>

            <div className="text-sm text-base-content/60">
              License: {defaultVariant.license} • Size:{" "}
              {
                IMAGE_VARIANTS[
                  defaultVariant.type.toUpperCase() as keyof typeof IMAGE_VARIANTS
                ].dimensions.width
              }
              x
              {
                IMAGE_VARIANTS[
                  defaultVariant.type.toUpperCase() as keyof typeof IMAGE_VARIANTS
                ].dimensions.height
              }
              px
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
