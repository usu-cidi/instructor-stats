require('dotenv').config();
const axios = require('axios');

const KEY = process.env.KEY;
const BASE_URL = "https://usu.instructure.com/api/v1/";
const AUTH = `?access_token=${KEY}`;

const INSTRUCT_ID = '54650';


async function getData() {
    let courses = [];
    getCanvasData(`users/${INSTRUCT_ID}/courses`, 1, `include[]=total_students&include[]=teachers&include[]=term`)
        .then(r => {
            let response = r.data;
            console.log(r.link);
            for (let i = 0; i < response.length; i++) {
                //console.log(`${response[i].name}: ${response[i].total_students} students`);
                //console.log(`Teachers: ${JSON.stringify(response[i].teachers)}`)
                if (ALLOWED_TERMS.includes(response[i].term.name)) {
                    for (let j = 0; j < response[i].teachers.length; j++) {
                        if (response[i].teachers[j].id == INSTRUCT_ID) {
                            courses.push({name: response[i].name, students: response[i].total_students, type: "", date: response[i].start_at});
                            break;
                        }
                    }
                } else {
                    console.log(response[i].term.name + " thrown out.");
                }
            }

            console.log(courses);
            return courses;
        });
}

async function getCanvasData(url, page, param="") {
    return axios.get(`${BASE_URL}${url}${AUTH}&${param}&page=${page}&per_page=90`)
        .then(response => {
            return {data: response.data, link: response.headers.link};
        })
        .catch(err => {
            console.log(err.message);
        });
}

const ALLOWED_TERMS = [
    "Fall 2013", "Spring 2014", "Summer 2014", "Fall 2014", "Spring 2015", "Summer 2015",
    "Fall 2015", "Spring 2016", "Summer 2016", "Fall 2016", "Spring 2017", "Summer 2017",
    "Fall 2017", "Spring 2018", "Summer 2018", "Fall 2018", "Spring 2019", "Summer 2019",
    "Fall 2019", "Spring 2020", "Summer 2020", "Fall 2020", "Spring 2021", "Summer 2021",
    "Fall 2021", "Spring 2022", "Summer 2022", "Fall 2022", "Spring 2023", "Summer 2023",
    "Fall 2023"
]

