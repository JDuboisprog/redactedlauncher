"use client";

import { Amplify } from "aws-amplify";
import { publicEnv } from "@/lib/env";

let configured = false;

export function ensureAmplifyConfigured() {
  if (configured) return;

<<<<<<< HEAD
  const { awsRegion, amplifyIdentityPoolId, amplifyBucket } = publicEnv;
=======
  const { awsRegion, amplifyIdentityPoolId, amplifyBucket, amplifyBucketPrefix } =
    publicEnv;
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)

  if (!awsRegion || !amplifyIdentityPoolId || !amplifyBucket) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "Amplify Storage is not configured because required env vars are missing."
      );
    }
    configured = true;
    return;
  }

  Amplify.configure({
    Auth: {
<<<<<<< HEAD
      Cognito: {
        identityPoolId: amplifyIdentityPoolId,
        identityPoolRegion: awsRegion,
      },
    },
    Storage: {
      S3: {
        bucket: amplifyBucket,
        region: awsRegion,
        defaultAccessLevel: "guest",
=======
      region: awsRegion,
      identityPoolId: amplifyIdentityPoolId,
      identityPoolRegion: awsRegion,
    },
    Storage: {
      region: awsRegion,
      bucket: amplifyBucket,
      defaultAccessLevel: "guest",
      customPrefix: {
        public: amplifyBucketPrefix ?? "public/",
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
      },
    },
  });

  configured = true;
}

