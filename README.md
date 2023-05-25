## This porject is related to Nodejs. 
# Involves CRUD operation using express and having JWT authentication
# EndPoint Details
Home Page: http://localhost:5000/www.tcs.com/
Register Page:http://localhost:5000/www.tcs.com/api/register
Login Page:http://localhost:5000/www.tcs.com/api/login
Update Page:http://localhost:5000/www.tcs.com/api/update/  pass employee id in the end of the endpiont which you have to update
Delete Page:http://localhost:5000/www.tcs.com/api/delete/ pass employee id in the end of the endpiont which you have to delete
List Page:http://localhost:5000/www.tcs.com/api/allemps/ 

# Run command
npm start

# Payload Details
Use payload which I have added in payload.txt file or you can make a custom payload by taking our payload as a reference.

# Authentication Details
Implemented Basic auth protection for Update,Delete and List Page
Use: In Header section,
Key: Authorization 
Value: Bearer <<access_token>>
