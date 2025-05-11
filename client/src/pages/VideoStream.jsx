import React, { useState, useRef, useEffect } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL);

const VideoStreamSender = () => {
  const [rtmpUrl, setRtmpUrl] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const startStreaming = async () => {
    if (!rtmpUrl) {
      alert("Please enter a valid RTMP URL.");
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    videoRef.current.srcObject = stream;
    socket.emit("start-stream", { rtmpUrl });
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp8,opus",
    });
    mediaRecorder.ondataavailable = async (event) => {
      try {
        const buffer = await event.data.arrayBuffer();
        socket.emit("video-stream", buffer);
      } catch (error) {
        console.error("Error sending video chunk:", err);
      }
    };
    mediaRecorder.start(1000);
    mediaRecorderRef.current = mediaRecorder;
    setIsStreaming(true);
  };

  const stopStreaming = () => {
    const mediaRecorder = mediaRecorderRef.current;
    const stream = videoRef.current?.srcObject;

    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }

    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }

    socket.emit("stop-stream");
    videoRef.current.srcObject = null;
    setIsStreaming(false);
  };

  return (
    <Card
      sx={{
        maxWidth: 600,
        margin: "auto",
        mt: 5,
        p: 2,
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      <CardContent>
        <Typography variant="h5" gutterBottom>
          RTMP Stream & Camera Preview
        </Typography>

        <TextField
          fullWidth
          label="RTMP URL"
          variant="outlined"
          value={rtmpUrl}
          onChange={(e) => setRtmpUrl(e.target.value)}
          sx={{ mb: 2 }}
        />

        <video
          ref={videoRef}
          autoPlay
          muted
          style={{ width: "100%", borderRadius: 8, marginBottom: 16 }}
        />

        {!isStreaming ? (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={startStreaming}
          >
            Start Streaming
          </Button>
        ) : (
          <Button
            variant="contained"
            color="error"
            fullWidth
            onClick={stopStreaming}
          >
            Stop Streaming
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoStreamSender;
