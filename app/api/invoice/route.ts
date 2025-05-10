import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import { renderToBuffer } from "@react-pdf/renderer";
import {
  Document,
  Page,
  Text,
  StyleSheet,
  View,
  Image,
} from "@react-pdf/renderer";
import React from "react";

type OrderType = {
  _id: string;
  userId: string;
  productId: string;
  variant: {
    price: number;
    type: string;
    license: string;
  };
  quantity: number;
  amount: number;
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 20,
    alignSelf: "center",
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontWeight: "bold",
    width: "40%",
  },
  value: {
    width: "60%",
  },
  section: {
    marginBottom: 18,
  },
  addressSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  total: {
    marginTop: 30,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
  },
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return new Response("Missing orderId", { status: 400 });
  }

  await connectToDatabase();
  const order = (await Order.findById(orderId).lean()) as OrderType | null;

  if (!order) {
    return new Response("Order not found", { status: 404 });
  }

  try {
    const totalPrice = order.amount;

    const elements = [
      React.createElement(Image, {
        key: "logo",
        style: styles.logo,
        src: "https://raw.githubusercontent.com/amruthexe/Talent-trek/main/public/image.png", // Replace with deployed URL in prod
      }),

      React.createElement(Text, {
        key: "heading",
        style: styles.heading,
      }, "Invoice"),

      // Order Info Table
      React.createElement(View, { key: "order-table", style: styles.section }, [
        React.createElement(View, { key: "order-id", style: styles.tableRow }, [
          React.createElement(Text, { style: styles.label }, "Order ID:"),
          React.createElement(Text, { style: styles.value }, String(order._id)),
        ]),
        React.createElement(View, { key: "user-id", style: styles.tableRow }, [
          React.createElement(Text, { style: styles.label }, "User ID:"),
          React.createElement(Text, { style: styles.value }, String(order.userId)),
        ]),
        React.createElement(View, { key: "product-id", style: styles.tableRow }, [
          React.createElement(Text, { style: styles.label }, "Product ID:"),
          React.createElement(Text, { style: styles.value }, String(order.productId)),
        ]),
        React.createElement(View, { key: "amount", style: styles.tableRow }, [
          React.createElement(Text, { style: styles.label }, "Amount:"),
          React.createElement(Text, { style: styles.value }, `INR ${order.amount.toFixed(2)}`),
        ]),
        React.createElement(View, { key: "quantity", style: styles.tableRow }, [
          React.createElement(Text, { style: styles.label }, "Quantity:"),
          React.createElement(Text, { style: styles.value }, String(order.quantity)),
        ]),
        React.createElement(View, { key: "payment", style: styles.tableRow }, [
          React.createElement(Text, { style: styles.label }, "Payment From:"),
          React.createElement(Text, { style: styles.value }, "RazorPay"),
        ]),React.createElement(View, { key: "gst", style: styles.tableRow }, [
          React.createElement(Text, { style: styles.label }, "GST Number:"),
          React.createElement(Text, { style: styles.value }, "29AAICV6290Q1Z8"),
        ])
      ]),

      // Centered Shipping Address
      React.createElement(View, { key: "address", style: styles.addressSection }, [
        React.createElement(Text, { key: "addr-heading", style: styles.label }, "Shipping Address"),
        React.createElement(Text, { key: "fullName", style: styles.value }, `Name: ${order.shippingAddress.fullName}`),
        React.createElement(Text, { key: "email", style: styles.value }, `Email: ${order.shippingAddress.email}`),
        React.createElement(Text, { key: "phone", style: styles.value }, `Phone: ${order.shippingAddress.phone}`),
        React.createElement(Text, { key: "address", style: styles.value }, `Address: ${order.shippingAddress.address}`),
        React.createElement(Text, { key: "city", style: styles.value }, `City: ${order.shippingAddress.city}`),
        React.createElement(Text, { key: "state", style: styles.value }, `State: ${order.shippingAddress.state}`),
        React.createElement(Text, { key: "country", style: styles.value }, `Country: ${order.shippingAddress.country}`),
        React.createElement(Text, { key: "zipCode", style: styles.value }, `ZIP Code: ${order.shippingAddress.zipCode}`),
      ]),

      React.createElement(Text, {
        key: "total",
        style: styles.total,
      }, `Total Price: INR ${totalPrice.toFixed(2)}`),
    ];

    const document = React.createElement(
      Document,
      null,
      React.createElement(Page, { size: "A4", style: styles.page }, elements)
    );

    const pdfBuffer = await renderToBuffer(document);

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${order._id}.pdf`,
      },
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    return new Response("Failed to generate invoice PDF", { status: 500 });
  }
}
