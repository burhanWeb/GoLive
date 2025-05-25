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

// Add this route for testing NGINX load balancing
app.get("/", (req, res) => {
  res.send("Hello from " + process.env.HOSTNAME);
});

io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("start-stream", ({ rtmpUrl }) => {
    console.log("Received RTMP URL:", rtmpUrl);

    const options = [
      "-i",
      "pipe:0",
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-tune",
      "zerolatency",
      "-r",
      "25",
      "-g",
      "50",
      "-keyint_min",
      "25",
      "-crf",
      "25",
      "-pix_fmt",
      "yuv420p",
      "-sc_threshold",
      "0",
      "-profile:v",
      "main",
      "-level:v",
      "3.1",
      "-c:a",
      "aac",
      "-ar",
      "44100",
      "-b:a",
      "128k",
      "-f",
      "flv",
      rtmpUrl,
    ];

    const ffmpeg = spawn("ffmpeg", options);

    ffmpeg.stderr.on("data", (data) => {
      console.log(`FFmpeg stderr: ${data}`);
    });

    ffmpeg.on("error", (err) => {
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

    socket.on("disconnect", () => {
      console.log("Client disconnected");
      if (!ffmpeg.killed) {
        ffmpeg.stdin.end();
        ffmpeg.kill("SIGINT");
      }
    });
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server is running on port 3000");
});
