"use server";

import { Resend } from "resend";
import { createClient } from "../utils/supabase/server";
import { strings } from "../utils/strings";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitRSVP(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name");
  const email = formData.get("email");
  const accompany = formData.get("accompany");
  const attendance = formData.get("attendance");

  const { data, error } = await supabase
    .from("rsvps")
    .insert([{ name, email, accompany, attendance }]);

  console.log(data, "data submitted");

  if (error) {
    console.error("Error inserting RSVP: ", error);
    return { success: false, message: "failed to submit RSVP", error };
  }

  if (!strings.sendToEmail) {
    console.error("No email to send to");
    return { success: false, message: "No email to send to" };
  }

  try {
    await resend.emails.send({
      from: "RSVP <onboarding@resend.dev>",
      to: strings.sendToEmail,
      subject: `New RSVP Submission - ${attendance === "Yes" ? "Attending" : "Not Attending"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
            New RSVP Submission
          </h1>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong>Number of guests:</strong> ${accompany || 0}</p>
            <p style="margin: 10px 0;">
              <strong>Attendance:</strong> 
              <span style="color: ${attendance === "Yes" ? "#4CAF50" : "#f44336"}; font-weight: bold;">
                ${attendance === "Yes" ? "Will Attend" : "Cannot Attend"}
              </span>
            </p>
          </div>
          <p style="color: #666; font-size: 14px;">
            Submitted on ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending email: ", error);
  }

  

  return { success: true, message: "RSVPs submitted successfully" };
}
