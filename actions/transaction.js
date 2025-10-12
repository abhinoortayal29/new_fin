"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializeAmount = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

// Create Transaction
export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Get request data for ArcJet
    const req = await request();

    // Check rate limit
    const decision = await aj.protect(req, {
      userId,
      requested: 1, // Specify how many tokens to consume
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        throw new Error("Too many requests. Please try again later.");
      }

      throw new Error("Request blocked");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    // Calculate new balance
    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + balanceChange;

    // Create transaction and update account balance
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getTransaction(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const transaction = await db.transaction.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction);
}

export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get original transaction to calculate balance change
    const originalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction) throw new Error("Transaction not found");

    // Calculate balance changes
    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = newBalanceChange - oldBalanceChange;

    // Update transaction and account balance in a transaction
    const transaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      // Update account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: netBalanceChange,
          },
        },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get User Transactions
export async function getUserTransactions(query = {}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        ...query,
      },
      include: {
        account: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return { success: true, data: transactions };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Scan Receipt

// export async function scanReceipt(file) {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     // Convert File to ArrayBuffer
//     const arrayBuffer = await file.arrayBuffer();
//     // Convert ArrayBuffer to Base64
//     const base64String = Buffer.from(arrayBuffer).toString("base64");

//     const prompt = `
//       Analyze this receipt image and extract the following information in JSON format:
//       - Total amount (just the number)
//       - Date (in ISO format)
//       - Description or items purchased (brief summary)
//       - Merchant/store name
//       - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
//       Only respond with valid JSON in this exact format:
//       {
//         "amount": number,
//         "date": "ISO date string",
//         "description": "string",
//         "merchantName": "string",
//         "category": "string"
//       }

//       If its not a recipt, return an empty object
//     `;

//     const result = await model.generateContent([
//       {
//         inlineData: {
//           data: base64String,
//           mimeType: file.type,
//         },
//       },
//       prompt,
//     ]);

//     const response = await result.response;
//     const text = response.text();
//     const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

//     try {
//       const data = JSON.parse(cleanedText);
//       return {
//         amount: parseFloat(data.amount),
//         date: new Date(data.date),
//         description: data.description,
//         category: data.category,
//         merchantName: data.merchantName,
//       };
//     } catch (parseError) {
//       console.error("Error parsing JSON response:", parseError);
//       throw new Error("Invalid response format from Gemini");
//     }
//   } catch (error) {
//     console.error("Error scanning receipt:", error);
//     throw new Error("Failed to scan receipt");
//   }
// }
// actions/transaction.js  (server-side)
import { Buffer } from "buffer";

/**
 * Helper: list available models (quick check)
 */
async function listModels() {
  const res = await fetch("https://generativelanguage.googleapis.com/v1/models", {
    headers: {
      "x-goog-api-key": process.env.GEMINI_API_KEY,
      "Accept": "application/json",
    },
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`ListModels failed ${res.status}: ${txt}`);
  }
  return res.json(); // inspect shape in logs while debugging
}

/**
 * scanReceipt(file)
 * file: a File-like object available in Next.js server action or FormData (server).
 */
export async function scanReceipt(file) {
  try {
    if (!file) throw new Error("No file provided");
    // 1) Optionally: check models and pick one (recommended while debugging)
    // const models = await listModels();
    // console.log("models:", models); // inspect available model names in dev logs

    // Fallback model to try first (if you get 404, listModels to find supported model)
    const modelName = "gemini-2.5-flash"; // try this first; if 404, run listModels() and choose another

    // 2) Convert file to base64 (server-side)
    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    // 3) Build prompt and REST body - we pass image inline then ask for JSON output
    const promptText = `
You are a receipt parser. Return EXACTLY one JSON object, no markdown, no commentary.
Format:
{"amount": number, "date":"ISO date string","description":"string","merchantName":"string","category":"string"}
If not a receipt return {}.
    `.trim();

    const body = {
      contents: [
        // image part
        {
          parts: [
            {
              inlineData: {
                mimeType: file.type || "image/jpeg",
                data: base64String
              }
            }
          ]
        },
        // text prompt part
        {
          parts: [
            { text: promptText }
          ]
        }
      ],
      // you can request JSON output by setting responseMimeType in some SDKs
      // but for REST, we'll parse the returned candidate text
    };

    const endpoint = `https://generativelanguage.googleapis.com/v1/models/${encodeURIComponent(modelName)}:generateContent`;

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify(body),
    });

    const textOrJson = await resp.text();
    if (!resp.ok) {
      console.error("Gemini error body:", textOrJson);
      throw new Error(`Gemini generateContent failed: ${resp.status} ${resp.statusText}`);
    }

    // The API usually returns a JSON object — check if textOrJson is JSON or contains the JSON in candidates
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(textOrJson);
    } catch (err) {
      // Fallback: try to extract code block or text from returned shape
      // Many responses are JSON; if not, inspect response manually in dev logs.
      console.error("Non-JSON response from Gemini:", textOrJson);
      throw new Error("Invalid response format from Gemini");
    }

    // Example: search for the JSON string in the response if model returns free text in candidates
    // The exact path varies by API; typical: parsedResponse.candidates[0].content.parts[0].text
    // Inspect and adapt:
    let extractedText = "";
    if (parsedResponse?.candidates?.length) {
      // try several common locations
      try {
        const c = parsedResponse.candidates[0];
        // candidate may have content.parts[].text or content.parts[].inlineData etc
        extractedText =
          c?.content?.map?.(p => p.text).filter(Boolean).join("\n") ||
          c?.content?.parts?.map?.(p => p.text).filter(Boolean).join("\n") ||
          parsedResponse?.candidates[0]?.content?.parts?.[0]?.text ||
          JSON.stringify(parsedResponse);
      } catch (e) {
        extractedText = JSON.stringify(parsedResponse);
      }
    } else {
      extractedText = JSON.stringify(parsedResponse);
    }

    // Clean Markdown fences if any
    const cleaned = extractedText.replace(/```(?:json)?\n?/g, "").trim();

    // Parse our expected JSON result
    const finalObj = JSON.parse(cleaned || "{}");

    return {
      amount: finalObj.amount ? parseFloat(finalObj.amount) : 0,
      date: finalObj.date ? new Date(finalObj.date) : null,
      description: finalObj.description || "",
      merchantName: finalObj.merchantName || "",
      category: finalObj.category || "other-expense",
    };
  } catch (err) {
    console.error("Error scanning receipt (server REST):", err);
    throw new Error("Failed to scan receipt: " + (err.message || err));
  }
}









// Helper function to calculate next recurring date
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}
