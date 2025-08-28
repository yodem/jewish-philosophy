/**
 * email service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::email.email', ({ strapi }) => ({
  sendEmail: async (ctx) => {
    try {
      const input = ctx.request.body.data?.input;
      const emailTo = ctx.request.body.data?.emailTo;
      
      await strapi.plugins["email"].services.email.send({
        from: process.env.RESEND_DEFAULT_FROM_EMAIL || "onboarding@resend.dev",
        to: emailTo,
        subject: "Test Email from Strapi",
        html: `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Test Email</h2>
          <p style="font-size: 16px; line-height: 1.6;">${input}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">This is a test email from your Strapi application.</p>
        </div>`,
      });

      return {
        message: "Email sent successfully!",
      };
    } catch (err) {
      console.error('Email sending error:', err);
      throw err;
    }
  },

  // Email template service for responsive Hebrew emails
  sendStyledEmail: async ({ to, subject, template, data }) => {
    console.log('📬 sendStyledEmail called with:', { to, subject, template });
    try {
      const emailTemplates = {
        welcomeNewsletter: (data) => `
          <div style="direction: rtl; text-align: right; font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">ברוכים הבאים!</h1>
              <p style="color: #e8e8e8; margin: 10px 0 0 0; font-size: 16px;">לקהילת הפילוסופיה היהודית</p>
            </div>
            
            <!-- Content -->
            <div style="background: white; padding: 40px 30px;">
              <h2 style="color: #333; margin-top: 0; font-size: 24px;">תודה שהצטרפת לניוזלטר שלנו!</h2>
              
              <p style="font-size: 16px; line-height: 1.8; color: #555; margin-bottom: 25px;">
                אנחנו שמחים שהצטרפת לקהילה שלנו!
                מעתה תקבל עדכונים מיוחדים על:
              </p>
              
              <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <ul style="font-size: 16px; line-height: 2; color: #555; margin: 0; padding-right: 20px;">
                  <li>📚 מאמרים חדשים בפילוסופיה יהודית</li>
                  <li>🎥 שיעורים ווידאו מרתקים</li>
                  <li>💬 תשובות לשאלות מהקהילה</li>
                  <li>✨ עדכונים מיוחדים וחידושים באתר</li>
                  <li>📖 המלצות על ספרים וכתבים</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="${data.siteUrl || process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          text-decoration: none; 
                          padding: 15px 35px; 
                          border-radius: 30px; 
                          font-weight: bold;
                          font-size: 16px;
                          display: inline-block;
                          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                  🏠 בקר באתר
                </a>
              </div>
              
              <div style="background: #e3f2fd; border-right: 4px solid #2196f3; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0; font-size: 14px; color: #1976d2;">
                  <strong>💡 טיפ:</strong> הוסף את כתובת האימייל שלנו לרשימת הקשר שלך כדי לוודא שהעדכונים יגיעו אליך ישירות לתיבת הדואר הנכנס.
                </p>
              </div>
              
              <p style="color: #666; font-size: 16px; text-align: center; margin-top: 40px; line-height: 1.6;">
                תודה רבה על הצטרפותך!<br>
                <strong style="color: #667eea;">צוות פילוסופיה יהודית</strong>
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f1f3f4; padding: 25px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; color: #888; font-size: 12px;">
                אימייל זה נשלח אוטומטית כאישור להרשמה לניוזלטר
              </p>
              <p style="margin: 0; color: #888; font-size: 12px;">
                ניתן לבטל את המנוי בכל עת על ידי הקלקה על הקישור בתחתית עדכונים עתידיים
              </p>
            </div>
          </div>
        `,
        
        questionResponse: (data) => `
          <div style="direction: rtl; text-align: right; font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); padding: 25px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 26px; font-weight: bold;">💬 תשובה לשאלה שלך!</h1>
            </div>

            <!-- Content -->
            <div style="background: white; padding: 35px 30px;">
              <h2 style="color: #333; margin-top: 0; font-size: 22px;">שלום ${data.questioneer},</h2>

              <div style="background: #e8f5e8; border-right: 4px solid #4caf50; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0; font-size: 16px; color: #2e7d32;">
                  <strong>📝 השאלה שלך:</strong> "${data.questionTitle}"
                </p>
              </div>

              <p style="font-size: 16px; line-height: 1.8; color: #555; margin-bottom: 25px;">
                קיבלת תשובה חדשה לשאלה שלך! אנחנו מזמינים אותך לקרוא את התשובה המלאה באתר שלנו.
              </p>

              <div style="text-align: center; margin: 35px 0;">
                <a href="${data.questionLink}"
                   style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
                          color: white;
                          text-decoration: none;
                          padding: 15px 35px;
                          border-radius: 30px;
                          font-weight: bold;
                          font-size: 16px;
                          display: inline-block;
                          box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);">
                  👀 לחץ כאן לצפייה בתשובה
                </a>
              </div>

              <div style="background: #fff3e0; border-right: 4px solid #ff9800; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0; font-size: 14px; color: #f57c00;">
                  <strong>🤝 רוצה לשתף?</strong> אם התשובה עזרה לך, אל תהסס לשתף אותה עם חברים שעשויים להיות מעוניינים!
                </p>
              </div>

              <p style="color: #666; font-size: 16px; text-align: center; margin-top: 40px; line-height: 1.6;">
                תודה שבחרת לשאול ולהיות חלק מהקהילה שלנו!<br>
                <strong style="color: #4caf50;">צוות הפילוסופיה היהודית</strong>
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #f1f3f4; padding: 25px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #888; font-size: 12px;">
                אימייל זה נשלח אוטומטית כהודעה על תשובה לשאלה שלך
              </p>
            </div>
          </div>
        `,

        questionConfirmation: (data) => `
          <div style="direction: rtl; text-align: right; font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); padding: 25px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 26px; font-weight: bold;">✅ השאלה שלך התקבלה!</h1>
            </div>

            <!-- Content -->
            <div style="background: white; padding: 35px 30px;">
              <h2 style="color: #333; margin-top: 0; font-size: 22px;">שלום ${data.questioneer},</h2>

              <div style="background: #e3f2fd; border-right: 4px solid #2196f3; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0; font-size: 16px; color: #1976d2;">
                  <strong>📝 השאלה שלך:</strong> "${data.questionTitle}"
                </p>
              </div>

              <p style="font-size: 16px; line-height: 1.8; color: #555; margin-bottom: 25px;">
                תודה רבה על שאלתך! השאלה שלך התקבלה בהצלחה ותפורסם בקרוב באתר שלנו.
                אנחנו נעבור על השאלה ונפרסם אותה בסעיף "שאלות ותשובות".
              </p>

              <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #333; margin-top: 0; font-size: 18px;">מה קורה עכשיו?</h3>
                <ul style="font-size: 16px; line-height: 2; color: #555; margin: 15px 0 0 0; padding-right: 20px;">
                  <li>📝 השאלה שלך תפורסם בסעיף השאלות והתשובות</li>
                  <li>💬 תוכל לקבל תשובה מפרופ׳ שלום בקרוב</li>
                  <li>🔔 נודיע לך כשיהיו תשובות חדשות</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 35px 0;">
                <a href="${data.questionLink}"
                   style="background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
                          color: white;
                          text-decoration: none;
                          padding: 15px 35px;
                          border-radius: 30px;
                          font-weight: bold;
                          font-size: 16px;
                          display: inline-block;
                          box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);">
                  👀 צפה בשאלה שלך באתר
                </a>
              </div>

              <div style="background: #fff3e0; border-right: 4px solid #ff9800; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0; font-size: 14px; color: #f57c00;">
                  <strong>💡 טיפ:</strong> הוסף את כתובת האימייל שלנו לרשימת הקשר שלך כדי לוודא שתקבל התראות על תשובות לשאלה שלך.
                </p>
              </div>

              <p style="color: #666; font-size: 16px; text-align: center; margin-top: 40px; line-height: 1.6;">
                תודה שהצטרפת לשיחה!<br>
                <strong style="color: #2196f3;">צוות הפילוסופיה היהודית</strong>
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #f1f3f4; padding: 25px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #888; font-size: 12px;">
                אימייל זה נשלח אוטומטית כאישור קבלת השאלה שלך
              </p>
            </div>
          </div>
        `,

        blogComment: (data) => `
          <div style="direction: rtl; text-align: right; font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); padding: 25px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 26px; font-weight: bold;">💬 תגובה חדשה לפוסט שלך!</h1>
            </div>

            <!-- Content -->
            <div style="background: white; padding: 35px 30px;">
              <h2 style="color: #333; margin-top: 0; font-size: 22px;">שלום ${data.authorName},</h2>

              <div style="background: #fff3e0; border-right: 4px solid #ff6b35; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0; font-size: 16px; color: #e65100;">
                  <strong>📝 הפוסט שלך:</strong> "${data.blogTitle}"
                </p>
              </div>

              <p style="font-size: 16px; line-height: 1.8; color: #555; margin-bottom: 25px;">
                קיבלת תגובה חדשה לפוסט שלך מאת <strong>${data.commenterName}</strong>! 
                אנחנו מזמינים אותך לקרוא את התגובה ולהגיב אם תרצה.
              </p>

              <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #333; margin-top: 0; font-size: 18px;">מה אפשר לעשות עכשיו?</h3>
                <ul style="font-size: 16px; line-height: 2; color: #555; margin: 15px 0 0 0; padding-right: 20px;">
                  <li>👀 צפה בתגובה החדשה</li>
                  <li>💬 הגב בחזרה אם תרצה</li>
                  <li>🔗 שתף את הפוסט עם חברים</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 35px 0;">
                <a href="${data.blogLink}"
                   style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
                          color: white;
                          text-decoration: none;
                          padding: 15px 35px;
                          border-radius: 30px;
                          font-weight: bold;
                          font-size: 16px;
                          display: inline-block;
                          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);">
                  👀 לחץ כאן לצפייה בתגובה
                </a>
              </div>

              <div style="background: #e8f5e8; border-right: 4px solid #4caf50; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0; font-size: 14px; color: #2e7d32;">
                  <strong>🎉 מזל טוב!</strong> הפוסט שלך מעורר עניין ומעודד דיון. זה סימן טוב לתוכן איכותי!
                </p>
              </div>

              <div style="background: #e3f2fd; border-right: 4px solid #2196f3; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0; font-size: 14px; color: #1976d2;">
                  <strong>💡 טיפ:</strong> תגובות איכותיות מעודדות יותר אנשים לקרוא ולהגיב. כדאי להגיב בחזרה ולעודד דיון!
                </p>
              </div>

              <p style="color: #666; font-size: 16px; text-align: center; margin-top: 40px; line-height: 1.6;">
                תודה שאתה חולק את הידע שלך עם הקהילה!<br>
                <strong style="color: #ff6b35;">צוות הפילוסופיה היהודית</strong>
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #f1f3f4; padding: 25px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; color: #888; font-size: 12px;">
                אימייל זה נשלח אוטומטית כהודעה על תגובה חדשה לפוסט שלך
              </p>
              <p style="margin: 0; color: #888; font-size: 12px;">
                ניתן להפסיק קבלת התראות אלו בהגדרות המשתמש באתר
              </p>
            </div>
          </div>
        `
      };

      const htmlContent = emailTemplates[template] ? emailTemplates[template](data) : `<p>Template not found</p>`;

      console.log('📧 Sending email via Strapi email plugin...');
      console.log('From:', process.env.RESEND_DEFAULT_FROM_EMAIL || "noreply@example.com");
      console.log('To:', to);
      console.log('Subject:', subject);

      await strapi.plugins["email"].services.email.send({
        from: process.env.RESEND_DEFAULT_FROM_EMAIL || "noreply@example.com",
        to,
        subject,
        html: htmlContent,
        text: `${subject}\n\n${data.plainText || 'Please view this email in HTML format.'}`,
      });

      console.log('✅ Email sent successfully!');
      return {
        message: "Styled email sent successfully!",
      };
    } catch (err) {
      console.error('Styled email sending error:', err);
      throw err;
    }
  }
}));
