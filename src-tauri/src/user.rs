// // src-tauri/src/user.rs
// use mongodb::bson::doc;
// use mongodb::Collection;
// use bcrypt::{hash, verify, DEFAULT_COST};
// use crate::model::User;

// pub async fn signup_user(user_collection: &Collection<User>, username: &str, password: &str, email: &str) -> Result<(), String> {
//     let password_hash = hash(password, DEFAULT_COST).map_err(|e| e.to_string())?;
//     let user = User {
//         username: username.to_string(),
//         password_hash,
//         email: email.to_string(),
//     };
    
//     user_collection.insert_one(user, None)
//         .await
//         .map_err(|e| e.to_string())?;
//     Ok(())
// }

// pub async fn login_user(user_collection: &Collection<User>, username: &str, password: &str) -> Result<(), String> {
//     let user_doc = user_collection.find_one(doc! { "username": username }, None)
//         .await
//         .map_err(|e| e.to_string())?;
    
//     if let Some(user) = user_doc {
//         if verify(password, &user.password_hash).map_err(|e| e.to_string())? {
//             return Ok(());
//         }
//     }
//     Err("Invalid username or password".to_string())
// }


use mongodb::bson::{doc, oid::ObjectId};
use mongodb::Collection;
use bcrypt::{hash, verify, DEFAULT_COST};
use crate::model::User;

// pub async fn signup_user(
//     user_collection: &Collection<User>,
//     username: &str,
//     password: &str,
//     email: &str,
// ) -> Result<User, String> { // Return User on success
//     let password_hash = hash(password, DEFAULT_COST).map_err(|e| e.to_string())?;
    
//     // Create a new user with a generated ObjectId
//     let user = User {
//         id: ObjectId::new(),
//         username: username.to_string(),
//         password_hash,
//         email: email.to_string(),
//     };
    
//     // Insert the user into the collection
//     user_collection.insert_one(&user, None)
//         .await
//         .map_err(|e| e.to_string())?;
    
//     // Return the created user, which includes the ID
//     Ok(user)
// }

pub async fn signup_user(
    user_collection: &Collection<User>,
    username: &str,
    password: &str,
    email: &str,
) -> Result<User, String> { // Return User on success
    let password_hash = hash(password, DEFAULT_COST).map_err(|e| e.to_string())?;
    
    // Create a new user without specifying `id`, MongoDB will generate `_id`
    let user = User {
        id: None,
        username: username.to_string(),
        password_hash,
        email: email.to_string(),
    };
    
    // Insert the user into the collection
    user_collection.insert_one(&user, None)
        .await
        .map_err(|e| e.to_string())?;
    
    // Retrieve the user with MongoDB's generated `_id`
    let inserted_user = user_collection
        .find_one(doc! { "email": email }, None)
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Failed to retrieve user after insertion".to_string())?;
    
    Ok(inserted_user)
}


pub async fn login_user(
    user_collection: &Collection<User>,
    username: &str,
    password: &str,
) -> Result<User, String> { // Return User on success
    // Find the user document by username
    let user_doc = user_collection.find_one(doc! { "username": username }, None)
        .await
        .map_err(|e| e.to_string())?;
    
    // Check if the user exists and if the password is correct
    if let Some(user) = user_doc {
        if verify(password, &user.password_hash).map_err(|e| e.to_string())? {
            // Return the user if authentication is successful
            return Ok(user);
        }
    }
    Err("Invalid username or password".to_string())
}
