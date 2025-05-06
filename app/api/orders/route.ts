import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Razorpay from "razorpay";
import Order from "@/models/Order";
import { connectToDatabase } from "@/lib/db";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, variant, quantity = 1, shippingAddress } = await req.json();
    await connectToDatabase();

    // Calculate total amount based on quantity
    const totalAmount = variant.price * quantity;
    const amountInPaise = Math.round(totalAmount * 100);

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        productId: productId.toString(),
        quantity: quantity.toString(),
      },
    });

    const newOrder = await Order.create({
      userId: session.user.id,
      productId,
      variant,
      quantity,
      razorpayOrderId: order.id,
      amount: totalAmount,
      status: "pending",
      shippingAddress,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: amountInPaise,
      currency: order.currency,
      dbOrderId: newOrder._id,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
