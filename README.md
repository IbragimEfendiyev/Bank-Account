Asd
## Bank Account Application

## Description
This is a simple bank account application where users can log in and manage their accounts. Each user can create up to three cards. Users can transfer money between cards, top up balances, and make payments, including utility payments.
Each card has its own transaction history where users can see transfers, payments, and top-ups.

## ✅ Key API Features
## 🛡️ Security and Authentication
  Authentication/Authorization: Implemented via Spring Security using JWT (JSON Web Tokens).  
  Role-Based Access: Clear separation of rights between ADMIN and USER roles.  
  Data Encryption: Card numbers and CVVs are stored in the database in encrypted form.  
  Masking: Card numbers are displayed to users in a masked format (e.g., **** **** **** 1234).  

## 👤 User Functionality (USER)
  View a list of own cards with filtering and pagination.  
  Check own card balance.  
  Transfer funds between own cards.  
  Create a new card.  
  
## 👑 Admin Functionality (ADMIN)
  Manage card statuses (Activation, Blocking).  
  Manage card (view, update, delete).  

## Technologies
Java  
Spring Boot  
Docker  
MySQL  
React  

## How to Run

Clone the repository: https://github.com/IbragimEfendiyev/Bank-Account.git  
Run Docker: docker compose up --build  
Open the application: http://localhost:3000/  

ADMIN-ACCOUNT-NAME: admin  
PASSWORD: Admin12345!

## Author
Ibragim Efendiyev
