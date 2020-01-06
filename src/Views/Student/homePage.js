// import React from 'react'
//
// const Home = () => {
//     return (
//         <div>
//             <div className="container">
//                 <h4 className="center">Home Page</h4>
//                 <p>bla bla</p>
//             </div>
//         </div>
//     )
// }
//
// export default Home


import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Checkbox from "@material-ui/core/Checkbox";

// material-ui icons
import Assignment from "@material-ui/icons/Assignment";
import Person from "@material-ui/icons/Person";
import Edit from "@material-ui/icons/Edit";
import Close from "@material-ui/icons/Close";
import Check from "@material-ui/icons/Check";
import Remove from "@material-ui/icons/Remove";
import Add from "@material-ui/icons/Add";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";

// core components
import GridItem from "../../components/Grid/GridItem.js";
import Table from "../../components/Table/Table.js";
import Button from "../../components/CustomButtons/Button.js";
import Card from "../../components/Card/Card.js";
import CardBody from "../../components/Card/CardBody.js";
import CardIcon from "../../components/Card/CardIcon.js";
import CardHeader from "../../components/Card/CardHeader.js";

import styles from "../../Layouts/extendedTablesStyle";

const useStyles = makeStyles(styles);

export default function ExtendedTables() {
    const [checked, setChecked] = React.useState([]);
    const handleToggle = value => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }
        setChecked(newChecked);
    };
    const classes = useStyles();
    const fillButtons = [
        { color: "info", icon: Person },
        { color: "success", icon: Edit },
        { color: "danger", icon: Close }
    ].map((prop, key) => {
        return (
            <Button color={prop.color} className={classes.actionButton} key={key}>
                <prop.icon className={classes.icon} />
            </Button>
        );
    });
    const simpleButtons = [
        { color: "info", icon: Person },
        { color: "success", icon: Edit },
        { color: "danger", icon: Close }
    ].map((prop, key) => {
        return (
            <Button
                color={prop.color}
                simple
                className={classes.actionButton}
                key={key}
            >
                <prop.icon className={classes.icon} />
            </Button>
        );
    });
    const roundButtons = [
        { color: "info", icon: Person },
        { color: "success", icon: Edit },
        { color: "danger", icon: Close }
    ].map((prop, key) => {
        return (
            <Button
                round
                color={prop.color}
                className={classes.actionButton + " " + classes.actionButtonRound}
                key={key}
            >
                <prop.icon className={classes.icon} />
            </Button>
        );
    });
    return (
        <GridContainer>
            <GridItem xs={12}>
                <Card>
                    <CardHeader color="rose" icon>
                        <CardIcon color="rose">
                            <Assignment />
                        </CardIcon>
                        <h4 className={classes.cardIconTitle}>Simple Table</h4>
                    </CardHeader>
                    <CardBody>
                        <Table
                            tableHead={[
                                "#",
                                "Name",
                                "Job Position",
                                "Since",
                                "Salary",
                                "Actions"
                            ]}
                            tableData={[
                                [
                                    "1",
                                    "Andrew Mike",
                                    "Develop",
                                    "2013",
                                    "€ 99,225",
                                    fillButtons
                                ],
                                ["2", "John Doe", "Design", "2012", "€ 89,241", roundButtons],
                                ["3", "Alex Mike", "Design", "2010", "€ 92,144", simpleButtons],
                                [
                                    "4",
                                    "Mike Monday",
                                    "Marketing",
                                    "2013",
                                    "€ 49,990",
                                    roundButtons
                                ],
                                [
                                    "5",
                                    "Paul Dickens",
                                    "Communication",
                                    "2015",
                                    "€ 69,201",
                                    fillButtons
                                ]
                            ]}
                            customCellClasses={[classes.center, classes.right, classes.right]}
                            customClassesForCells={[0, 4, 5]}
                            customHeadCellClasses={[
                                classes.center,
                                classes.right,
                                classes.right
                            ]}
                            customHeadClassesForCells={[0, 4, 5]}
                        />
                    </CardBody>
                </Card>
            </GridItem>
        </GridContainer>
    );
}
