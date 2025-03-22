import { auth } from "@/auth";
import { db } from "@/db";
import { userProfile } from "@/db/schema";
import { convertRepToStar } from "@/lib/rep_system/repConversions";
import { fetchUserElo, updateUserElo } from "@/lib/rep_system/updateRep";
import { eq, not, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

// Maximum allowed size for avatar data (1MB in base64 is roughly 1.33MB)
const MAX_AVATAR_SIZE = 1.5 * 1024 * 1024; // 1.5MB

const AddUserInput = z.object({
  username: z.string().min(1, "Username is required"),
  bio: z.string().optional(),
  avatar: z.string()
    .optional()
    .refine(
      (val) => !val || val.length <= MAX_AVATAR_SIZE, 
      "Avatar image is too large (max 1MB)"
    ),
  age: z.preprocess(
    // Convert to number if it's a string
    (val) => (val === "" ? null : Number(val)),
    z.number().optional(),
  ),
});

export const GET = async () => {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const profile = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.auth_id, session.user.id!));

    if (profile.length === 0) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404 },
      );
    }

    const elo = await fetchUserElo(session.user.id!);
    const rep = convertRepToStar(elo); 

    return NextResponse.json({ ...profile[0], rep });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  console.log("Profile API: Request received");
  
  // Check authentication
  const session = await auth();
  if (!session || !session.user) {
    console.error("Profile API: Authentication failed - no valid session");
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  
  console.log(`Profile API: Authenticated as user ${session.user.id}`);
  
  // Set a size limit for the entire request
  const MAX_REQUEST_SIZE = 3 * 1024 * 1024; // 3MB
  
  try {
    // Clone the request to check its size before parsing
    const clonedRequest = request.clone();
    let buffer;
    
    try {
      buffer = await clonedRequest.arrayBuffer();
      console.log(`Profile API: Request size: ${buffer.byteLength} bytes`);
      
      if (buffer.byteLength > MAX_REQUEST_SIZE) {
        console.error(`Profile API: Request too large (${buffer.byteLength} bytes)`);
        return NextResponse.json(
          { error: `Request too large. Max size is ${MAX_REQUEST_SIZE / (1024 * 1024)}MB` },
          { status: 413 }
        );
      }
    } catch (bufferError) {
      console.error("Profile API: Error reading request buffer:", bufferError);
      return NextResponse.json(
        { error: "Could not process request body", details: (bufferError as Error).message },
        { status: 400 }
      );
    }
    
    // Continue with normal processing
    let payload;
    try {
      payload = await request.json();
      console.log("Profile API: Successfully parsed JSON payload");
    } catch (jsonError) {
      console.error("Profile API: JSON parsing error:", jsonError);
      return NextResponse.json(
        { error: "Invalid JSON data", details: (jsonError as Error).message },
        { status: 400 }
      );
    }
    
    try {
      // Validate the input data
      console.log("Profile API: Validating input data");
      const data = AddUserInput.parse(payload);
      
      // Log payload size for debugging
      const payloadSize = JSON.stringify(payload).length;
      console.log(`Profile API: Validated payload size: ${payloadSize} bytes`);
      console.log(`Profile API: Avatar data size: ${payload.avatar?.length || 0} bytes`);
      
      try {
        // Check if profile exists using auth_id
        console.log(`Profile API: Checking if profile exists for user ${session.user.id}`);
        const existingProfile = await db
          .select()
          .from(userProfile)
          .where(eq(userProfile.auth_id, session.user.id!));

        // Check if username is already taken by someone else
        const usernameExists = await db
          .select()
          .from(userProfile)
          .where(eq(userProfile.username, data.username));

        // Filter out the current user's profile
        const usernameExistsForOtherUser = usernameExists.filter(
          profile => profile.auth_id !== session.user!.id
        );

        if (usernameExistsForOtherUser.length > 0) {
          console.error(`Profile API: Username '${data.username}' already exists`);
          return NextResponse.json(
            { error: "Username already taken", code: "DUPLICATE_USERNAME" },
            { status: 409 } // Conflict status
          );
        }

        if (existingProfile.length > 0) {
          // Update existing profile
          console.log("Profile API: Updating existing profile");
          try {
            await db
              .update(userProfile)
              .set({
                username: data.username,
                bio: data.bio,
                avatar: data.avatar,
                age: data.age,
              })
              .where(eq(userProfile.auth_id, session.user.id!));
            
            console.log("Profile API: Profile updated successfully");
          } catch (dbUpdateError) {
            // Check for duplicate key error
            const errorMsg = (dbUpdateError as Error).message || '';
            if (errorMsg.includes('duplicate key') && errorMsg.includes('unique constraint')) {
              console.error("Profile API: Duplicate username error:", errorMsg);
              return NextResponse.json(
                { error: "Username already taken", code: "DUPLICATE_USERNAME" },
                { status: 409 } // Conflict status
              );
            }
            // Other database error
            throw dbUpdateError;
          }
        } else {
          // Insert new profile
          console.log("Profile API: Creating new profile");
          try {
            await updateUserElo(session.user.id!, -1);
            await db.insert(userProfile).values([
              {
                auth_id: session.user.id!,
                username: data.username,
                bio: data.bio,
                avatar: data.avatar,
                age: data.age,
              },
            ]);
            
            console.log("Profile API: New profile created successfully");
          } catch (dbInsertError) {
            // Check for duplicate key error
            const errorMsg = (dbInsertError as Error).message || '';
            if (errorMsg.includes('duplicate key') && errorMsg.includes('unique constraint')) {
              console.error("Profile API: Duplicate username error:", errorMsg);
              return NextResponse.json(
                { error: "Username already taken", code: "DUPLICATE_USERNAME" },
                { status: 409 } // Conflict status
              );
            }
            // Other database error
            throw dbInsertError;
          }
        }

        return NextResponse.json({ message: "Profile saved successfully" });
      } catch (dbError) {
        console.error("Profile API: Database operation error:", dbError);
        return NextResponse.json(
          { error: "Database error", details: (dbError as Error).message },
          { status: 500 }
        );
      }
    } catch (validationError) {
      console.error("Profile API: Validation error:", validationError);
      return NextResponse.json(
        { error: "Invalid profile data", details: (validationError as Error).message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Profile API: Unexpected error:", error);
    return NextResponse.json(
      { error: "Server Error", message: (error as Error).message },
      { status: 500 }
    );
  }
};
