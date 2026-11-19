interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  sound?: 'default';
  data?: Record<string, string>;
}

export async function sendExpoPushNotification(message: ExpoPushMessage): Promise<boolean> {
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      return false;
    }

    const payload = (await response.json()) as { data?: { status?: string }[] };
    return payload.data?.[0]?.status === 'ok';
  } catch {
    return false;
  }
}

export async function sendPriceDropPush(
  token: string,
  productName: string,
  price: number,
  storeName: string,
): Promise<boolean> {
  return sendExpoPushNotification({
    to: token,
    title: 'Fiyat Düştü!',
    body: `${productName} ${storeName}'da ${price.toFixed(2)} ₺'ye düştü.`,
    sound: 'default',
    data: { type: 'price_drop' },
  });
}

export async function sendExpiryPush(
  token: string,
  itemName: string,
  daysLeft: number,
): Promise<boolean> {
  const body =
    daysLeft <= 0
      ? `${itemName} son kullanma tarihi geçti. Hemen kullanın!`
      : `${itemName} ${daysLeft} gün içinde son kullanma tarihine ulaşacak.`;

  return sendExpoPushNotification({
    to: token,
    title: 'Dolap Hatırlatması',
    body,
    sound: 'default',
    data: { type: 'pantry_expiry' },
  });
}
