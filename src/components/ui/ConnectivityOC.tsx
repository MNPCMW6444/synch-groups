import {useEffect, useState} from 'react';
import {Button, Card, CardContent, CardActions, Grid, Typography} from "@mui/material";
import {Close, Info, OpenInNew, Warning} from "@mui/icons-material";
import styled from "@emotion/styled";
import {POLLING_INTERVAL} from "../../hooks/useSync.ts";

const ConnectivityOC = ({synch}: any) => {
    const {usersTimestamp, groupsTimestamp, queryUsers, queryGroups} = synch;
    const [sync, setSync] = useState(false);

    useEffect(() => {
        const check = () => {
            const now = Date.now()
            const allowed = 1000 * 120;
            const usersDelay = now - usersTimestamp;
            const groupsDelay = now - groupsTimestamp;
            setSync(usersDelay < allowed && groupsDelay < allowed);
        }
        check();
        const checkI = setInterval(() => check(), 10000)
        return () => clearInterval(checkI);
    }, [usersTimestamp, groupsTimestamp]);

    const [isExpanded, setIsExpanded] = useState(false);

    const convertToReadableTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    const nextUpdateTime = (timestamp: number) => {
        return new Date(timestamp + POLLING_INTERVAL).toLocaleString(); // 10 minutes later
    };

    const toggleExpansion = () => {
        setIsExpanded(!isExpanded);
    };

    const ColoredTypography = styled(({sync, ...otherProps}: any) => <Typography
        fontFamily="Fredoka" {...otherProps} />)<{ sync: boolean }>`
      color: ${props => props.sync ? "green" : "red"};
    `;

    return (
        <Card>
            <CardContent>
                <Grid container alignItems="center" columnSpacing={1} onClick={toggleExpansion}>
                    <Grid item><Info/></Grid>
                    <Grid item><ColoredTypography sync={sync} variant="h4" gutterBottom>סטטוס קישוריות
                        synch</ColoredTypography></Grid>
                    <Grid item> {isExpanded ? <Close sx={{color: "blue"}}/> : <OpenInNew sx={{color: "blue"}}/>}</Grid>
                </Grid>
                {isExpanded && (
                    <Grid container direction="column" spacing={2}>
                        <Grid item>
                            <ColoredTypography sync={sync}>סנכרון משתמשים
                                אחרון: {convertToReadableTime(usersTimestamp)}</ColoredTypography>
                        </Grid>
                        <Grid item>
                            <ColoredTypography sync={sync}>סנכרון משתמשים הבא צפוי
                                ב: {nextUpdateTime(usersTimestamp)}</ColoredTypography>
                        </Grid>
                        <Grid item>
                            <ColoredTypography sync={sync}>סנכרון קבוצות
                                אחרון: {convertToReadableTime(groupsTimestamp)}</ColoredTypography>
                        </Grid>
                        <Grid item>
                            <ColoredTypography sync={sync}>סנכרון קבוצות הבא צפוי
                                ב: {nextUpdateTime(groupsTimestamp)}</ColoredTypography>
                        </Grid>
                        {!sync && <Grid item>
                            <ColoredTypography sync={sync}><Warning/> חוסר סנכרון עם synch מעל 2
                                דקות</ColoredTypography>
                        </Grid>}

                    </Grid>
                )}
            </CardContent>
            {isExpanded && (
                <CardActions>
                    <Grid container columnSpacing={2} justifyContent="center">
                        <Grid item> <Button variant="contained" onClick={queryUsers}>סנכרן משתמשים כעת</Button>
                        </Grid>
                        <Grid item> <Button variant="contained" onClick={queryGroups}>סנכרן קבוצות כעת</Button>
                        </Grid>
                        <Grid item> <Button variant="contained" onClick={() => {
                            queryGroups();
                            queryUsers();
                        }}>סנכרן הכל כעת</Button>
                        </Grid>
                    </Grid>
                </CardActions>
            )}
        </Card>
    );
};

export default ConnectivityOC;
