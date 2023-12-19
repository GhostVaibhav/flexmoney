# Yoga Elements

This is a project which is created for submission to Flexmoney.

## Project Architecture

This project consists of three main parts - 
1. The Frontend
2. The Backend (a.k.a the API)
3. The Database

## Technologies Used

### Frontend

- React
- React Router DOM
- Tailwind CSS
- Dotenv
- gh-pages

### Backend

- Express
- CORS
- Dotenv
- body-parser

### Database

- Amazon RDS

## Notes / Approach

### Frontend

- For frontend, I used the React framework in addition to Tailwind CSS. The separate repo containing the frontend is linked [here](https://github.com/GhostVaibhav/flexmoney-frontend/tree/429484c2a1649a82f946fb59ea384d24504da659).
- The server address (**API endpoint**) is provided in the form of a `.env` file which is **recreated through GitHub environment secrets**.
- The whole website is **built through GitHub Actions** and **deployed to a custom subdomain** of my own domain - https://flex.ghostvaibhav.codes
- The deployment is done through **GitHub pages**.
- The website is also using **HTTPs** for secured connections.
- The number of pages are given below in a table format - 

| Pages |
| --- |
| Landing page for filling the form |
| Congratulations on the successful enrollment page with the display of the enrollment ID |
| Making the payment page with the demo CompletePayment() function for completing the payment and displaying the same on completion |
| Change the batch page on the basis of enrollment ID |
| Leave the yoga classes on the basis of enrollment ID |
| Forgot your enrollment ID page (searched through your phone number) |


### Backend

- For backend, I have used `Express` with **CORS**.
- The whole backend is present in the `flexmoney-backend` folder linked [here](https://github.com/GhostVaibhav/flexmoney/tree/master/flexmoney-backend).
- The backend server is hosted on an **EC2 instance** for improved reliability.
- In the server, I have installed `Nginx` as well as `PM2` for different purposes discussed below.
- `PM2` is installed for running the `Express` server in the **background at all times**, even when we have SSH out of the instance.
- `Nginx` is installed for serving as a **reverse proxy**, and instead of serving the traffic directly to server ports, only `Nginx` have access to do that. The other reason is to serve the traffic through a different endpoint other than just an Elastic IP address.
- The API is deployed on a custom subdomain of my own domain - https://api.ghostvaibhav.codes
- The frontend uses this subdomain in its code for retrieving the values from the API.
- Another reason of not using the bare IP was for security reasons, since now, the endpoint for the API is using HTTPs.
- The working of `next_batch` is very trivial - a user while changing their batch will actually change this variable. Upon the end of month, when a regular process finds that a new month has started, it will copy this value to the `batch` variable thereby fixating it.
- Below are the endpoints for the API with their respective explanations -

| Endpoints | Explanation |
| --- | --- |
| /new | for filling up the form and submitting the data |
| /pay | for payment of the dues |
| /change | for changing the batch of a customer |
| /leave | for deleting the customer record |
| /forgot | for getting the enrollment number on the basis of your phone number |
| /getb | getting the current batch of a user |

### Database

- I have used **Amazon RDS** as the SaaS since it was in their free tier and the integration of the backend with the database could smoothen out a bit.
- In the backend, it is a **MySQL database** consisting of three tables namely *user*, *enrollment* and *payments*.
- The columns with their datatypes in all the tables are given below - 
    - *User* table

    | Columns | Datatypes |
    | --- | --- |
    | enrollmentID (`Primary key`) | varchar(64) |
    | name | varchar(250) |
    | age | tinyint |
    | email | varchar(250) |
    | phoneNumber | text |
    | address | varchar(250) |
    | pincode | varchar(6) |
    | batch | varchar(3) |
    | next_batch | varchar(3) |

    - *Enrollment* table

    | Columns | Datatypes |
    | --- | --- |
    | enrollmentID (`Foreign key`) | varchar(64) |
    | phoneNumber (`Primary key`) | text |

    - *Payments* table

    | Columns | Datatypes |
    | --- | --- |
    | enrollmentID (`Foreign key`) | varchar(64) |
    | payDue | tinyint(1) |
    | startingDate | date |

- Also, the ER diagram is given below -


## Assumptions / Future Work

- First thing is to **add a load balancer** to the API endpoint. Instead of making a single instance handle all the requests, we could create a load balancer on that address and let it do it's work. This way we could make our system **highly scalable**.
- Another thing is the **creation of Composite Index** in the database which could decrease the response time of the database under heavy-load.
- We could make a **CodePipeline and CodeCommit cycle** in AWS to automatically pull the latest code from the GitHub and update the process accordingly.
- At EOD, a cron process is ran which scans all the entries and checks if they have any dues left. If they have any dues left and the month is nearing an end, then a **SMS could be triggered**.
- Also, a cron job could be added to check for the end of month. If a month has elapsed from the `startingDate` then - 
    - update the starting_date
    - make pay_due as true (1)
    - update batch to be the next_batch
- **OTP verification** could be implemented when an enrollment ID is lost and needs to be recovered from a phone number.
