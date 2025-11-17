const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const port = 3000;

const allowedOrigins = ["http://localhost:5173"];

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Chat Server is running!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.sexese6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const database = client.db("aidevo");
    const usersCollection = database.collection("users");
    const eventsCollection = database.collection("events");
    const conversationsCollection = database.collection("conversations");
    const messagesCollection = database.collection("messages");
    const applicationsCollection = database.collection("applications");
    const membersCollection = database.collection("members");

    // Socket.io connection handling (keep your existing socket code)
    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("join_conversation", (conversationId) => {
        socket.join(conversationId);
        console.log(`User ${socket.id} joined conversation: ${conversationId}`);
      });

      socket.on("leave_conversation", (conversationId) => {
        socket.leave(conversationId);
        console.log(`User ${socket.id} left conversation: ${conversationId}`);
      });

      socket.on("send_message", async (data) => {
        try {
          const {
            conversationId,
            senderId,
            senderName,
            senderRole,
            text,
            senderPhoto,
          } = data;

          const message = {
            conversationId: new ObjectId(conversationId),
            senderId: new ObjectId(senderId),
            senderName,
            senderRole,
            senderPhoto,
            text,
            timestamp: new Date(),
            read: false,
          };

          const result = await messagesCollection.insertOne(message);
          message._id = result.insertedId;

          await conversationsCollection.updateOne(
            { _id: new ObjectId(conversationId) },
            {
              $set: {
                lastMessage: text,
                lastMessageTime: new Date(),
                updatedAt: new Date(),
              },
            }
          );

          io.to(conversationId).emit("receive_message", message);
          console.log("Message sent:", message);
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("message_error", { error: "Failed to send message" });
        }
      });

      socket.on("mark_as_read", async (data) => {
        try {
          const { conversationId, userId } = data;

          await messagesCollection.updateMany(
            {
              conversationId: new ObjectId(conversationId),
              senderId: { $ne: new ObjectId(userId) },
              read: false,
            },
            { $set: { read: true } }
          );

          io.to(conversationId).emit("messages_read", {
            conversationId,
            userId,
          });
        } catch (error) {
          console.error("Error marking messages as read:", error);
        }
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    // Get user by Firebase UID
    app.get("/users/uid/:uid", async (req, res) => {
      try {
        const { uid } = req.params;

        const user = await usersCollection.findOne({
          uid: uid,
        });

        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        res.json({
          success: true,
          user: user,
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch user",
          error: err.message,
        });
      }
    });

    // Get user by MongoDB ID
    app.get("/users/:userId", async (req, res) => {
      try {
        const { userId } = req.params;

        if (!ObjectId.isValid(userId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid user ID",
          });
        }

        const user = await usersCollection.findOne({
          _id: new ObjectId(userId),
        });

        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        res.json({
          success: true,
          user: user,
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch user",
          error: err.message,
        });
      }
    });

    // Get user role by email
    app.get("/users/role/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const user = await usersCollection.findOne({ email });

        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        const userInfo = {
          role: user.role,
          organizationId: user._id.toString(),
          studentId: user._id.toString(),
          name: user.name
        };

        res.json(userInfo);
      } catch (err) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch user role",
          error: err.message,
        });
      }
    });

    // Create new user
    app.post("/users", async (req, res) => {
      try {
        const user = req.body;
        const existing = await usersCollection.findOne({ email: user.email });
        if (existing) {
          return res.status(400).json({
            success: false,
            message: "User already exists",
          });
        }
        const result = await usersCollection.insertOne(user);
        res.json({
          success: true,
          message: "User created successfully",
          userId: result.insertedId,
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          message: "Failed to create user",
          error: err.message,
        });
      }
    });

    // Get all users
    app.get("/users", async (req, res) => {
      try {
        const users = await usersCollection.find().toArray();
        res.json({
          success: true,
          users: users,
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch users",
          error: err.message,
        });
      }
    });

    // APPLICATION APIs - CORRECTED

    // Submit application
    app.post("/applications", async (req, res) => {
      try {
        const applicationData = req.body;

        console.log("Received application data:", applicationData);

        // Validate required fields
        if (!applicationData.studentId || !applicationData.organizationId) {
          return res.status(400).json({
            success: false,
            message: "Student ID and Organization ID are required",
          });
        }

        // Get student user by Firebase UID to get MongoDB _id
        const studentUser = await usersCollection.findOne({
          uid: applicationData.studentId,
        });

        if (!studentUser) {
          return res.status(404).json({
            success: false,
            message: "Student not found",
          });
        }

        // Get organization user by Firebase UID to get MongoDB _id
        const organizationUser = await usersCollection.findOne({
          uid: applicationData.organizationId,
        });

        if (!organizationUser) {
          return res.status(404).json({
            success: false,
            message: "Organization not found",
          });
        }

        console.log("Found student:", studentUser._id.toString());
        console.log("Found organization:", organizationUser._id.toString());

        // Check for existing application
        const existingApplication = await applicationsCollection.findOne({
          studentId: studentUser._id.toString(),
          organizationId: organizationUser._id.toString(),
          status: { $in: ["pending", "approved"] },
        });

        if (existingApplication) {
          return res.status(400).json({
            success: false,
            message: "You have already applied to this organization",
          });
        }

        // Create application with proper IDs
        const application = {
          studentId: studentUser._id.toString(),
          studentEmail: studentUser.email,
          studentName: studentUser.name,
          studentPhoto: studentUser.photoURL,
          organizationId: organizationUser._id.toString(),
          organizationName:
            organizationUser.organization?.name || organizationUser.name,
          organizationEmail: organizationUser.email,
          fullName: applicationData.fullName,
          email: applicationData.email,
          phone: applicationData.phone,
          department: applicationData.department,
          session: applicationData.session,
          currentYear: applicationData.currentYear,
          skills: applicationData.skills,
          experience: applicationData.experience,
          motivation: applicationData.motivation,
          expectations: applicationData.expectations,
          resume: applicationData.resume,
          studentInfo: {
            studentId: studentUser.student?.studentId,
            department: studentUser.student?.department,
            session: studentUser.student?.session,
          },
          status: "pending",
          appliedAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await applicationsCollection.insertOne(application);

        res.status(201).json({
          success: true,
          message: "Application submitted successfully",
          applicationId: result.insertedId,
        });
      } catch (err) {
        console.error("Error submitting application:", err);
        res.status(500).json({
          success: false,
          message: "Failed to submit application",
          error: err.message,
        });
      }
    });

    // Update application status
    app.patch("/applications/:applicationId/status", async (req, res) => {
      try {
        const { applicationId } = req.params;
        const { status, notes } = req.body;

        console.log(
          `Updating application ${applicationId} to status: ${status}`
        );

        if (!ObjectId.isValid(applicationId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid application ID",
          });
        }

        const application = await applicationsCollection.findOne({
          _id: new ObjectId(applicationId),
        });

        if (!application) {
          return res.status(404).json({
            success: false,
            message: "Application not found",
          });
        }

        console.log("Application found:", application);

        // If approving application, add to members collection
        if (status === "approved") {
          try {
            // Check if already a member
            const existingMember = await membersCollection.findOne({
              studentId: application.studentId,
              organizationId: application.organizationId,
            });

            if (!existingMember) {
              const memberData = {
                studentId: application.studentId,
                organizationId: application.organizationId,
                studentEmail: application.studentEmail,
                studentName: application.fullName,
                organizationName: application.organizationName,
                organizationEmail: application.organizationEmail,
                studentPhoto: application.studentPhoto,
                studentInfo: application.studentInfo,
                joinedAt: new Date(),
                status: "active",
                role: "member",
              };

              await membersCollection.insertOne(memberData);
              console.log("Member added successfully");

              // Update organization membership count
              await usersCollection.updateOne(
                { _id: new ObjectId(application.organizationId) },
                { $inc: { "organization.membershipCount": 1 } }
              );
            }
          } catch (approveError) {
            console.error("Error in approve process:", approveError);
            return res.status(500).json({
              success: false,
              message: "Failed to approve application: " + approveError.message,
            });
          }
        }

        // Update application status
        const updateData = {
          status: status,
          updatedAt: new Date(),
        };

        if (notes) {
          updateData.notes = notes;
        }

        const result = await applicationsCollection.updateOne(
          { _id: new ObjectId(applicationId) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Application not found for update",
          });
        }

        res.json({
          success: true,
          message: `Application ${status} successfully`,
        });
      } catch (err) {
        console.error("Error updating application status:", err);
        res.status(500).json({
          success: false,
          message: "Failed to update application",
          error: err.message,
        });
      }
    });

    // Get applications for organization
    app.get("/organizations/:organizationId/applications", async (req, res) => {
      try {
        const { organizationId } = req.params;
        const { status } = req.query;

        console.log("Fetching applications for organization:", organizationId);

        // First get organization by Firebase UID to get MongoDB _id
        const organization = await usersCollection.findOne({
          uid: organizationId,
        });

        if (!organization) {
          return res.status(404).json({
            success: false,
            message: "Organization not found",
          });
        }

        const orgMongoId = organization._id.toString();
        console.log("Organization MongoDB ID:", orgMongoId);

        let query = { organizationId: orgMongoId };
        if (status && status !== "all") {
          query.status = status;
        }

        const applications = await applicationsCollection
          .find(query)
          .sort({ appliedAt: -1 })
          .toArray();

        console.log(`Found ${applications.length} applications`);

        res.json({
          success: true,
          applications: applications,
        });
      } catch (err) {
        console.error("Error fetching organization applications:", err);
        res.status(500).json({
          success: false,
          message: "Failed to fetch applications",
          error: err.message,
        });
      }
    });

    // Get applications for organization by MongoDB ID (alternative endpoint)
    app.get(
      "/organizations/by-id/:organizationId/applications",
      async (req, res) => {
        try {
          const { organizationId } = req.params;
          const { status } = req.query;

          if (!ObjectId.isValid(organizationId)) {
            return res.status(400).json({
              success: false,
              message: "Invalid organization ID",
            });
          }

          let query = { organizationId: organizationId };
          if (status && status !== "all") {
            query.status = status;
          }

          const applications = await applicationsCollection
            .find(query)
            .sort({ appliedAt: -1 })
            .toArray();

          res.json({
            success: true,
            applications: applications,
          });
        } catch (err) {
          res.status(500).json({
            success: false,
            message: "Failed to fetch applications",
            error: err.message,
          });
        }
      }
    );

    // Get applications for student
    app.get("/students/:studentId/applications", async (req, res) => {
      try {
        const { studentId } = req.params;

        console.log("Fetching applications for student:", studentId);

        // Get student by Firebase UID to get MongoDB _id
        const student = await usersCollection.findOne({
          uid: studentId,
        });

        if (!student) {
          return res.status(404).json({
            success: false,
            message: "Student not found",
          });
        }

        const studentMongoId = student._id.toString();
        console.log("Student MongoDB ID:", studentMongoId);

        const applications = await applicationsCollection
          .find({
            studentId: studentMongoId,
          })
          .sort({ appliedAt: -1 })
          .toArray();

        // Get organization details for each application
        const applicationsWithOrgDetails = await Promise.all(
          applications.map(async (app) => {
            let organization = null;
            if (ObjectId.isValid(app.organizationId)) {
              organization = await usersCollection.findOne(
                { _id: new ObjectId(app.organizationId) },
                {
                  projection: {
                    "organization.name": 1,
                    "organization.type": 1,
                    "organization.campus": 1,
                    photoURL: 1,
                  },
                }
              );
            }
            return {
              ...app,
              organization: organization,
            };
          })
        );

        res.json({
          success: true,
          applications: applicationsWithOrgDetails,
        });
      } catch (err) {
        console.error("Error fetching student applications:", err);
        res.status(500).json({
          success: false,
          message: "Failed to fetch applications",
          error: err.message,
        });
      }
    });

    // Delete application
    app.delete("/applications/:applicationId", async (req, res) => {
      try {
        const { applicationId } = req.params;

        if (!ObjectId.isValid(applicationId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid application ID",
          });
        }

        const application = await applicationsCollection.findOne({
          _id: new ObjectId(applicationId),
        });

        if (!application) {
          return res.status(404).json({
            success: false,
            message: "Application not found",
          });
        }

        // If application was approved, remove from members collection
        if (application.status === "approved") {
          await membersCollection.deleteOne({
            studentId: application.studentId,
            organizationId: application.organizationId,
          });

          // Decrement organization membership count
          await usersCollection.updateOne(
            { _id: new ObjectId(application.organizationId) },
            { $inc: { "organization.membershipCount": -1 } }
          );
        }

        const result = await applicationsCollection.deleteOne({
          _id: new ObjectId(applicationId),
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Application not found",
          });
        }

        res.json({
          success: true,
          message: "Application deleted successfully",
        });
      } catch (err) {
        console.error("Error deleting application:", err);
        res.status(500).json({
          success: false,
          message: "Failed to delete application",
          error: err.message,
        });
      }
    });

    // ORGANIZATION APIs

    // Get all organizations
    app.get("/organizations", async (req, res) => {
      try {
        const organizations = await usersCollection
          .find({
            role: "organization",
            "organization.status": "active",
          })
          .project({
            name: 1,
            email: 1,
            photoURL: 1,
            uid: 1,
            "organization.name": 1,
            "organization.type": 1,
            "organization.campus": 1,
            "organization.tagline": 1,
            "organization.mission": 1,
            "organization.website": 1,
            "organization.phone": 1,
            "organization.membershipCount": 1,
          })
          .toArray();

        res.json({
          success: true,
          organizations: organizations,
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch organizations",
          error: err.message,
        });
      }
    });

    // Get organizations with application counts
    app.get("/organizations-with-applications", async (req, res) => {
      try {
        const organizations = await usersCollection
          .find({
            role: "organization",
            "organization.status": "active",
          })
          .project({
            name: 1,
            email: 1,
            photoURL: 1,
            uid: 1,
            "organization.name": 1,
            "organization.type": 1,
            "organization.campus": 1,
            "organization.tagline": 1,
            "organization.mission": 1,
            "organization.website": 1,
            "organization.phone": 1,
            "organization.membershipCount": 1,
          })
          .toArray();

        // Get application counts for each organization
        const organizationsWithCounts = await Promise.all(
          organizations.map(async (org) => {
            const applicationCount =
              await applicationsCollection.countDocuments({
                organizationId: org._id.toString(),
                status: "approved",
              });

            return {
              ...org,
              applicationCount,
            };
          })
        );

        res.json({
          success: true,
          organizations: organizationsWithCounts,
        });
      } catch (err) {
        console.error("Error fetching organizations with applications:", err);
        res.status(500).json({
          success: false,
          message: "Failed to fetch organizations",
          error: err.message,
        });
      }
    });

    // Get organization members
    // app.get("/organizations/:organizationId/members", async (req, res) => {
    //   try {
    //     const { organizationId } = req.params;

    //     if (!ObjectId.isValid(organizationId)) {
    //       return res.status(400).json({
    //         success: false,
    //         message: "Invalid organization ID",
    //       });
    //     }

    //     const members = await membersCollection
    //       .find({
    //         organizationId: organizationId,
    //         status: "approved",
    //       })
    //       .sort({ joinedAt: -1 })
    //       .toArray();

    //     const membersWithDetails = await Promise.all(
    //       members.map(async (member) => {
    //         const student = await usersCollection.findOne(
    //           { _id: new ObjectId(member.studentId) },
    //           {
    //             projection: {
    //               name: 1,
    //               email: 1,
    //               photoURL: 1,
    //               "student.studentId": 1,
    //               "student.department": 1,
    //               "student.session": 1,
    //             },
    //           }
    //         );

    //         return {
    //           ...member,
    //           student: student,
    //         };
    //       })
    //     );

    //     res.json({
    //       success: true,
    //       members: membersWithDetails,
    //     });
    //   } catch (err) {
    //     res.status(500).json({
    //       success: false,
    //       message: "Failed to fetch organization members",
    //       error: err.message,
    //     });
    //   }
    // });
    app.get(
      "/organizations/email/:organizationEmail/members",
      async (req, res) => {
        try {
          const { organizationEmail } = req.params;
          const { search } = req.query;

          console.log(
            "Fetching members for organization email:",
            organizationEmail
          );

          // Find organization by email
          const organization = await usersCollection.findOne({
            email: organizationEmail,
            role: "organization",
          });

          if (!organization) {
            return res.status(404).json({
              success: false,
              message: "Organization not found",
            });
          }

          console.log("Organization found:", organization._id.toString());

          // Build query for members
          let query = {
            organizationId: organization._id.toString(),
            status: "active",
          };

          // If search term provided, add search conditions
          if (search) {
            query.$or = [
              { studentName: { $regex: search, $options: "i" } },
              { studentEmail: { $regex: search, $options: "i" } },
              { "studentInfo.studentId": { $regex: search, $options: "i" } },
              { "studentInfo.department": { $regex: search, $options: "i" } },
            ];
          }

          const members = await membersCollection
            .find(query)
            .sort({ joinedAt: -1 })
            .toArray();

          console.log(`Found ${members.length} members for organization`);

          res.json({
            success: true,
            members: members,
            organization: {
              name: organization.organization?.name,
              email: organization.email,
            },
          });
        } catch (err) {
          console.error("Error fetching organization members by email:", err);
          res.status(500).json({
            success: false,
            message: "Failed to fetch organization members",
            error: err.message,
          });
        }
      }
    );

    // Get organizations where student is a member
    app.get("/students/:studentId/organizations", async (req, res) => {
      try {
        const { studentId } = req.params;
        const { search } = req.query;

        console.log("Fetching organizations for student:", studentId);

        if (!ObjectId.isValid(studentId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid student ID",
          });
        }

        let query = {
          studentId: studentId,
          status: "active",
        };

        // If search term provided, add search conditions
        if (search) {
          query.$or = [
            { organizationName: { $regex: search, $options: "i" } },
            { organizationEmail: { $regex: search, $options: "i" } },
            { "organizationInfo.type": { $regex: search, $options: "i" } },
          ];
        }

        const members = await membersCollection
          .find(query)
          .sort({ joinedAt: -1 })
          .toArray();

        console.log(`Found ${members.length} organizations for student`);

        // Format the response to include organization details
        const organizations = members.map((member) => ({
          _id: member._id,
          organizationId: member.organizationId,
          organizationName: member.organizationName,
          organizationEmail: member.organizationEmail,
          organizationPhoto: member.organizationPhoto,
          organizationInfo: member.organizationInfo,
          joinedAt: member.joinedAt,
          role: member.role,
          status: member.status,
        }));

        res.json({
          success: true,
          organizations: organizations,
        });
      } catch (err) {
        console.error("Error fetching student organizations:", err);
        res.status(500).json({
          success: false,
          message: "Failed to fetch student organizations",
          error: err.message,
        });
      }
    });

    // Get all students
    app.get("/students", async (req, res) => {
      try {
        const students = await usersCollection
          .find({
            role: "student",
            "student.status": "active",
          })
          .project({
            name: 1,
            email: 1,
            photoURL: 1,
            uid: 1,
            "student.studentId": 1,
            "student.department": 1,
            "student.session": 1,
          })
          .toArray();

        res.json({
          success: true,
          students: students,
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch students",
          error: err.message,
        });
      }
    });

    // CONVERSATION APIs (keep your existing conversation code)
    app.post("/conversations", async (req, res) => {
      try {
        const { studentId, organizationId } = req.body;

        const student = await usersCollection.findOne({
          _id: new ObjectId(studentId),
        });
        const organization = await usersCollection.findOne({
          _id: new ObjectId(organizationId),
        });

        if (!student || !organization) {
          return res.status(404).json({
            success: false,
            message: "Student or organization not found",
          });
        }

        let conversation = await conversationsCollection.findOne({
          studentId: new ObjectId(studentId),
          organizationId: new ObjectId(organizationId),
        });

        if (!conversation) {
          conversation = {
            studentId: new ObjectId(studentId),
            organizationId: new ObjectId(organizationId),
            studentName: student.name,
            organizationName:
              organization.organization?.name || organization.name,
            studentPhoto: student.photoURL,
            organizationPhoto: organization.photoURL,
            studentInfo: {
              studentId: student.student?.studentId,
              department: student.student?.department,
              session: student.student?.session,
            },
            organizationInfo: {
              type: organization.organization?.type,
              campus: organization.organization?.campus,
            },
            lastMessage: "",
            lastMessageTime: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const result = await conversationsCollection.insertOne(conversation);
          conversation._id = result.insertedId;
        }

        res.json({
          success: true,
          conversation: conversation,
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          message: "Failed to get/create conversation",
          error: err.message,
        });
      }
    });

    app.get("/conversations/:userId", async (req, res) => {
      try {
        const { userId } = req.params;

        const user = await usersCollection.findOne({ uid: userId });
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        const conversations = await conversationsCollection
          .find({
            $or: [{ studentId: user._id }, { organizationId: user._id }],
          })
          .sort({ lastMessageTime: -1 })
          .toArray();

        const conversationsWithUnread = await Promise.all(
          conversations.map(async (conv) => {
            const unreadCount = await messagesCollection.countDocuments({
              conversationId: conv._id,
              senderId: { $ne: user._id },
              read: false,
            });

            return {
              ...conv,
              unreadCount,
            };
          })
        );

        res.json({
          success: true,
          conversations: conversationsWithUnread,
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch conversations",
          error: err.message,
        });
      }
    });

    app.get("/conversations/:conversationId/messages", async (req, res) => {
      try {
        const { conversationId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const messages = await messagesCollection
          .find({
            conversationId: new ObjectId(conversationId),
          })
          .sort({ timestamp: -1 })
          .skip((page - 1) * limit)
          .limit(parseInt(limit))
          .toArray();

        res.json({
          success: true,
          messages: messages.reverse(),
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch messages",
          error: err.message,
        });
      }
    });

    // EVENT APIs (keep your existing event code)
    app.post("/events", async (req, res) => {
      try {
        const event = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: "active",
        };

        const result = await eventsCollection.insertOne(event);

        res.status(201).json({
          success: true,
          message: "Event created successfully",
          eventId: result.insertedId,
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          message: "Failed to create event",
          error: err.message,
        });
      }
    });

    app.get("/events", async (req, res) => {
      try {
        const events = await eventsCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();
        res.json({
          success: true,
          events: events,
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch events",
          error: err.message,
        });
      }
    });

    app.get("/events/:id", async (req, res) => {
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: "Invalid event ID",
          });
        }

        const event = await eventsCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!event) {
          return res.status(404).json({
            success: false,
            message: "Event not found",
          });
        }

        res.json({
          success: true,
          event: event,
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch event",
          error: err.message,
        });
      }
    });

    //for organization profile
    // Update organization profile
    // Update organization profile
    app.put("/organizations/:organizationId/profile", async (req, res) => {
      try {
        const { organizationId } = req.params;
        const updateData = req.body;

        console.log(
          "Updating organization profile:",
          organizationId,
          updateData
        );

        if (!ObjectId.isValid(organizationId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid organization ID",
          });
        }

        // Check if organization exists
        const existingOrg = await usersCollection.findOne({
          _id: new ObjectId(organizationId),
          role: "organization",
        });

        if (!existingOrg) {
          return res.status(404).json({
            success: false,
            message: "Organization not found",
          });
        }

        // Prepare update fields - merge with existing data
        const updateFields = {};

        if (updateData.organization) {
          updateFields.organization = {
            ...existingOrg.organization,
            ...updateData.organization,
          };
        }

        if (updateData.name) {
          updateFields.name = updateData.name;
        }

        if (updateData.photoURL) {
          updateFields.photoURL = updateData.photoURL;
        }

        console.log("Final update fields:", updateFields);

        const result = await usersCollection.updateOne(
          { _id: new ObjectId(organizationId), role: "organization" },
          { $set: updateFields }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Organization not found for update",
          });
        }

        // Get updated organization
        const updatedOrganization = await usersCollection.findOne({
          _id: new ObjectId(organizationId),
        });

        res.json({
          success: true,
          message: "Profile updated successfully",
          organization: updatedOrganization,
        });
      } catch (err) {
        console.error("Error updating organization profile:", err);
        res.status(500).json({
          success: false,
          message: "Failed to update profile",
          error: err.message,
        });
      }
    });

    // Update individual organization field
    app.patch("/organizations/:organizationId/field", async (req, res) => {
      try {
        const { organizationId } = req.params;
        const { field, value } = req.body;

        console.log("Updating field:", field, "to:", value);

        if (!ObjectId.isValid(organizationId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid organization ID",
          });
        }

        // Build the update path for nested fields
        let updatePath = {};
        if (field.startsWith("organization.")) {
          const nestedField = field.replace("organization.", "");
          updatePath[`organization.${nestedField}`] = value;
        } else {
          updatePath[field] = value;
        }

        const result = await usersCollection.updateOne(
          { _id: new ObjectId(organizationId), role: "organization" },
          { $set: updatePath }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Organization not found",
          });
        }

        // Get updated organization
        const updatedOrganization = await usersCollection.findOne({
          _id: new ObjectId(organizationId),
        });

        res.json({
          success: true,
          message: "Field updated successfully",
          organization: updatedOrganization,
        });
      } catch (err) {
        console.error("Error updating organization field:", err);
        res.status(500).json({
          success: false,
          message: "Failed to update field",
          error: err.message,
        });
      }
    });

    // Get organization profile by ID
    app.get("/organizations/:organizationId/profile", async (req, res) => {
      try {
        const { organizationId } = req.params;

        if (!ObjectId.isValid(organizationId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid organization ID",
          });
        }

        const organization = await usersCollection.findOne({
          _id: new ObjectId(organizationId),
          role: "organization",
        });

        if (!organization) {
          return res.status(404).json({
            success: false,
            message: "Organization not found",
          });
        }

        res.json({
          success: true,
          organization: organization,
        });
      } catch (err) {
        console.error("Error fetching organization profile:", err);
        res.status(500).json({
          success: false,
          message: "Failed to fetch organization profile",
          error: err.message,
        });
      }
    });

    // Upload cover photo
    app.post("/organizations/:organizationId/cover-photo", async (req, res) => {
      try {
        const { organizationId } = req.params;
        const { coverPhotoURL } = req.body;

        if (!ObjectId.isValid(organizationId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid organization ID",
          });
        }

        const result = await usersCollection.updateOne(
          { _id: new ObjectId(organizationId), role: "organization" },
          { $set: { "organization.coverPhoto": coverPhotoURL } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Organization not found",
          });
        }

        res.json({
          success: true,
          message: "Cover photo updated successfully",
          coverPhotoURL: coverPhotoURL,
        });
      } catch (err) {
        console.error("Error updating cover photo:", err);
        res.status(500).json({
          success: false,
          message: "Failed to update cover photo",
          error: err.message,
        });
      }
    });

    console.log("✅ Connected to MongoDB successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}

run();

server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`💬 Socket.io server ready for real-time chat`);
});
