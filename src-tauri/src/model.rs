// // src-tauri/src/model.rs
// use serde::{Deserialize, Serialize};
// use mongodb::bson::oid::ObjectId;

// #[derive(Debug, Serialize, Deserialize)]
// pub struct User {
//     pub id: ObjectId,
//     pub username: String,
//     pub password_hash: String,
//     pub email: String,
// }

use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>, // Make `id` an Option to handle documents without an ID
    pub username: String,
    pub password_hash: String,
    pub email: String,
}
