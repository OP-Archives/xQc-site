import { useMemo } from "react";
import debounce from "lodash.debounce";
import { Box, Modal, Typography, TextField, InputAdornment, FormGroup, FormControlLabel, Checkbox } from "@mui/material";

export default function Settings(props) {
  const { userChatDelay, setUserChatDelay, showModal, setShowModal, showTimestamp, setShowTimestamp } = props;

  const delayChange = useMemo(
    () =>
      debounce((evt) => {
        if (evt.target.value.length === 0) return;
        const value = Number(evt.target.value);
        if (isNaN(value)) return;
        setUserChatDelay(value);
      }, 300),
    [setUserChatDelay]
  );

  return (
    <Modal open={showModal} onClose={() => setShowModal(false)}>
      <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 350, bgcolor: "background.paper", border: "2px solid #000", boxShadow: 24, p: 4 }}>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", width: "100%" }}>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Typography variant="h6">Playback Settings</Typography>
          </Box>
          <Box sx={{ mt: 2 }}>
            <TextField
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              InputProps={{
                endAdornment: <InputAdornment position="start">secs</InputAdornment>,
              }}
              fullWidth
              label="Chat Delay"
              size="small"
              type="number"
              onChange={delayChange}
              defaultValue={userChatDelay}
              onFocus={(evt) => evt.target.select()}
            />
          </Box>
        </Box>

        <FormGroup sx={{ mt: 2 }}>
          <FormControlLabel control={<Checkbox checked={showTimestamp} onChange={() => setShowTimestamp(!showTimestamp)} />} label="Show Timestamps" />
        </FormGroup>
      </Box>
    </Modal>
  );
}
