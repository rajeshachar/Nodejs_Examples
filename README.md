# This porject is related to Nodejs. 
## Involves CRUD operation using express and having JWT authentication
### EndPoint Details
Home Page: http://localhost:5000/www.tcs.com/

Register Page:http://localhost:5000/www.tcs.com/api/register

Login Page:http://localhost:5000/www.tcs.com/api/login

Update Page:http://localhost:5000/www.tcs.com/api/update/  pass employee id in the end of the endpiont which you have to update

Delete Page:http://localhost:5000/www.tcs.com/api/delete/ pass employee id in the end of the endpiont which you have to delete

List Page:http://localhost:5000/www.tcs.com/api/allemps/ 

Admin Home Page:http://localhost:5000/www.tcs.com/api/admin

Admin Login Page:http://localhost:5000/www.tcs.com/api/admin/login

### Run command
Step 1: Open Terminal 
Step 2: Change directory to myapp using below command 
cd myapp
Step 3: type below command
npm start

### Payload Details
Use payload which I have added in **payload.txt** file or you can make a custom payload by taking our payload as a reference.

### Authentication Details
Implemented JWT auth protection using passort js for Home,Update,Delete,List and Admin Home Page
Use: In Postman Click on Headers tab,
Key: Authorization 
Value: Bearer <<access_token>>
**OR**
In Postman Click on Authorization tab,
Select **Bearer Token** from the dropdown and enter the <<access_token>>

### Admin Details
Username: admin
Password: admin@5454
**Note:**To change admin password
 Go to https://www.browserling.com/tools/bcrypt 
 Enter your new password and click on bcrypt
 copy encrypted password and paste it as value of password under /myapp/database/admin.json
