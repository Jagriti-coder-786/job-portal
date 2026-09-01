export const getInterviewScheduledTemplate = (applicantName, jobTitle, companyName, date, time, link, notes) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
    <h2 style="color: #4F46E5;">Interview Scheduled</h2>
    <p>Dear ${applicantName},</p>
    <p>We are pleased to inform you that an interview has been scheduled for your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.</p>
    
    <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
      <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
      ${link ? `<p style="margin: 5px 0;"><strong>Meeting Link:</strong> <a href="${link}">${link}</a></p>` : ''}
      ${notes ? `<p style="margin: 10px 0 5px 0;"><strong>Notes:</strong> ${notes}</p>` : ''}
    </div>
    
    <p>Please make sure to be available at the scheduled time. Good luck!</p>
    <br>
    <p>Best regards,<br>The ${companyName} Team</p>
  </div>
</body>
</html>
`;

export const getStatusUpdateTemplate = (applicantName, jobTitle, companyName, status, notes) => {
  const statusMessages = {
    'screening': 'is currently in the screening phase.',
    'under-review': 'is now under review by our hiring team.',
    'shortlisted': 'has been shortlisted! We will contact you soon with next steps.',
    'offer': 'has resulted in an offer! Congratulations!',
    'rejected': 'was not selected at this time.',
    'hired': 'has been marked as hired. Congratulations!',
  };

  const message = statusMessages[status] || `status has been updated to: ${status}`;

  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
    <h2 style="color: #4F46E5;">Application Status Update</h2>
    <p>Dear ${applicantName},</p>
    <p>Your application for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong> ${message}</p>
    
    ${notes ? `
    <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0;"><strong>Message from recruiter:</strong> ${notes}</p>
    </div>
    ` : ''}
    
    <p>You can track the progress of your application on your dashboard.</p>
    <br>
    <p>Best regards,<br>The ${companyName} Team</p>
  </div>
</body>
</html>
  `;
};
