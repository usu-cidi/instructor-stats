require('dotenv').config();
const axios = require('axios');

const KEY = process.env.KEY; //your canvas API key
const BASE_URL = "https://usu.instructure.com/api/v1/";
const AUTH = `?access_token=${KEY}`;

const INSTRUCT_ID = '54650'; //the instructor's canvas id
const NUM_COURSES_TAUGHT = '90'; //an upper limit of courses the instructor is part in (not necessarily as instructor)
const COURSE_CODE_LEN = 9; //the length of the course code (before XL if it was cross listed)

compileData()
    .then(data => {
        //console.log(data);

        let totalSecs = 0;
        let totalStudents = 0;

        for (const key in data) {
            console.log(`${key}:\n  Total sections: ${data[key].totalSecs} sections, ${data[key].totalStudents} students`);
            console.log(`    Traditional: ${data[key]["Traditional"].sections} sections, ${data[key]["Traditional"].students} students`);
            console.log(`    Online: ${data[key]["Online"].sections} sections, ${data[key]["Online"].students} students`);
            console.log(`    Broadcast: ${data[key]["Broadcast"].sections} sections, ${data[key]["Broadcast"].students} students`);
            console.log(`    Blended:  ${data[key]["Blended"].sections} sections, ${data[key]["Blended"].students} students`);

            totalSecs += data[key].totalSecs;
            totalStudents += data[key].totalStudents;
        }

        console.log(`Total number of sections: ${totalSecs}`);
        console.log(`Total number of students: ${totalStudents}`);
    });

async function compileData() {
    return getData()
        .then(r => {
            //console.log(r);

            let results = {};

            for (let i = 0; i < r.length; i++) {
                let startingIndex = r[i].name.indexOf("ENGL"); //getting the starting index of the course code
                let courseName = r[i].name.substring(startingIndex, startingIndex + COURSE_CODE_LEN);
                if (results.hasOwnProperty(courseName)) {
                    //console.log("We already have a spot for " + courseName);
                    results[courseName].totalSecs++;
                    results[courseName].totalStudents += r[i].students;
                    results[courseName][r[i].type].sections++;
                    results[courseName][r[i].type].students += r[i].students;
                } else {
                    //console.log("We're creating a spot for " + courseName);
                    results[courseName] = {
                        totalSecs: 1,
                        totalStudents: r[i].students,
                        "Traditional": {sections: 0, students: 0},
                        "Online": {sections: 0, students: 0},
                        "Broadcast": {sections: 0, students: 0},
                        "Blended": {sections: 0, students: 0},
                    }
                    results[courseName][r[i].type].sections++;
                    results[courseName][r[i].type].students += r[i].students;
                }
            }

            //console.log(results);
            return results
        });
}

async function getData() {
    let courses = [];
    return getCanvasData(`users/${INSTRUCT_ID}/courses`, 1, `include[]=total_students&include[]=teachers&include[]=term`)
        .then(r => {
            let response = r.data;
            //console.log(r.link); //for pagination, if you want to do that instead of just increasing the number per page
            for (let i = 0; i < response.length; i++) {
                //console.log(`${response[i].name}: ${response[i].total_students} students`);
                //console.log(`Teachers: ${JSON.stringify(response[i].teachers)}`)
                if (ALLOWED_TERMS.includes(response[i].term.name) && response[i].name.includes("ENGL")) {
                    //^^only specific terms and ENGL courses
                    for (let j = 0; j < response[i].teachers.length; j++) { //looking through the listed teachers and adding if this instructor is one of them
                        if (response[i].teachers[j].id == INSTRUCT_ID) {
                            courses.push({name: response[i].name,
                                students: response[i].total_students,
                                type: getDeliveryMethod(response[i].name),
                                date: response[i].start_at});
                            break;
                        }
                    }
                } else {
                    //console.log(response[i].name + " thrown out.");
                }
            }

            //console.log(courses);
            return courses;
        });
}

function getDeliveryMethod(name) {
    let code;
    if (name.substring(name.length - 2) === "XL") { //getting section code if course was cross listed
        code = name.substring(name.length - 5, name.length - 4);
    } else { //getting section code if course was not cross listed
        code = name.substring(name.length - 2, name.length - 1);
    }
    if (!isNaN(code) || code === "T") {
        /*blended/hybrid courses have the same section codes as traditional/face-to-face courses,
        so I had the script list the names of the traditional courses and manually checked which
        ones were blended, then hard coded it in.*/
        //console.log(name);
        if (name === "Sp16 ENGL-2010-BT1") {
            return "Blended";
        }
        return "Traditional";
    } else if (code === "B") {
        return "Broadcast";
    } else if (code === "O") {
        return "Online";
    } else {
        console.log(`Unsure.... ${name}`);
        return name;
    }
}

async function getCanvasData(url, page, param="") {
    return axios.get(`${BASE_URL}${url}${AUTH}&${param}&page=${page}&per_page=${NUM_COURSES_TAUGHT}`)
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

