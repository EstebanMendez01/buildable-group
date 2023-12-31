import './App.css';
import { Amplify, Auth, Storage } from 'aws-amplify';
import { useEffect, useReducer } from 'react';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Container, Typography } from '@mui/material';
import LoginForm from './loginForm';
import SignupForm from './signupForm';
import ConfirmCodeForm from './confirmCode';
import Main from './Main';
import getCredentials from './token';

function App() {
  const [state, updateState] = useReducer(
    (state, params) => {
      return { ...state, ...params };
    },
    {
      username: '',
      password: '',
      email: '',
      isLogin: true,
      isEnterCode: false,
      error: null,
      loading: false,
      isLoggedIn: false,
      code: null,
      user: null,
    }
  );

  Amplify.Logger.LOG_LEVEL = 'DEBUG';

  useEffect(() => {
    Amplify.configure({
      Auth: {
        identityPoolId: process.env.REACT_APP_AWS_IDENTITY_POOL,
        userPoolWebClientId: process.env.REACT_APP_AWS_USER_POOL_WEB_CLIENT_ID,
        region: process.env.REACT_APP_AWS_REGION,
        userPoolId: process.env.REACT_APP_AWS_USER_POOL_ID,
      },
      Storage: {
        AWSS3: {
          bucket: 'storage-buildable', //REQUIRED -  Amazon S3 bucket name
          region: process.env.REACT_APP_AWS_REGION, //OPTIONAL -  Amazon service region
        },
      },
    });
  }, []);

  const handleSignin = async () => {
    try {
      updateState({ loading: true });
      const user = await Auth.signIn({
        username: state.username,
        password: state.password,
      });

      updateState({
        user: user,
        isLoggedIn: true,
        loading: false,
      });
    } catch (error) {
      updateState({ loading: false });
      const { message, name } = error;

      console.log(error);

      if (name === 'UserNotConfirmedException') {
        updateState({ isEnterCode: true });
      }

      updateState({
        error: message,
      });
    }
  };

  const handleSignup = async () => {
    try {
      updateState({ loading: true });
      const signupResult = await Auth.signUp({
        username: state.username,
        password: state.password,
        attributes: {
          email: state.email,
        },
      });

      console.log(signupResult);

      if (!signupResult.userConfirmed) {
        updateState({ user: signupResult.user, loading: false, isEnterCode: true, isLogin: true });
      } else {
        updateState({ loading: false, isLogin: true });
      }
    } catch (error) {
      updateState({ loading: false });
      const { message } = error;
      if (message) {
        updateState({
          error: message,
        });
      }
      console.log(error);
    }
  };

  const handleConfirmCode = async () => {
    try {
      updateState({ loading: true });

      const confirmSignUpResult = await Auth.confirmSignUp(state.username, state.code);

      if (confirmSignUpResult) updateState({ loading: false, isEnterCode: false });
    } catch (error) {
      updateState({ loading: false });
      const { message } = error;

      updateState({
        error: message,
      });

      console.log(error);
    }
  };

  const handleResendCode = async () => {
    try {
      updateState({ loading: true });

      const resendResult = await Auth.resendSignUp(state.username);
      updateState({ loading: false });

      console.log(resendResult);
    } catch (error) {
      updateState({ loading: false });
      const { message } = error;

      updateState({
        error: message,
      });

      console.log(error);
    }
  };

  const handleLogout = () => {
    try {
      if (state.user) {
        state.user.signOut(() => {
          updateState({ isLoggedIn: false, user: null });
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const uploadFile = async () => {
    try {
      const credentials = getCredentials();
      await Storage.put('myFile.txt', 'Hello, World!', {
        level: 'private',
        contentType: 'text/plain',
        identityId: credentials.identityId,
      });
      console.log('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <Container>
      {state.isLoggedIn ? (
        <Main user={state.user} handleLogout={handleLogout} />
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center">
          <Card elevation={2} sx={{ background: '#fff', width: 400, marginTop: 10 }}>
            {state.loading ? (
              <CircularProgress />
            ) : (
              <CardContent sx={{ p: 2 }}>
                {state.error && (
                  <Alert
                    onClose={() => {
                      updateState({ error: null });
                    }}
                    severity="error"
                  >
                    {state.error}
                  </Alert>
                )}
                {state.isLogin ? (
                  state.isEnterCode ? (
                    <ConfirmCodeForm
                      updateState={updateState}
                      handleConfirmCode={handleConfirmCode}
                      handleResendCode={handleResendCode}
                    />
                  ) : (
                    <LoginForm
                      handleConfirmCode={handleConfirmCode}
                      updateState={updateState}
                      handleSignin={handleSignin}
                    />
                  )
                ) : (
                  <SignupForm updateState={updateState} handleSignup={handleSignup} />
                )}

                <Box display="flex" sx={{ mt: 2 }}>
                  {state.isLogin ? (
                    <Typography variant="caption">
                      Don't have an account{' '}
                      <Button onClick={() => updateState({ isLogin: false })}>Sign up</Button>
                    </Typography>
                  ) : (
                    <Typography variant="caption">
                      Already have an account{' '}
                      <Button onClick={() => updateState({ isLogin: true })}>Sign in</Button>
                    </Typography>
                  )}
                </Box>
              </CardContent>
            )}
          </Card>
        </Box>
      )}
    </Container>
  );
}

export default App;
