import { AppBar, Toolbar, Typography, Button, List, ListItem, ListItemText } from "@mui/material";
import { Box } from "@mui/system";
import AWS from 'aws-sdk';

export default function Main({ user, handleLogout }) {
  const listObjects = async () => {
    try {
      AWS.config.update({
        region: "us-east-1",
        credentials: new AWS.CognitoIdentityCredentials({
          IdentityPoolId: "us-east-1_lDGACWtDp",
        }),
      });

      const s3 = new AWS.S3();
      const response = await s3.listObjects({ Bucket: "storage-buildable" }).promise();
      console.log(response.Contents);
    } catch (error) {
      console.error("Error listing objects:", error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AWS Cognito
          </Typography>
          <Typography sx={{ mr: 1 }} color="inherit">
            Hello, {user.getUsername()}
          </Typography>
          <Button variant="outlined" color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Typography variant="h2">Secret Area</Typography>
      <Button variant="outlined" color="primary" onClick={listObjects}>
        List Objects in S3 Bucket
      </Button>
      <List>
        {/* Render the list of objects here */}
      </List>
    </Box>
  );
}
