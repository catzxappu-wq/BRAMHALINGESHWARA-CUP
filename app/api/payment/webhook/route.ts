import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { generateUniqueRegistrationCode } from '@/lib/codeGenerator';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ message: 'Missing signature' }, { status: 400 });
    }

    if (!verifyWebhookSignature(rawBody, signature)) {
      console.warn('Webhook signature verification failed');
      return NextResponse.json({ message: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventId = payload.event_id || req.headers.get('x-razorpay-event-id');
    const eventType = payload.event;

    // Check idempotency: If event already processed, return 200 OK
    if (eventId) {
      const existing = await prisma.webhookEvent.findUnique({
        where: { gatewayEventId: eventId },
      });
      if (existing && existing.processingStatus === 'processed') {
        return NextResponse.json({ message: 'Already processed' }, { status: 200 });
      }
    }

    // Save webhook event as pending
    const webhookRecord = await prisma.webhookEvent.create({
      data: {
        gatewayEventId: eventId || null,
        eventType: eventType || 'unknown',
        payload: rawBody,
        processingStatus: 'pending',
      },
    });

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        const payment = await prisma.payment.findUnique({
          where: { gatewayOrderId: orderId },
          include: { player: true },
        });

        if (payment && payment.player && payment.player.paymentStatus !== 'paid') {
          await prisma.$transaction(async (tx) => {
            const uniqueCode = await generateUniqueRegistrationCode(tx);

            await tx.payment.update({
              where: { id: payment.id },
              data: {
                gatewayPaymentId: paymentId || payment.gatewayPaymentId,
                paymentStatus: 'captured',
                paymentSignatureVerified: true,
              },
            });

            await tx.player.update({
              where: { id: payment.player.id },
              data: {
                paymentStatus: 'paid',
                registrationStatus: 'completed',
                registrationCode: uniqueCode,
              },
            });
          });
        }
      }
    }

    // Update webhook record as processed
    await prisma.webhookEvent.update({
      where: { id: webhookRecord.id },
      data: {
        processingStatus: 'processed',
        processedAt: new Date(),
      },
    });

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
