import express from "express";

import { s3, bucket, upload } from "./middleware/bucket.js";

const startServer = async () => {
  const app = express();

  app.use(express.json());

  app.get("/", (req, res) => {
    return res.json({ message: "Hello World" });
  });

  app.post("/upload", upload.single("file"), (req, res) => {
    return res.json({ message: req.file.location });
  });

  app.delete("/remove/:key", async (req, res) => {
    const params = { Bucket: bucket, Key: req.params.key };

    let file

    try {
      file = await s3.headObject(params).promise();
    } catch (error) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file) {
      try {
        await s3.deleteObject(params).promise();
      } catch (error) {
        return res.status(500).json({ message: "Could not delete file" });
      }
    }

    return res.json({ message: "File deleted" });
  });

  return app;
};

startServer()
  .then((app) => app.listen(3333))
  .catch(console.error);
