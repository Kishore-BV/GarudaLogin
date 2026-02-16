
interface AttendanceData {
    Email: string;
    Role: string;
    Department: string;
    Name: string;
    ClockIn: string | null;
    ClockOut: string | null;
    Location: string;
    Date: string;
}

/**
 * Sends attendance data to the n8n webhook for database storage.
 * This is a fire-and-forget operation - errors are logged but don't block the UI.
 * @param data - The attendance data to send
 * @param type - 'checkin' or 'checkout' to determine which endpoint to use
 */
export async function sendAttendanceToWebhook(
    data: AttendanceData,
    type: 'checkin' | 'checkout'
): Promise<void> {
    // Use different endpoints for check-in and check-out
    const webhookUrl = type === 'checkout'
        ? 'https://n8n.kishoren8n.in/webhook-test/ClockOut'
        : 'https://n8n.kishoren8n.in/webhook-test/UserData';

    console.log(`🚀 Sending ${type} data to webhook:`, webhookUrl, data);

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        console.log('📡 Webhook response status:', response.status);

        if (!response.ok) {
            const responseText = await response.text();
            console.warn(`⚠️ ${type} webhook returned non-OK status:`, response.status, responseText);
        } else {
            const responseData = await response.text();
            console.log(`✅ ${type} data sent successfully to webhook. Response:`, responseData);
        }
    } catch (error) {
        console.error(`❌ Failed to send ${type} data to webhook:`, error);
        // Don't throw - we don't want to block the UI if the webhook fails
    }
}
