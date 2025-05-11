import http from "http";
import express from "express";
import { Server as SocketIO } from "socket.io";
import { spawn } from "child_process";

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("start-stream", ({ rtmpUrl }) => {
    console.log("Received RTMP URL:", rtmpUrl);

    // FFmpeg options for streaming to the RTMP URL
    const options = [
      "-i",
      "pipe:0", // Read video data from stdin
      "-c:v",
      "libx264", // Video codec (H.264)
      "-preset",
      "ultrafast", // Encoding speed
      "-tune",
      "zerolatency", // Real-time streaming
      "-r",
      "25", // Frame rate
      "-g",
      "50", // GOP size (2 seconds)
      "-keyint_min",
      "25", // Minimum GOP size (1 second)
      "-crf",
      "25", // Constant rate factor (quality)
      "-pix_fmt",
      "yuv420p", // Pixel format for compatibility
      "-sc_threshold",
      "0", // Disable scene cut detection
      "-profile:v",
      "main", // H.264 profile
      "-level:v",
      "3.1", // H.264 level
      "-c:a",
      "aac", // Audio codec (AAC)
      "-ar",
      "44100", // Audio sample rate
      "-b:a",
      "128k", // Audio bitrate
      "-f",
      "flv", // Output format (FLV for RTMP)
      rtmpUrl, // The RTMP URL for the stream
    ];

    // Start the FFmpeg process
    const ffmpeg = spawn("ffmpeg", options);

    ffmpeg.stderr.on("data", (data) => {
      console.log(`FFmpeg stderr: ${data}`);
    });

    ffmpeg.stderr.on("error", (err) => {
      console.error("FFmpeg error:", err);
    });

    ffmpeg.on("close", (code) => {
      console.log(`FFmpeg process exited with code ${code}`);
      if (code !== 0) {
        console.error("FFmpeg process exited with an error");
      }
    });

    socket.on("video-stream", (data) => {
      ffmpeg.stdin.write(data, (err) => {
        if (err) {
          console.error("Error writing to ffmpeg stdin", err);
        }
      });
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
