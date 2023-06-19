import { FormControl, FormLabel, TextField, Button, Box } from '@mui/material';

export default function ConfirmCodeForm({updateState, handleConfirmCode, handleResendCode}) {
    return (
      <Box display={'flex'} flexDirection="column">
        <FormControl>
          <FormLabel>Enter code to confirm</FormLabel>
          <TextField size='small'
            onChange={(event) => updateState({ code: event.target.value })}
          />
        </FormControl>
        <Button sx={{mt: 2}} variant='contained' onClick={handleConfirmCode}>Confirm</Button>
        <Button onClick={handleResendCode}>Resend code</Button>
      </Box>
    );
}