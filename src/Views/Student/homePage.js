
import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import logo from "assets/img/LogoText.png";
import firebase from 'Config/fire';

// material-ui icons
import Assignment from "@material-ui/icons/Assignment";
import Edit from "@material-ui/icons/Edit";
import Close from "@material-ui/icons/Close";

// core components
import GridContainer from "Components/Grid/GridContainer.js";
import GridItem from "Components/Grid/GridItem.js";
import Table from "Components/Table/Table.js";
import Button from "Components/CustomButtons/Button.js";
import Card from "Components/Card/Card.js";
import CardBody from "Components/Card/CardBody.js";
import CardIcon from "Components/Card/CardIcon.js";
import CardHeader from "Components/Card/CardHeader.js";

import styles from "assets/jss/material-dashboard-pro-react/views/extendedTablesStyle.js";
import {getStudentByUID, cancelLesson} from "Actions/firestore_functions_sutdent";

const useStyles = makeStyles(styles);

export default  function ExtendedTables() {
    const [checked, setChecked] = React.useState(0);
    const [studentData,setStudentData] = React.useState({first_name: '',
        last_name: '',
        email: '',
        credits: 0,
        lessons_this_month: {},
        phone_number: '',
        subscription: '',
        teacher: {},
        uid: ''});

    React.useEffect(() => {

        getStudentByUID(firebase.auth().currentUser.uid).then((res)=>{
            if(res != null){
                setStudentData(res);
            }
            console.log(res);
        })
        },[]);

    const deleteLesson = (line) => {
        let student_mail = studentData.email;
        let teacher_mail = studentData.teacher.email;
        let lesson_date = new Date(line.lesson_date);
        console.log(line);
        cancelLesson(student_mail, teacher_mail, lesson_date)
    }
    const classes = useStyles();

    function getSimpleButtons(line)
    {
        return  [
            {color: "danger", icon: Close, data: line}
        ].map((prop, key) => {
            return (
                <Button
                    color={prop.color}
                    simple
                    className={classes.actionButton}
                    key={key}
                    onClick={() => {
                        //TODO(yuval):
                        //deleteLesson(prop.data); @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                        delete studentData.lessons_this_month[prop.data.index];
                        setChecked(checked+1);
                    }}
                >
                    <prop.icon className={classes.icon}/>
                </Button>
            );
        });
    }
    let lessons = Object.keys(studentData.lessons_this_month).map((lesson_id,index) => {
        let teacher_name = studentData.teacher.first_name + " " + studentData.teacher.last_name;
        let lesson_date = new Date(studentData.lessons_this_month[lesson_id].date_utc.full_date_string).toString().slice(0, 21);
        let duration = studentData.lessons_this_month[lesson_id].duration;
        return (
            [teacher_name, lesson_date, duration,getSimpleButtons({lesson_date: lesson_date, index: lesson_id})]
        );

    });

    return (
        <GridContainer>
            <GridItem>
                <Card style={{margin: 'auto'}}>
                    <img src={logo} alt="..." className={classes.logo} />
                </Card>
                </GridItem>
            <GridItem xs={12}>
                <Card>
                    <CardHeader color="info" icon>
                        <CardIcon color="info">
                            <Assignment />
                        </CardIcon>
                        <h4 className={classes.cardIconTitle}>Next Lessons</h4>
                    </CardHeader>
                    <CardBody>
                        <Table
                            tableHead={[
                                "Teacher",
                                "Date",
                                "Duration",
                                "Cancel Lesson"
                            ]}
                            tableData={
                                lessons
                            }
                        />
                    </CardBody>
                </Card>
            </GridItem>
        </GridContainer>
    );
}
