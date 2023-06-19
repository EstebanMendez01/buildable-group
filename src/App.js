import './App.css';
import { Amplify, Auth } from 'aws-amplify';
import { useEffect, useReducer } from 'react';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Container, FormControl, FormLabel, Input, Typography } from '@mui/material';
import LoginForm from './loginForm';
import SignupForm from './signupForm';
import ConfirmCodeForm from './confirmCode';
import Main from './Main';
import { token } from './token';


function App() {

  const [state, updateState] = useReducer((state, params) => {
    return {...state, ...params}
  },{
    username: '',
    password: '',
    email: '',
    isLogin: true,
    isEnterCode: false,
    error: null,
    loading: false,
    isLoggedIn: false,
    code: null,
    user: null
  });

  useEffect(() => {
    //const currentConfig = Auth.configure();
    
    Amplify.configure({      
      Auth: {
        identityPoolId: "us-east-1_lDGACWtDp",
        userPoolWebClientId: 'jgnrn664ie0saa5a2hdega031',
        region: "us-east-1",
        userPoolId: "us-east-1_lDGACWtDp",
      },
    });
  },[]);

  const handleSignin= async () => {
    try {
      updateState({loading: true});
      const user = await Auth.signIn({        
        username: state.username,
        password: state.password,
      });
      
      updateState({user: user, isLoggedIn: true, loading: false});

    } catch (error) {
      updateState({ loading: false });
      const { message, name } = error;

      console.log(error);

      if (name === "UserNotConfirmedException") {
        updateState({ isEnterCode: true });
      }

      updateState({
        error: message,
      });

    }
  }

  const handleSignup= async () => {
    try {
      updateState({loading: true});
      const signupResult = await Auth.signUp({
        username: state.username,
        password: state.password,
        attributes: {
          email: state.email
        }
      });

      console.log(signupResult);      
      
      if( !signupResult.userConfirmed ) 
        updateState({user: signupResult.user, loading: false, isEnterCode: true, isLogin: true});
      else {
        updateState({loading: false, isLogin: true});
      }
    } catch (error) {
      updateState({loading: false});
      const {message} = error;
      if( message ) {
        updateState({
          error: message
        });
      }
      console.log(error)
    }
  }

  const handleConfirmCode = async () => {
    try {
      updateState({loading: true});
      
      const  confirmSignUpResult  = await Auth.confirmSignUp(
        state.username,   
        state.code,             
      );

      if( confirmSignUpResult )
        updateState({loading: false, isEnterCode: false});

    } catch (error) {
      updateState({ loading: false });
      const { message } = error;

      updateState({
        error: message,
      });

      console.log(error);
    }
  }

  const handleResendCode = async () => {
    try {
      updateState({loading: true});

      const resendResult  = await Auth.resendSignUp(state.username);
      updateState({loading: false});

      console.log(resendResult);
    } catch (error) {
      updateState({ loading: false });
      const { message } = error;

      updateState({
        error: message,
      });

      console.log(error);
    }
  }

  const handleLogout = () => {
    try {
      if( state.user ) {
        state.user.signOut(() => {
          updateState({ isLoggedIn: false, user: null });
        });
      }
    } catch (error) {
      console.log(error)
    }
    
  };

  return (
    <Container>
      {state.isLoggedIn ? (
        <Main user={state.user} handleLogout={handleLogout} />
      ) : (
        <Box display={"flex"} justifyContent="center" alignitems={"center"}>
          <Card
            elevation={2}
            display={"flex"}
            flexdirection="column"
            alignitems="center"
            sx={{ background: "#fff", width: 400, marginTop: 10 }}
          >
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
                  <SignupForm
                    updateState={updateState}
                    handleSignup={handleSignup}
                  />
                )}

                <Box display={"flex"} sx={{ mt: 2 }}>
                  {state.isLogin ? (
                    <Typography variant="caption">
                      Don't have an account{" "}
                      <Button hidden onClick={() => updateState({ isLogin: false })}>
                        Sign up
                      </Button>
                    </Typography>
                  ) : (
                    <Typography variant="caption">
                      Already have an account{" "}
                      <Button onClick={() => updateState({ isLogin: true })}>
                        Sign in
                      </Button>
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
