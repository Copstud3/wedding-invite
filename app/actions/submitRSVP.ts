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

  // Insert RSVP into database
  const { data, error } = await supabase
    .from("rsvps")
    .insert([{ name, email, accompany, attendance }]);

  console.log(data, "data submitted");

  if (error) {
    console.error("Error inserting RSVP: ", error);
    return { success: false, message: "Failed to submit RSVP", error };
  }

  // Check if admin email is configured
  if (!strings.sendToEmail) {
    console.error("No admin email configured");
    return { success: false, message: "Email configuration error" };
  }

  // Send email to admin
  try {
    await resend.emails.send({
      from: "RSVP System <onboarding@resend.dev>",
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
    console.log("Admin notification email sent successfully");
  } catch (emailError) {
    console.error("Error sending admin notification email: ", emailError);
    // Don't return error here as the RSVP was saved successfully
  }

  // // Send confirmation email to user
  // try {
  //   await resend.emails.send({
  //     from: "RSVP System <onboarding@resend.dev>",
  //     to: email as string,
  //     subject: "RSVP Confirmation - We've received your response",
  //     html: `
  //       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  //         <h1 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
  //           Thank you for your RSVP!
  //         </h1>
  //         <p style="font-size: 16px; color: #333;">
  //           Hi ${name}, we have successfully received your RSVP response.
  //         </p>
          
  //         <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
  //           <h2 style="color: #333; margin-top: 0;">Your Response Summary:</h2>
  //           <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
  //           <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
  //           <p style="margin: 10px 0;"><strong>Number of guests:</strong> ${accompany || 0}</p>
  //           <p style="margin: 10px 0;">
  //             <strong>Attendance:</strong> 
  //             <span style="color: ${attendance === "Yes" ? "#4CAF50" : "#f44336"}; font-weight: bold;">
  //               ${attendance === "Yes" ? "Will Attend" : "Cannot Attend"}
  //             </span>
  //           </p>
  //         </div>

  //         ${attendance === "Yes" ? `
  //           <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #4CAF50;">
  //             <p style="margin: 0; color: #2e7d32;">
  //               <strong>Great! We're excited to see you at the event.</strong>
  //             </p>
  //             <p style="margin: 10px 0 0 0; color: #2e7d32;">
  //               Event details and any updates will be shared closer to the date.
  //             </p>
  //           </div>
  //         ` : `
  //           <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; border-left: 4px solid #ff9800;">
  //             <p style="margin: 0; color: #e65100;">
  //               <strong>We're sorry you can't make it this time.</strong>
  //             </p>
  //             <p style="margin: 10px 0 0 0; color: #e65100;">
  //               We hope to see you at future events!
  //             </p>
  //           </div>
  //         `}

  //         <p style="color: #666; font-size: 14px; margin-top: 30px;">
  //           If you need to make any changes to your RSVP, please contact us directly.
  //         </p>
          
  //         <p style="color: #666; font-size: 12px; margin-top: 20px;">
  //           This confirmation was sent on ${new Date().toLocaleString()}
  //         </p>
  //       </div>
  //     `,
  //   });
  //   console.log("User confirmation email sent successfully");
  // } catch (emailError) {
  //   console.error("Error sending user confirmation email: ", emailError);
  //   // Don't return error here as the RSVP was saved successfully
  // }

  return { success: true, message: "RSVP submitted successfully! Check your email for confirmation." };
}