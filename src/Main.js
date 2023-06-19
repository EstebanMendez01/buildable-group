import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Box } from "@mui/system";


export default function Main({user, handleLogout}) {
    return (
        <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              AWS Cognito
            </Typography>

            <Typography sx={{mr: 1}} color="inherit">Hello, {user.getUsername()}</Typography>
            <Button variant="outlined" color="inherit" onClick={handleLogout}>Logout</Button>
          </Toolbar>
        </AppBar>
        <Typography variant="h2">Buildable</Typography>
      </Box>
    )
}