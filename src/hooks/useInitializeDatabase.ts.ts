// // src/hooks/useInitializeDatabase.ts
// import { invoke } from "@tauri-apps/api/core";

// export function useInitializeDatabase() {
//   const initializeDatabase = async (userId: string) => {
//     try {
//       const result = await invoke("initialize_db");
//       console.log(result);
//     } catch (error) {
//       console.error("Error initializing the database:", error);
//     }
//   };

//   return { initializeDatabase };
// }

// src/hooks/useInitializeDatabase.ts
// import { invoke } from "@tauri-apps/api/core";

// export function useInitializeDatabase() {
//   const initializeDatabase = async (userId: string) => {
//     try {
//       const result = await invoke("initialize_db", { userId });
//       console.log(`Database initialized for user: ${userId}`, result);
//     } catch (error) {
//       console.error(`Error initializing the database for user ${userId}:`, error);
//     }
//   };

//   return { initializeDatabase };
// }

import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner"; // Adding toast notifications for user feedback

export function useInitializeDatabase() {
  /**
   * Initializes the database for the specified user.
   * @param userId - The unique identifier of the user.
   */
  const initializeDatabase = async (userId: string) => {
    if (!userId) {
      console.error("User ID is required to initialize the database.");
      toast.error("Failed to initialize database: User ID is missing.");
      return;
    }

    console.log(userId);

    try {
      const result = await invoke("initialize_db", { userId });
      console.log(`Database successfully initialized for user: ${userId}`, result);
      toast.success("Database initialized successfully!");
    } catch (error) {
      console.error(`Error initializing the database for user ${userId}:`, error);
      toast.error("Error initializing database. Please try again.");
    }
  };

  return { initializeDatabase };
}

