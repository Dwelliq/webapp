import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  listingPhotos: f({ image: { maxFileSize: "8MB", maxFileCount: 30 } })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete, file url:", file.url);
      return { uploaded: true };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

