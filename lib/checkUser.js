// import { currentUser } from "@clerk/nextjs/server";
// import { db } from "./prisma";
// import { auth } from "@clerk/nextjs/server";


// export const checkUser = async () => {
//   const user = await currentUser();

//   if (!user) {
//     return null;
//   }

//   try {
//     const loggedInUser = await db.user.findUnique({
//       where: {
//         clerkUserId: user.id,
//       },
//     });

//     if (loggedInUser) {
//       return loggedInUser;
//     }

//     const name = `${user.firstName} ${user.lastName}`;

//     const newUser = await db.user.create({
//       data: {
//         clerkUserId: user.id,
//         name,
//         imageUrl: user.imageUrl,
//         email: user.emailAddresses[0].emailAddress,
//       },
//     });

//     return newUser;
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// lib/checkUser.js
import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  try {
    const user = await currentUser(); // will return null if not logged in
    if (!user) return null;

    // Check if user exists in your DB
    const loggedInUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (loggedInUser) return loggedInUser;

    // Create new user in DB if not exists
    const name = `${user.firstName} ${user.lastName}`;
    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
    });

    return newUser;
  } catch (err) {
    console.error("checkUser error:", err.message);
    return null;
  }
};

