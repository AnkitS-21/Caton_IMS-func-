// // src-tauri/src/cmd.rs
// use tauri::State;
// use mongodb::Collection;
// use crate::user::{signup_user, login_user};
// use crate::model::User;
// use crate::db::DbState; // Import your DbState struct
// use mongodb::bson::doc;

// #[tauri::command]
// pub async fn signup(
//     username: String,
//     password: String,
//     email: String,
//     db: State<'_, DbState>,
// ) -> Result<(), String> {
//     let user_collection: &Collection<User> = &db.db.collection("users");

//     // Check if email already exists
//     let existing_user = user_collection
//         .find_one(doc! { "email": &email }, None)
//         .await
//         .map_err(|e| format!("Database error: {}", e))?;

//     if existing_user.is_some() {
//         // Return an error if a user with the same email already exists
//         return Err("Email already in use".to_string());
//     }

//     // Call the signup function if email is unique
//     signup_user(user_collection, &username, &password, &email).await
// }
// #[tauri::command]
// pub async fn login(username: String, password: String, db: State<'_, DbState>) -> Result<(), String> {
//     let user_collection: &Collection<User> = &db.db.collection("users");
//     login_user(user_collection, &username, &password).await
// }

use tauri::State;
use mongodb::Collection;
use crate::user::{signup_user, login_user};
use crate::model::User;
use crate::db::DbState; // Import your DbState struct
use mongodb::bson::{doc, oid::ObjectId};

// #[tauri::command]
// pub async fn signup(
//     username: String,
//     password: String,
//     email: String,
//     db: State<'_, DbState>,
// ) -> Result<String, String> { // Return a String (user_id) on success
//     let user_collection: &Collection<User> = &db.db.collection("users");

//     // Check if email already exists
//     let existing_user = user_collection
//         .find_one(doc! { "email": &email }, None)
//         .await
//         .map_err(|e| format!("Database error: {}", e))?;

//     if existing_user.is_some() {
//         // Return an error if a user with the same email already exists
//         return Err("Email already in use".to_string());
//     }

//     // Call the signup function if email is unique
//     match signup_user(user_collection, &username, &password, &email).await {
//         Ok(user) => {
//             // Return user_id upon successful signup
//             Ok(user.id.to_hex())
//         },
//         Err(e) => Err(e),
//     }
// }

// #[tauri::command]
// pub async fn login(username: String, password: String, db: State<'_, DbState>) -> Result<String, String> { // Return user_id
//     let user_collection: &Collection<User> = &db.db.collection("users");

//     match login_user(user_collection, &username, &password).await {
//         Ok(user) => {
//             // Return the user ID (ObjectId) as a string
//             Ok(user.id.to_hex())
//         },
//         Err(e) => Err(e), // Return the error message if login fails
//     }
// }

#[tauri::command]
pub async fn signup(
    username: String,
    password: String,
    email: String,
    db: State<'_, DbState>,
) -> Result<String, String> { // Return a String (user_id) on success
    let user_collection: &Collection<User> = &db.db.collection("users");

    let existing_user = user_collection
        .find_one(doc! { "email": &email }, None)
        .await
        .map_err(|e| format!("Database error: {}", e))?;

    if existing_user.is_some() {
        return Err("Email already in use".to_string());
    }

    match signup_user(user_collection, &username, &password, &email).await {
        Ok(user) => {
            // Unwrap the optional `id` and convert it to a hex string
            Ok(user.id.ok_or("Failed to retrieve user ID")?.to_hex())
        },
        Err(e) => Err(e),
    }
}

#[tauri::command]
pub async fn login(username: String, password: String, db: State<'_, DbState>) -> Result<String, String> {
    let user_collection: &Collection<User> = &db.db.collection("users");

    match login_user(user_collection, &username, &password).await {
        Ok(user) => {
            // Return user ID as a hex string to be stored in the frontend
            Ok(user.id.ok_or("Failed to retrieve user ID")?.to_hex())
        },
        Err(e) => Err(e),
    }
}
