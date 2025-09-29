"use server";

import z from "zod";
import { subscribeService, unsubscribeService } from "./services";
import { createComment, createThread } from "./loaders";
import { BASE_URL } from "../../consts";
import { fetchAPI } from "@/utils/fetchApi";

const subscribeSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
});

interface SubscribeState {
  zodErrors: Record<string, string[]> | null;
  strapiErrors: string;
  successMessage: string;
  errorMessage: string;
}

export async function subscribeAction(prevState: SubscribeState, formData: FormData) {
  const validatedFields = subscribeSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      ...prevState,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      strapiErrors: "",
      errorMessage: "",
      successMessage: "",
    };
  }
  const response = await subscribeService(validatedFields.data.email);

  if (!response.data) {
    // Check if it's a duplicate email error
    const errorMessage = response.error?.message || "";
    const isDuplicateEmail = 
      errorMessage.includes("unique constraint") || 
      errorMessage.includes("duplicate") ||
      errorMessage.includes("already exists") ||
      response.error?.status === 400;

    if (isDuplicateEmail) {
      return {
        ...prevState,
        strapiErrors: "כתובת האימייל כבר קיימת במערכת",
        errorMessage: "כתובת האימייל הזו כבר רשומה לניוזלטר שלנו. תודה על העניין!",
        successMessage: "",
      };
    }

    return {
      ...prevState,
      strapiErrors: response.error.message || "בעיה בהרשמה לניוזלטר",
      errorMessage: "בעיה בהרשמה לניוזלטר, אנא נסו שנית מאוחר יותר.",
      successMessage: "",
    };
  }

  if (response.data.error) {
    // Check if it's a duplicate email error
    const errorMessage = response.data.error.message || "";
    const isDuplicateEmail = 
      errorMessage.includes("unique constraint") || 
      errorMessage.includes("duplicate") ||
      errorMessage.includes("already exists") ||
      response.data.error.status === 400;

    if (isDuplicateEmail) {
      return {
        ...prevState,
        strapiErrors: "כתובת האימייל כבר קיימת במערכת",
        errorMessage: "כתובת האימייל הזו כבר רשומה לניוזלטר שלנו. תודה על העניין!",
        successMessage: "",
      };
    }

    return {
      ...prevState,
      strapiErrors: response.data.error.message || "בעיה בהרשמה לניוזלטר",
      errorMessage: "בעיה בהרשמה לניוזלטר, אנא נסו שנית מאוחר יותר.",
      successMessage: "",
    };
  }

  return {
    ...prevState,
    successMessage: "הרשמתכם התקבלה בהצלחה!",
    zodErrors: null,
    strapiErrors: "",
    errorMessage: "",
  };
}

const commentSchema = z.object({
  answer: z.string().min(1, {
    message: "Please enter your answer",
  }),
  answerer: z.string().min(1, {
    message: "Please enter your name",
  }),
  responsaSlug: z.string().optional(),
  blogSlug: z.string().optional(),
}).refine((data) => data.responsaSlug || data.blogSlug, {
  message: "Either responsa slug or blog slug is required",
  path: ["responsaSlug"],
});

const threadSchema = z.object({
  answer: z.string().min(1, {
    message: "Please enter your answer",
  }),
  answerer: z.string().min(1, {
    message: "Please enter your name",
  }),
  parentCommentSlug: z.string(),
  responsaSlug: z.string().optional(),
  blogSlug: z.string().optional(),
}).refine((data) => data.responsaSlug || data.blogSlug, {
  message: "Either responsa slug or blog slug is required",
  path: ["responsaSlug"],
});

interface CommentState {
  zodErrors: Record<string, string[]> | null;
  strapiErrors: string;
  successMessage: string;
  errorMessage: string;
}

export async function addCommentAction(prevState: CommentState, formData: FormData) {
  const validatedFields = commentSchema.safeParse({
    answer: formData.get("answer"),
    answerer: formData.get("answerer"),
    responsaSlug: formData.get("responsaSlug") || undefined,
    blogSlug: formData.get("blogSlug") || undefined,
  });

  if (!validatedFields.success) {
    return {
      ...prevState,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      strapiErrors: "",
      errorMessage: "",
      successMessage: "",
    };
  }

  try {
    const { answer, answerer, responsaSlug, blogSlug } = validatedFields.data;
    const response = await createComment({
      answer,
      answerer,
      responsaSlug,
      blogSlug
    });

    if (!response.data) {
      return {
        ...prevState,
        strapiErrors: response.error?.message || "תקלה לא ידועה",
        errorMessage: "קרתה תקלה, אנא נסו שנית מאוחר יותר.",
        successMessage: "",
      };
    }

    return {
      ...prevState,
      successMessage: blogSlug ? "תגובתך התקבלה!" : "תשובתך התקבלה!",
      zodErrors: null,
      strapiErrors: "",
      errorMessage: "",
    };
  } catch {
    return {
      ...prevState,
      strapiErrors: "",
      errorMessage: "קרתה תקלה, אנא נסו שנית מאוחר יותר.",
      successMessage: "",
    };
  }
}

export async function addThreadAction(prevState: CommentState, formData: FormData) {
  const parentCommentSlug = formData.get("parentCommentSlug") as string;

  const validatedFields = threadSchema.safeParse({
    answer: formData.get("answer"),
    answerer: formData.get("answerer"),
    parentCommentSlug,
    responsaSlug: formData.get("responsaSlug") || undefined,
    blogSlug: formData.get("blogSlug") || undefined,
  });

  if (!validatedFields.success) {
    return {
      ...prevState,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      strapiErrors: "",
      errorMessage: "",
      successMessage: "",
    };
  }

  try {
    const { answer, answerer, parentCommentSlug, responsaSlug, blogSlug } = validatedFields.data;
    const response = await createThread({
      answer,
      answerer,
      parentCommentSlug,
      responsaSlug,
      blogSlug
    });

    if (!response.data) {
      return {
        ...prevState,
        strapiErrors: response.error?.message || "תקלה לא ידועה",
        errorMessage: "קרתה תקלה, אנא נסו שנית מאוחר יותר.",
        successMessage: "",
      };
    }

    return {
      ...prevState,
      successMessage: blogSlug ? "תגובתך התקבלה!" : "תשובתך התקבלה!",
      zodErrors: null,
      strapiErrors: "",
      errorMessage: "",
    };
  } catch {
    return {
      ...prevState,
      strapiErrors: "",
      errorMessage: "קרתה תקלה, אנא נסו שנית מאוחר יותר.",
      successMessage: "",
    };
  }
}

const contactSchema = z.object({
  name: z.string().min(2, {
    message: "שם חייב להכיל לפחות 2 תווים",
  }),
  email: z.string().email({
    message: "נא להזין כתובת אימייל תקינה",
  }),
  subject: z.string().min(3, {
    message: "נושא חייב להכיל לפחות 3 תווים",
  }),
  message: z.string().min(10, {
    message: "הודעה חייבת להכיל לפחות 10 תווים",
  }),
  category: z.string().min(1, {
    message: "יש לבחור סוג פנייה",
  }),
});

interface ContactState {
  zodErrors: Record<string, string[]> | null;
  strapiErrors: string;
  successMessage: string;
  errorMessage: string;
}

export async function submitContactAction(prevState: ContactState, formData: FormData) {
  const validatedFields = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    category: formData.get("category"),
  });

  if (!validatedFields.success) {
    return {
      ...prevState,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      strapiErrors: "",
      errorMessage: "",
      successMessage: "",
    };
  }

  try {
    const { name, email, subject, message, category } = validatedFields.data;

    // Send email via Strapi API
    const responseData = await fetchAPI(`${BASE_URL}/api/contact-email/send`, {
      method: 'POST',
      body: {
        name,
        email,
        subject,
        message,
        category: parseInt(category, 10)
      },
    });

    if (responseData.error) {
      console.error('Error sending email:', responseData);
      return {
        ...prevState,
        strapiErrors: responseData.error?.message || "Unknown error",
        errorMessage: "שגיאה בשליחת ההודעה. אנא נסה שוב.",
        successMessage: "",
      };
    }

    return {
      ...prevState,
      successMessage: "ההודעה נשלחה בהצלחה! נחזור אליך בהקדם האפשרי.",
      zodErrors: null,
      strapiErrors: "",
      errorMessage: "",
    };
  } catch (error) {
    console.error('Contact form error:', error);
    return {
      ...prevState,
      strapiErrors: "",
      errorMessage: "שגיאה בשליחת ההודעה. אנא נסה שוב.",
      successMessage: "",
    };
  }
}

const questionSchema = z.object({
  title: z.string().min(3, {
    message: "כותרת חייבת להכיל לפחות 3 תווים",
  }),
  content: z.string().min(10, {
    message: "תוכן השאלה חייב להכיל לפחות 10 תווים",
  }),
  questioneer: z.string().min(2, {
    message: "שם השואל חייב להכיל לפחות 2 תווים",
  }),
  questioneerEmail: z.string().email({
    message: "נא להזין כתובת אימייל תקינה",
  }).optional(),
});

interface QuestionState {
  zodErrors: Record<string, string[]> | null;
  strapiErrors: string;
  successMessage: string;
  errorMessage: string;
  slug?: string;
}

export async function submitQuestionAction(prevState: QuestionState, formData: FormData) {
  // Handle optional email - convert empty string to undefined
  const emailValue = formData.get("questioneerEmail");
  const processedEmail = emailValue && (emailValue as string).trim().length > 0
    ? emailValue
    : undefined;

  const validatedFields = questionSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    questioneer: formData.get("questioneer"),
    questioneerEmail: processedEmail,
  });

  if (!validatedFields.success) {
    return {
      ...prevState,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      strapiErrors: "",
      errorMessage: "",
      successMessage: "",
    };
  }

  try {
    const { title, content, questioneer, questioneerEmail } = validatedFields.data;

    // Create a slug from the title (for Hebrew, add a timestamp to ensure uniqueness)
    // Transliterate Hebrew characters to Latin or use timestamp as fallback
    const timestamp = Date.now();
    let slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    // If slug is empty or very short (likely because of Hebrew chars), use a timestamp prefix
    if (slug.length < 3) {
      slug = `question-${timestamp}`;
    } else {
      // Otherwise, append timestamp to ensure uniqueness
      slug = `${slug}-${timestamp}`;
    }

    // Build the data object, only including email if it's provided
    const data: {
      title: string;
      content: string;
      questioneer: string;
      slug: string;
      questioneerEmail?: string;
    } = {
      title,
      content,
      questioneer,
      slug
    };

    // Only include email if it's provided
    if (questioneerEmail && questioneerEmail.trim().length > 0) {
      data.questioneerEmail = questioneerEmail;
    }

    const responseData = await fetchAPI(`${BASE_URL}/api/responsas`, {
      method: 'POST',
      body: {
        data
      },
    });

    if (responseData.error) {
      console.error('Error response:', responseData);
      return {
        ...prevState,
        strapiErrors: responseData.error?.message || "Unknown error",
        errorMessage: "שגיאה בשליחת השאלה. אנא נסה שוב.",
        successMessage: "",
      };
    }

    // Extract the slug from the response data
    // Check both possible response structures
    const createdSlug =
      responseData.data?.slug ||            // Format 1
      slug;                                // Fallback to submitted slug

    // Return the slug for redirection
    return {
      ...prevState,
      successMessage: "השאלה נשלחה בהצלחה!",
      zodErrors: null,
      strapiErrors: "",
      errorMessage: "",
      slug: createdSlug,
    };
  } catch (error) {
    console.error('Submission error:', error);
    return {
      ...prevState,
      strapiErrors: "",
      errorMessage: "שגיאה בשליחת השאלה. אנא נסה שוב.",
      successMessage: "",
    };
  }
}

const unsubscribeSchema = z.object({
  email: z.string().email({
    message: "נא להזין כתובת אימייל תקינה",
  }),
});

interface UnsubscribeState {
  zodErrors: Record<string, string[]> | null;
  strapiErrors: string;
  successMessage: string;
  errorMessage: string;
}

export async function unsubscribeAction(prevState: UnsubscribeState, formData: FormData) {
  const validatedFields = unsubscribeSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      ...prevState,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      strapiErrors: "",
      errorMessage: "",
      successMessage: "",
    };
  }

  try {
    const response = await unsubscribeService(validatedFields.data.email);

    if (!response.data) {
      // Check if email wasn't found
      const errorMessage = response.error?.message || "";
      const isEmailNotFound = 
        errorMessage.includes("not found") || 
        errorMessage.includes("does not exist") ||
        response.error?.status === 404;

      if (isEmailNotFound) {
        return {
          ...prevState,
          strapiErrors: "כתובת האימייל לא נמצאה במערכת",
          errorMessage: "כתובת האימייל הזו לא רשומה לניוזלטר שלנו.",
          successMessage: "",
        };
      }

      return {
        ...prevState,
        strapiErrors: response.error?.message || "בעיה בביטול המנוי",
        errorMessage: "בעיה בביטול המנוי, אנא נסו שנית מאוחר יותר.",
        successMessage: "",
      };
    }

    return {
      ...prevState,
      successMessage: "המנוי בוטל בהצלחה! תודה שהיה כם חלק מהקהילה שלנו.",
      zodErrors: null,
      strapiErrors: "",
      errorMessage: "",
    };
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return {
      ...prevState,
      strapiErrors: "",
      errorMessage: "בעיה בביטול המנוי, אנא נסו שנית מאוחר יותר.",
      successMessage: "",
    };
  }
}
  