import { inngest } from '@/config/inngest';
import Product from '@/models/Product';
import User from '@/models/User';
import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { address, items } = await request.json();

    if (!address || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid date' });
    }

    // calculate items using items
    // ...existing code...
    // calculate total amount
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) continue;
      amount += product.offerPrice * item.quantity;
    }
    // ...existing code...

    // ...existing code...
    await inngest.send({
      name: 'order/created',
      data: {
        userId,
        address: typeof address === 'string' ? address : String(address),
        items,
        amount: Number(amount + Math.floor(amount * 0.02)),
        date: Date.now(),
        paymentType: 'COD',
      },
    });
    // ...existing code...
    // clear user cart
    const user = await User.findById(userId);
    user.cartItems = {};
    await user.save();

    return NextResponse.json({ success: true, message: 'Order Placed' });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
