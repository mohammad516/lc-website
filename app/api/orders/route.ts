import { NextResponse } from 'next/server';
import { getDb } from '@/libs/mongodb';

export const revalidate = 0; // No caching for orders

// Helper function to generate order number
// Format: ORD-YYYYMMDD-XXXX
async function generateOrderNumber(db: any) {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  
  // Count orders created today
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  
  const ordersCollection = db.collection('Order');
  const todayOrders = await ordersCollection.countDocuments({
    createdAt: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });
  
  const sequence = String(todayOrders + 1).padStart(4, '0');
  const orderNumber = `ORD-${dateStr}-${sequence}`;
  
  // Check if order number already exists (handle race conditions)
  const existing = await ordersCollection.findOne({ orderNumber });
  if (existing) {
    // If collision, increment and try again
    const newSequence = String(todayOrders + 2).padStart(4, '0');
    return `ORD-${dateStr}-${newSequence}`;
  }
  
  return orderNumber;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      country,
      governorate,
      district,
      city,
      streetName,
      buildingName,
      items,
      subtotal,
      shipping,
      total,
      paymentMethod
    } = body;

    // Validate required fields
    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { 
          error: 'Customer name and phone are required' 
        },
        { status: 400 }
      );
    }

    if (!country || !governorate || !district || !city || !streetName) {
      return NextResponse.json(
        { 
          error: 'All delivery address fields are required' 
        },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { 
          error: 'Order must contain at least one item' 
        },
        { status: 400 }
      );
    }

    if (subtotal === undefined || shipping === undefined || total === undefined) {
      return NextResponse.json(
        { 
          error: 'Subtotal, shipping, and total are required' 
        },
        { status: 400 }
      );
    }

    // Validate and transform items
    const transformedItems = items.map((item: any) => {
      if (!item.id || !item.name || !item.quantity || item.price === undefined) {
        throw new Error('Each item must have id (productId), name, quantity, and price');
      }

      return {
        productId: item.id, // Cart uses 'id', Order schema uses 'productId'
        name: item.name,
        variant: item.variant || null,
        quantity: item.quantity,
        price: item.price
      };
    });

    // Get database connection
    const db = await getDb();
    const ordersCollection = db.collection('Order');

    // Generate unique order number
    const orderNumber = await generateOrderNumber(db);

    // Create order document
    const orderData = {
      orderNumber,
      status: 'PENDING',
      customerName,
      customerPhone,
      country,
      governorate,
      district,
      city,
      streetName,
      buildingName: buildingName || null,
      items: transformedItems,
      subtotal: parseFloat(subtotal),
      shipping: parseFloat(shipping),
      total: parseFloat(total),
      paymentMethod: paymentMethod || 'Cash on Delivery',
      createdAt: new Date(),
      updatedAt: new Date(),
      deliveredAt: null
    };

    // Insert order into database
    const result = await ordersCollection.insertOne(orderData);

    if (!result.insertedId) {
      throw new Error('Failed to create order');
    }

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      orderId: result.insertedId.toString(),
      orderNumber: orderNumber
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

