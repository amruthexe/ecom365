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

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // Delay in milliseconds (2 seconds)

async function connectWithRetry(retries: number = 0) {
  try {
    await connectToDatabase();
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.log(`Retrying connection... attempt ${retries + 1}`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      await connectWithRetry(retries + 1);
    } else {
      throw new Error("Failed to connect to the database after several attempts.");
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const body = await req.json();
    const { productId, variant, quantity = 1, shippingAddress } = body;

    if (!productId || !variant?.price || !variant?.type || !variant?.license || !shippingAddress) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 });
    }

    await connectWithRetry(); // Retry connection if needed

    // Calculate total amount
    const totalAmount = variant.price * quantity;
    const amountInPaise = Math.round(totalAmount * 100);

    // Create order in Razorpay
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        productId: productId.toString(),
        quantity: quantity.toString(),
      },
    }).catch((err) => {
      console.error("Error while creating Razorpay order:", err);
      throw new Error("Failed to create Razorpay order");
    });

    // Save order in MongoDB
    const newOrder = await Order.create({
      userId: session.user.id,
      productId,
      variant,
      quantity,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      status: "pending",
      shippingAddress,
    });

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: razorpayOrder.currency,
      dbOrderId: newOrder._id,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
