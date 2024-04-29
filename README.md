# Instructor Stats Project
* Developed by Emma Lynn (e.lynn@usu.edu)
* Supervised by Neal Legler, CIDI Director (neal.legler@usu.edu)
* On request from Nikole Eyre, Senior Lecturer - English Department

Generates a report of all the courses an instructor has taught in the past 10 years, divided by
course and delivery method. 

Note: This script is very specific to pulling the data we needed in this case, but it would be very easy to adapt
it for another instructor's use case.

## Usage
* Create a file named `.env`
* Put the text `KEY=”your canvas API key”` in the file, filling in your Canvas API key
* Run `npm install axios`
* Run `npm install dotenv`
* Run the script with `node script.js`
