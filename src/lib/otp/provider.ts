// OTP delivery providers. Swap by setting OTP_PROVIDER in .env.local.
// Default "mock" logs the OTP to the server console so you can test the full
// flow without paying for SMS.

type Provider = "mock" | "msg91";

async function mockProvider(phone: string, code: string) {
  // eslint-disable-next-line no-console
  console.log(
    `\n  [MOCK OTP]  phone=${phone}  code=${code}  (provider=mock)\n` +
      `  Configure OTP_PROVIDER=msg91 in .env.local to send real SMS.\n`
  );
}

async function msg91Provider(phone: string, code: string) {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  const senderId = process.env.MSG91_SENDER_ID;
  if (!authKey || !templateId) {
    throw new Error(
      "MSG91 not configured: set MSG91_AUTH_KEY and MSG91_TEMPLATE_ID"
    );
  }

  const mobile = phone.replace(/^\+/, ""); // 91XXXXXXXXXX
  const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${mobile}&otp=${code}${
    senderId ? `&sender=${senderId}` : ""
  }`;

  const res = await fetch(url, {
    method: "POST",
    headers: { authkey: authKey, "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`MSG91 failed: ${res.status} ${await res.text()}`);
  }
}

export async function sendOtpViaProvider(phone: string, code: string) {
  const provider = (process.env.OTP_PROVIDER ?? "mock") as Provider;
  switch (provider) {
    case "msg91":
      return msg91Provider(phone, code);
    case "mock":
    default:
      return mockProvider(phone, code);
  }
}
