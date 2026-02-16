
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

interface AttendanceStatus {
    isClockedIn: boolean;
    clockInTime: string | null;
    date: string | null;
}

/**
 * Checks if a user is currently clocked in by querying the n8n backend.
 * This prevents duplicate clock-ins and shows the correct button on page load.
 * @param email - User's email address
 * @param date - Date to check (YYYY-MM-DD format)
 */
export async function checkAttendanceStatus(
    email: string,
    date: string
): Promise<AttendanceStatus> {
    console.log(`🔍 Checking attendance status for ${email} on ${date}`);

    try {
        const response = await fetch('https://n8n.kishoren8n.in/webhook/AttendanceStatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ Email: email, Date: date }),
        });

        console.log('📡 Status check response:', response.status);

        if (!response.ok) {
            console.warn('⚠️ Status check returned non-OK status:', response.status);
            return { isClockedIn: false, clockInTime: null, date: null };
        }

        const data = await response.json();
        console.log('✅ Status check data:', data);

        return {
            isClockedIn: data.isClockedIn || false,
            clockInTime: data.clockInTime || null,
            date: data.date || null,
        };
    } catch (error) {
        console.error('❌ Failed to check attendance status:', error);
        // Return false on error so user can still clock in
        return { isClockedIn: false, clockInTime: null, date: null };
    }
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
        ? 'https://n8n.kishoren8n.in/webhook/ClockOut'
        : 'https://n8n.kishoren8n.in/webhook/UserData';

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
