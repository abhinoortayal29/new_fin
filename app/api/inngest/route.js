import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import {
  checkBudgetAlerts,
  generateMonthlyReports,
  processRecurringTransaction,
  triggerRecurringTransactions,
} from "@/lib/inngest/function";

// 🔍 DEBUG START
console.log("🔍 Checking INNGEST_SIGNING_KEY...");
console.log("Present:", !!process.env.INNGEST_SIGNING_KEY);
if (process.env.INNGEST_SIGNING_KEY) {
  console.log("Length:", process.env.INNGEST_SIGNING_KEY.length);
  console.log("Starts with 'signkey-':", process.env.INNGEST_SIGNING_KEY.startsWith("signkey-"));
}
// 🔍 DEBUG END

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processRecurringTransaction,
    triggerRecurringTransactions,
    generateMonthlyReports,
    checkBudgetAlerts,
  ],
});
