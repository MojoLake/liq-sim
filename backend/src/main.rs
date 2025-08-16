use axum::{
    routing::get,
    Router,
};
use tower_http::services::ServeDir;
use axum::routing::get_service;

#[tokio::main]
async fn main() {
    let static_service = get_service(ServeDir::new("./static"));

    let app = Router::new()
        .fallback_service(static_service);

    let listener = tokio::net::TcpListener::bind("localhost:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn get_health() {
    println!("i'm healthy mom!");
}
