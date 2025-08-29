"use server";

import z from "zod";
import { subscribeService } from "./services";
import { createComment } from "./loaders";
import { BASE_URL } from "../../consts";

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
    return {
      ...prevState,
      strapiErrors: response.error.message || "בעיה בהרשמה לניוזלטר",
      errorMessage: "בעיה בהרשמה לניוזלטר, אנא נסו שנית מאוחר יותר.",
      successMessage: "",
    };
  }

  if (response.data.error) {
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
    const response = await fetch(`${BASE_URL}/api/contact-email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        subject,
        message,
        category: parseInt(category, 10)
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
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
  categories: z.array(z.number()).min(1, {
    message: "יש לבחור לפחות קטגוריה אחת",
  }).max(3, {
    message: "ניתן לבחור עד 3 קטגוריות בלבד",
  }),
});

interface QuestionState {
  zodErrors: Record<string, string[]> | null;
  strapiErrors: string;
  successMessage: string;
  errorMessage: string;
  slug?: string;
}

export async function submitQuestionAction(prevState: QuestionState, formData: FormData) {
  // Get categories from form data (multiple values with same name) - now as IDs
  const categoryIds = formData.getAll("categories").map(id => parseInt(id as string, 10));
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
    categories: categoryIds,
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
    const { title, content, questioneer, questioneerEmail, categories } = validatedFields.data;

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

    // Categories are already IDs from form data, no need to fetch again

    // Build the data object, only including email if it's provided
    const data: {
      title: string;
      content: string;
      questioneer: string;
      slug: string;
      categories: number[];
      questioneerEmail?: string;
    } = {
      title,
      content,
      questioneer,
      slug,
      categories: categories
    };

    // Only include email if it's provided
    if (questioneerEmail && questioneerEmail.trim().length > 0) {
      data.questioneerEmail = questioneerEmail;
    }

    const response = await fetch(`${BASE_URL}/api/responsas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
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
  