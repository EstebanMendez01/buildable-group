import AWS from 'aws-sdk';

const getCredentials = () => {
  // Set the region where your identity pool exists (us-east-1, eu-west-1)
  AWS.config.region = 'us-east-1';

  // Configure the credentials provider to use your identity pool
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: process.env.REACT_APP_AWS_IDENTITY_POOL,
  });

  return AWS.config.credentials;
};

export default getCredentials;
