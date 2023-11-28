import {Button, Grid, Typography} from "@mui/material";

const ConnectivityOC = ({sync}: any) => {
    const {usersTimestamp, groupsTimestamp, queryUsers, queryGroups} = sync;

    const convertToReadableTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    const nextUpdateTime = (timestamp: number) => {
        return new Date(timestamp + 1000 * 60 * 10).toLocaleString(); // 10 minutes later
    };

    return (
        <Grid container direction="column" justifyContent="center" alignItems="center">
            <Grid item>
                <Typography variant="h4">סטטוס קישוריות synch</Typography>
            </Grid>
            <Grid item>
                <Typography>סנכרון משתמשים אחרון: {convertToReadableTime(usersTimestamp)}</Typography>
            </Grid>
            <Grid item>
                <Typography>סנכרון משתמשים הבא צפוי ב: {nextUpdateTime(usersTimestamp)}</Typography>
            </Grid>
            <Grid item>
                <Button variant="contained" onClick={queryUsers}>סנכרן משתמשים כעת</Button>
            </Grid>
            <Grid item>
                <Typography>סנכרון קבוצות אחרון: {convertToReadableTime(groupsTimestamp)}</Typography>
            </Grid>
            <Grid item>
                <Typography>סנכרון קבוצות הבא צפוי ב: {nextUpdateTime(groupsTimestamp)}</Typography>
            </Grid>
            <Grid item>
                <Button variant="contained" onClick={queryGroups}>סנכרן קבוצות כעת</Button>
            </Grid>
        </Grid>
    );
};

export default ConnectivityOC;
