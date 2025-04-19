const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const sendEmail = require("../utils/sendmailer");

const { MongoClient } = require('mongodb');

const SECRET_KEY = 'AKoF52vMvHyD4+JlhqFtXGRK1hqpTV+Ca4DMdltbik8='

const MONGO_URI = 'mongodb+srv://dallas:ProPhone2025@phonev2.0zg79.mongodb.net/?retryWrites=true&w=majority&appName=PhoneV2';
const client = new MongoClient(MONGO_URI);
const db = client.db('ProPhone');
const usersCollection = db.collection('users');
const emailtemplate = db.collection('email_template');
const magicloginCollection = db.collection('magiclogin');
const emailsCollection = db.collection('emails');
const teamCollection = db.collection('team');
const notificationCollection = db.collection('notification');

const nodemailer = require("nodemailer");



exports.resetpassword = async (req, res) => {
  const { email, password } = req.body;


  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

   
    await usersCollection.findOneAndUpdate(
      { email },
      { $set: { password: hashedPassword} }
  );
  
    await magicloginCollection.deleteOne({ email });
    return res.send("1")

};


exports.verifycode = async (req, res) => {
  const { email, code,register } = req.body;


    const magicEntry = await magicloginCollection.findOne({ email });
    if (!magicEntry || magicEntry.code !== parseInt(code)) {
      return res.send("2"); 
    }

    const user = await usersCollection.findOne({ email });
   


    await magicloginCollection.deleteOne({ email });
    if(!register){
    // const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const token = jwt.sign({ user_id: user._id,email: user.email  }, SECRET_KEY, { expiresIn: '1h' });

      // return res.json({  token:token });



      const ownerData = {

        token: token,
        name: user.firstname+ ' ' + user.lastname,
        email: user.email,
        role: 'user',
        avatar: user.avater
      };
      return res.json({ownerData });
    }else{
      return res.send("1"); 

    }

};


exports.fetchteammember = async (req, res) => {
 
  const { ObjectId } = require("mongodb");

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await usersCollection.findOne({ _id: new ObjectId(decoded.user_id) });
  if (!user) return res.status(404).json({ message: "User not found" });

  const team = await teamCollection.findOne({ user_id: decoded.user_id });

    if (!team) return res.status(404).json({ message: "Team not found" });

    res.status(200).json({ members: team.members || [] });
}

exports.addteammember = async (req, res) => {
  const { memberData,  } = req.body;
 
  const { ObjectId } = require("mongodb");

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await usersCollection.findOne({ _id: new ObjectId(decoded.user_id) });
  if (!user) return res.status(404).json({ message: "User not found" });


  // check already exist
  const checkuser = await usersCollection.findOne({ email: memberData.email });
  if (checkuser) return res.send("2");
  const inviteToken = Math.random().toString(36).substr(2, 24);

  const newMember = {
    ...memberData,
    status: memberData.status || "pending",
    token: inviteToken,
  };

  const result = await teamCollection.updateOne(
    { user_id: decoded.user_id },
    { $push: { members: newMember } },
    { upsert: true } 
  );
  const inviteUrl = `${process.env.CLIENT_URL || "https://suite.prophone.io"}/register?token=${inviteToken}&email=${encodeURIComponent(memberData.email)}&name=${encodeURIComponent(memberData.name)}&role=${encodeURIComponent(memberData.role)}`;

  const emailBody = `
    Dear ${memberData.name},

    You've been invited to join the team as a ${memberData.role.charAt(0).toUpperCase() + memberData.role.slice(1)}. 

    Your permissions will include:
    ${memberData.permissions.map(p => `- ${p}`).join('\n    ')}

    To complete your account setup and activate your access, please click the link below:
    ${inviteUrl}

    This invitation link will expire in 7 days. If you don't complete the registration process,
    your account will remain in a pending state.

    Best regards,
    The Team
  `;

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_HOST_USER,
      pass: process.env.EMAIL_HOST_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_HOST_USER,
    to: memberData.email,
    subject: "You've Been Invited to Join the Team",
    text: emailBody,
  };

  await transporter.sendMail(mailOptions);
  return res.send("1");  

}
exports.insertteam = async (req, res) => {
  const { teamname,  } = req.body;
 
  const { ObjectId } = require("mongodb");

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await usersCollection.findOne({ _id: new ObjectId(decoded.user_id) });
  if (!user) return res.status(404).json({ message: "User not found" });
  const users = await usersCollection.findOneAndUpdate(
    { _id: new ObjectId(decoded.user_id) },
    { $set: { teamname: teamname } },
    { returnDocument: 'after' } 
  );
  
  const data = {
    user_id:decoded.user_id,
    teamname:teamname,
    createdAt: new Date(),
  }
  const result = await teamCollection.insertOne(data);

  return res.send("1");  


}

exports.getnotifications = async (req, res) => {
  const { ObjectId } = require("mongodb");

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await usersCollection.findOne({ _id: new ObjectId(decoded.user_id) });
  if (!user) return res.status(404).json({ message: "User not found" });

  const notifications = await notificationCollection.find().toArray(); 



    return res.json({ notifications: notifications });
}
exports.checkteam = async (req, res) => {
 
    const { ObjectId } = require("mongodb");

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.user_id) });
    if (!user) return res.status(404).json({ message: "User not found" });
    const teamchk = await teamCollection.findOne({ user_id: decoded.user_id });
    if(!teamchk){
      return res.json({
        name: null,
        
      });
    }else{
      return res.json({
        name: teamchk.teamname,
        
      });
    }
    
  
}
exports.sendnotification = async (req, res) => {
  try {
    const { ObjectId } = require("mongodb");

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.user_id) });
    if (!user) return res.status(404).json({ message: "User not found" });

    const { notification } = req.body;
    const { title, message, recipients, action } = notification;
    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ message: "No recipients provided" });
    }
    await notificationCollection.insertOne({
      title,
      message,
      type: notification.type,
      priority: notification.priority,
      action,
      
     
     
      timestamp: new Date()
    });
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.EMAIL_HOST_PASSWORD,
      },
    });

    let total = recipients.length;
    let success = 0;
    let failed = 0;
    let successList = [];
    let failedList = [];

    for (const recipient of recipients) {
      // Extract email from "Name (email@example.com)"
      const match = recipient.match(/\(([^)]+)\)/);
      const email = match?.[1];

      if (!email) {
        failed++;
        failedList.push(recipient);
        continue;
      }

      const body = `${message}${action?.label && action?.url ? `\n\n${action.label}: ${action.url}` : ""}`;

      const mailOptions = {
        from: process.env.EMAIL_HOST_USER,
        to: email,
        subject: title,
        text: body,
      };

      try {
        await transporter.sendMail(mailOptions);
        success++;
        successList.push(email);
      } catch (error) {
        console.error("Failed to send email to", email, error);
        failed++;
        failedList.push(email);
      }
    }

    await emailsCollection.insertOne({
      title,
      message,
      type: notification.type,
      priority: notification.priority,
      action,
      total,
      success,
      failed,
      successfulEmails: successList,
      failedEmails: failedList,
      sentBy: {
        _id: user._id,
        name: user.name,
        email: user.email
      },
      timestamp: new Date()
    });

    return res.json({
      message: "Notification process completed",
      total,
      success,
      failed,
      successfulEmails: successList,
      failedEmails: failedList,
    });

  } catch (error) {
    console.error("Error in sendnotification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.testemail = async (req, res) => {
  // const { template,email } = req.body; 
  // const { body, id,name,subject,type,variables } = template; 
  

  //     const user = await usersCollection.findOne({ email: email });

    
  //     const fullName = user.name || `${user.firstname || ""} ${user.lastname || ""}`.trim();
  //     const suspensionDate = new Date();
  //     const user = await usersCollection.findOne({ email: email });

  //     let body = body
  //       .replace(/{{user.name}}/g, fullName)
  //       .replace(/{{user.email}}/g, email)
  //       .replace(/{{user.id}}/g, id)
  //       .replace(/{{user.plan}}/g, requester.plan || "N/A")
  //       .replace(/{{suspension.date}}/g, suspensionDate.toLocaleDateString())
  //       .replace(/{{suspension.reason}}/g, reason || "N/A")
  //       .replace(/{{billing.amount}}/g, amount || "N/A")
  //       .replace(/{{billing.dueDate}}/g, dueDate || "N/A")
  //       .replace(/{{suspension.referenceId}}/g, referenceId || "N/A");

  //     if (paymentIssue) {
  //       body = body.replace(/{{#if suspension.paymentIssue}}([\s\S]*?){{else}}[\s\S]*?{{\/if}}/, '$1');
  //     } else {
  //       body = body.replace(/{{#if suspension.paymentIssue}}[\s\S]*?{{else}}([\s\S]*?){{\/if}}/, '$1');
  //     }

  //     body = body.replace(/{{#.*?}}|{{\/.*?}}/g, "");

      // await sendMail(email, template.subject, body);
};
exports.gettemplate = async (req, res) => {
  try {
    const { ObjectId } = require("mongodb");
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.user_id) });
    if (!user) return res.status(404).json({ message: "User not found" });
const temp = await emailtemplate.find().toArray(); 



    return res.json({ templates: temp });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.checkauthentication = async (req, res) => {
  const { ObjectId } = require("mongodb");
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication error" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded)
    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.user_id) });
    console.log('user',user)

    if (!user) {
      return res.status(401).json({ message: "Authentication errors" });
    }

    return res.status(200).json({ message: "Authenticated" });

  } catch (error) {
    return res.status(401).json({ message: "Authentication error" });
  }
};


exports.fetchusers = async (req, res) => {
  try {
    const { ObjectId } = require("mongodb");
    const token = req.headers.authorization?.split(" ")[1]; 
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.user_id) });
    if (!user) return res.status(404).json({ message: "User not found" });
    const { not } = req.query;
    if (not) {
      const users = await usersCollection.find({}, { projection: { _id: 1, name: 1, firstname: 1, lastname: 1, email: 1, avatar: 1 } }).toArray();
      
      const formattedUsers = users.map(user => {
        let displayName = user.name; 
        
        if (!displayName) {
          displayName = user.firstname && user.lastname ? `${user.firstname} ${user.lastname}` : (user.firstname || user.lastname);
        }

        return {
          _id: user._id,
          name: displayName,
          email: user.email,
          avatar: user.avatar,
        };
      });

      return res.json({ users: formattedUsers })

    }else{

    const users = await usersCollection.find().toArray(); 
    const formattedUsers = users.map(u => {
      const hasFirstOrLast = u.firstname || u.lastname;

      return {
        id: u._id,
        email: u.email,
        plan: u.plan || "free",
        status: u.status || "active",
        role: u.role || "sub_user",
        avatar: u.avatar || "https://via.placeholder.com/150",
        joinDate: u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : null,
        lastLogin: u.lastLogin || new Date().toLocaleDateString(),
        ...(hasFirstOrLast
          ? {
              firstname: u.firstname || "",
              lastname: u.lastname || "",
            }
          : {
              name: u.name || "",
            }),
        ...(u.status === "suspended" && u.reason ? { reason: u.reason } : {}),
      };
    });



    const rolePriority = {
      "owner": 1,
      "super_admin": 2,
      "sub_user": 3,
      "default": 4
    };



    const sortedUsers = formattedUsers.sort((a, b) => {
      const roleA = rolePriority[a.role] || rolePriority.default;
      const roleB = rolePriority[b.role] || rolePriority.default;

      if (roleA !== roleB) {
        return roleA - roleB; 
      }

      const dateA = new Date(a.joinDate);
      const dateB = new Date(b.joinDate);
      return dateB - dateA;
    });



        return res.json({ users: sortedUsers });
    }

  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.adduser = async (req, res) => {
  const { newUser} = req.body; 

  const { email ,password,role,showAds,firstname,lastname } = newUser;
  const user = await usersCollection.findOne({ email });
  console.log(user)
  if (user) {
    return res.send("2");  
}else{
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = {
    email,
    password: hashedPassword,
    firstname: firstname,
    lastname: lastname,
    plan:"free",
    role,
    showAds,
    createdAt: new Date(),
  };

  const result = await usersCollection.insertOne(newUser);
  return res.send("1");  

}
}


exports.sendMagicCode = async (req, res) => {
  const { email ,forget } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await usersCollection.findOne({ email });
    await magicloginCollection.deleteOne({ email });

      if (!user) {
          return res.send("2");  
      }else{
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_HOST_USER, 
            pass: process.env.EMAIL_HOST_PASSWORD, 
          },
        });
        const magicCode = Math.floor(100000 + Math.random() * 900000);
        if(forget){
          const mailOptions = {
            from: process.env.EMAIL_HOST_USER,
            to: email,
            subject: "Forget Password",
            text: `Your 6 Digit Code is: ${magicCode}`,
          };
          await transporter.sendMail(mailOptions);
        }else{
          const mailOptions = {
            from: process.env.EMAIL_HOST_USER,
            to: email,
            subject: "Magic Code",
            text: `Your Magic Code is: ${magicCode}`,
          };
          await transporter.sendMail(mailOptions);
        }
       
    
        
        await magicloginCollection.updateOne(
          { email },
          { $set: { code: magicCode } }, 
          { upsert: true } 
      );
        return res.send("1");
      }
    
  } catch (error) {
    console.log(error);
    return res.send("1");
  }
};

exports.forgetpassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  const user = await usersCollection.findOne({ email });
  await magicloginCollection.deleteOne({ email });

    if (!user) {
        return res.send("2");  
    }else{
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_HOST_USER, 
          pass: process.env.EMAIL_HOST_PASSWORD, 
        },
      });
      const magicCode = Math.floor(100000 + Math.random() * 900000);
      const mailOptions = {
        from: process.env.EMAIL_HOST_USER,
        to: email,
        subject: "Reset Password",
        text: `Your ProPhone Verification Code is: ${magicCode}`,
      };
  
      await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email Sent Successfully" });

    }
  
};
exports.emailtemplate = async (req, res) => {
  const { ObjectId } = require("mongodb");

  const { template } = req.body; 
  const { body, id,name,subject,type,variables } = template; 
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await usersCollection.findOne({ _id: new ObjectId(decoded.user_id) });
  if (!user) return res.status(404).json({ message: "User not found" });
  const newUser = {
    id: id,
    name: name,
    body: body,
    subject: subject,
    type: type,
    variables: variables,
    createdAt: new Date(),
  };
  
  const result = await emailtemplate.updateOne(
    { id: id }, 
    { $set: newUser }, 
    { upsert: true } 
  );
  
return res.send("1"); 
   
}
// exports.activateuser = async (req, res) => {
//   const { ObjectId } = require("mongodb");

//   const { email, reason } = req.body; 
//   const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
//   if (!token) return res.status(401).json({ message: "Unauthorized" });

//   const decoded = jwt.verify(token, process.env.JWT_SECRET);
//   const user = await usersCollection.findOne({ _id: new ObjectId(decoded.user_id) });
//   if (!user) return res.status(404).json({ message: "User not found" });
//   await usersCollection.findOneAndUpdate(
//     { email },
//     {
//       $unset: { reason: "",bandate:"" },         
//       $set: { status: "active",reactivatedate: new Date()}     
//     }
//   );
    
// let transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_HOST_USER, 
//     pass: process.env.EMAIL_HOST_PASSWORD, 
//   },
// });
// const mailOptions = {
//   from: process.env.EMAIL_HOST_USER,
//   to: email,
//   subject: "Your ProPhone Account Has Been Reactivated",
//   text: `Dear User,
    
//   Great news! Your ProPhone account has been reactivated. You now have full access to all platform features.
  
//   You can log in to your account at any time using your existing credentials.
  
//   If you have any questions or need assistance, please don't hesitate to contact our support team at support@prophone.io.
  
//   Best regards,
//   The ProPhone Team`,
// };
// await transporter.sendMail(mailOptions);
// return res.send("1"); 
// }
// exports.banuser = async (req, res) => {
//   const { email, reason } = req.body; 
//   await usersCollection.findOneAndUpdate(
//     { email },
//     { $set: { reason:reason,bandate: new Date(),status:'suspended'} }
// );  
// let transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_HOST_USER, 
//     pass: process.env.EMAIL_HOST_PASSWORD, 
//   },
// });
// const mailOptions = {
//   from: process.env.EMAIL_HOST_USER,
//   to: email,
//   subject: "Your ProPhone Account Has Been Suspended",
//   text: `Dear User,
    
//     Your ProPhone account has been suspended for the following reason:
//     ${reason}
    
//     If you believe this is a mistake or would like to appeal this decision,
//     please contact our support team at support@prophone.io.
    
//     Best regards,
//     The ProPhone Team`,
// };
// await transporter.sendMail(mailOptions);
// return res.send("1"); 
// }

exports.handleloginuser = async (req, res) => {
  const { ObjectId } = require("mongodb");
  
  const { user } = req.body;
  const { email,id,firstname,lastname,name,avatar,role } = user;
  const tokens = req.headers.authorization?.split(" ")[1];
  if (!tokens) return res.status(401).json({ message: "Unauthorized" });

  const decoded = jwt.verify(tokens, process.env.JWT_SECRET);
  const requester = await usersCollection.findOne({ _id: new ObjectId(decoded.user_id) });
  if (!requester) return res.status(404).json({ message: "User not found" });

  const token = jwt.sign({ user_id: id,email:  email  }, SECRET_KEY, { expiresIn: '1h' });
  const username = name || `${firstname || ""} ${lastname || ""}`.trim();
    

    ownerData = {
      token: token,
      name: username,
      email: email,
      role: role,
      avatar: avatar,
    };
  
  console.log(ownerData)
  return res.json({ ownerData });

}
exports.activateuser = async (req, res) => {
  const { ObjectId } = require("mongodb");
  
  const { email } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const requester = await usersCollection.findOne({ _id: new ObjectId(decoded.user_id) });
  if (!requester) return res.status(404).json({ message: "User not found" });

  const reactivationDate = new Date();

  await usersCollection.findOneAndUpdate(
    { email },
    {
      $unset: { reason: "", bandate: "" },
      $set: { status: "active", reactivatedate: reactivationDate },
    }
  );

  const user = await usersCollection.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found after update" });

  const name = user.name || `${user.firstname || ""} ${user.lastname || ""}`.trim();
  const billing = user.billing || {};
  const billingCycle = billing.cycle || "N/A";
  const nextPaymentDate = billing.nextPaymentDate || "N/A";
  const billingAmount = billing.amount || "N/A";

  // 3. Fetch template from emailtemplates collection
  const template = await emailtemplate.findOne({ name: "Account Reactivation" });
  if (!template) return res.status(404).json({ message: "Template not found" });

  // 4. Replace placeholders
  const subject = template.subject || "Your ProPhone Account Has Been Reactivated";
  let body = template.body;

  body = body
    .replace(/{{user.name}}/g, name)
    .replace(/{{user.email}}/g, user.email)
    .replace(/{{user.id}}/g, user._id.toString())
    .replace(/{{user.plan}}/g, user.plan || "N/A")
    .replace(/{{reactivation.date}}/g, reactivationDate.toLocaleDateString())
    .replace(/{{billing.cycle}}/g, billingCycle)
    .replace(/{{billing.nextPaymentDate}}/g, nextPaymentDate)
    .replace(/{{billing.amount}}/g, billingAmount);

  // 5. Send mail
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_HOST_USER,
      pass: process.env.EMAIL_HOST_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_HOST_USER,
    to: email,
    subject: subject,
    text: body,
  };

  await transporter.sendMail(mailOptions);
  const teamDoc = await teamCollection.findOne({
    "members.email": email,
  });
  if (teamDoc) {
    await teamCollection.updateOne(
      {
        _id: teamDoc._id,
        "members.email": email,
      },
      {
        $unset: {
          "members.$.reason": "",
          "members.$.ban.referenceId": "",
          "members.$.ban.bandate": "",
          "members.$.ban.dataDeletionDate": ""
        },
        $set: {
          "members.$.status": "active",
          "members.$.activatedate": new Date(),
        },
      }
    );
  }
  
  return res.send("1");
};

exports.banuser = async (req, res) => {
  const { email, reason } = req.body; 
  const updateResult = await usersCollection.findOneAndUpdate(
    { email },
    {
      $set: {
        reason,
        bandate: new Date(),
        status: "suspended",
        "ban.referenceId": new Date().getTime().toString(),
        "ban.dataDeletionDate": new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // example: 7 days later
      },
    },
    { returnOriginal: false }

  );
  const user = await usersCollection.findOne({ email });

  // const user = updateResult.value;
  // console.log(user)
  // if (!user) return res.status(404).send("User not found");

  // 2. Get template
  const template = await emailtemplate.findOne({ name: "Account Ban" });
  if (!template) return res.status(404).send("Template not found");

  // 3. Custom name logic
  const fullName = user.name?.trim()
    || `${user.firstname || ""} ${user.lastname || ""}`.trim();

  // 4. Helper to replace placeholders
  const replaceVars = (str) => {
    return str.replace(/{{\s*(user|ban)\.(\w+)\s*}}/g, (_, group, key) => {
      if (group === "user") {
        if (key === "name") return fullName;
        if (key === "id") return user._id?.toString() || "";
        return user[key] || "";
      }
      if (group === "ban") {
        if (key === "date") return user.bandate?.toLocaleDateString() || "";
        return user.ban?.[key] || "";
      }
      return "";
    });
  };

  const subject = replaceVars(template.subject);
  const body = replaceVars(template.body);

  // 5. Send email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_HOST_USER,
      pass: process.env.EMAIL_HOST_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_HOST_USER,
    to: email,
    subject: subject,
    text: body,
  };

  await transporter.sendMail(mailOptions);
  return res.send("1");
};
exports.deleteuser = async (req, res) => {
  const { email, reason } = req.body; 
  await usersCollection.findOneAndDelete(
    { email },
    
);  

return res.send("1"); 
}


// exports.edituser = async (req, res) => {
//   const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
//   const { ObjectId } = require("mongodb");
  
//   if (!token) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await usersCollection.findOne({ _id: new ObjectId(decoded.user_id) });
//     console.log(user)
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const { id,email, role, firstname, lastname, status, showAds, name } = req.body;
//     if(status === "suspended"){
//       let transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: process.env.EMAIL_HOST_USER, 
//           pass: process.env.EMAIL_HOST_PASSWORD, 
//         },
//       });
//       const mailOptions = {
//         from: process.env.EMAIL_HOST_USER,
//         to: email,
//         subject: "Your ProPhone Account Has Been Suspended",
//         text: `Dear User,
          
//         Your ProPhone account has been suspended:
      
        
//         If you believe this is a mistake or would like to appeal this decision,
//         please contact our support team at support@prophone.io.
        
//         Best regards,
//         The ProPhone Team`,
//       };
//       await transporter.sendMail(mailOptions);
//     }else if(status === "active"){
//       let transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: process.env.EMAIL_HOST_USER, 
//           pass: process.env.EMAIL_HOST_PASSWORD, 
//         },
//       });
//       const mailOptions = {
//         from: process.env.EMAIL_HOST_USER,
//         to: email,
//         subject: "Your ProPhone Account Has Been Reactivated",
//         text: `Dear User,
          
//         Great news! Your ProPhone account has been reactivated. You now have full access to all platform features.
        
//         You can log in to your account at any time using your existing credentials.
        
//         If you have any questions or need assistance, please don't hesitate to contact our support team at support@prophone.io.
        
//         Best regards,
//         The ProPhone Team`,
//       };
//       await transporter.sendMail(mailOptions);
//     }
//     const updatedUser = await usersCollection.findOneAndUpdate(
//       { _id: new ObjectId(id) },
//       {
//         $set: {
//           role,
//           email,
//           ...(firstname && lastname ? { firstname, lastname } : { name: name }),
//           status,
//           showAds
//         }
//       },
//       { new: true }
//     );
    

//     if (!updatedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.status(200).json({ message: 'User updated successfully', user: updatedUser });

//   } catch (error) {
//     if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
//       return res.status(401).json({ message: 'Token expired or invalid' });
//     }
//     res.status(500).json({ message: 'Server error', error });
//   }
// };
exports.suspendteammember = async (req, res) => {
  const { ObjectId } = require("mongodb");
  
  const { email,reason } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await usersCollection.findOne({ _id: new ObjectId(decoded.user_id) });
  if (!user) return res.status(404).json({ message: "User not found" });

  // updatedUserData.reason = reason;
  //     updatedUserData.bandate = new Date();

      // 2. Prepare email
      const template = await emailtemplate.findOne({ name: "Account Suspension" });
      if (!template) return res.status(404).json({ message: "Suspension template not found" });

      const fullName = user.name || `${user.firstname || ""} ${user.lastname || ""}`.trim();
      const suspensionDate = new Date();
      const refid = new Date().getTime().toString();
      let body = template.body
        .replace(/{{user.name}}/g, fullName)
        .replace(/{{user.email}}/g, email)
        .replace(/{{user.id}}/g, user._id)
        .replace(/{{user.plan}}/g, user.plan || "N/A")
        .replace(/{{suspension.date}}/g, suspensionDate.toLocaleDateString())
        .replace(/{{suspension.reason}}/g, reason || "N/A")
        .replace(/{{billing.amount}}/g, user.amount || "N/A")
        .replace(/{{billing.dueDate}}/g, user.dueDate || "N/A")
        .replace(/{{suspension.referenceId}}/g,refid || "N/A");

      // Conditional block for paymentIssue
      // if (paymentIssue) {
      //   body = body.replace(/{{#if suspension.paymentIssue}}([\s\S]*?){{else}}[\s\S]*?{{\/if}}/, '$1');
      // } else {
      //   body = body.replace(/{{#if suspension.paymentIssue}}[\s\S]*?{{else}}([\s\S]*?){{\/if}}/, '$1');
      // }

      body = body.replace(/{{#.*?}}|{{\/.*?}}/g, "");
      const updateResult = await usersCollection.findOneAndUpdate(
        { email },
        {
          $set: {
            reason,
            bandate: new Date(),
            status: "suspended",
            "ban.referenceId":refid ,
            "ban.dataDeletionDate": new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // example: 7 days later
          },
        },
        { returnOriginal: false }
    
      );
      const teamDoc = await teamCollection.findOne({
        "members.email": email,
      });
      if (teamDoc){
        await teamCollection.updateOne(
          {
            _id: teamDoc._id,
            "members.email": email,
          },
          {
            $set: {
              "members.$.status": "suspended",  
              "members.$.reason": reason,  
              "members.$.bandate": new Date(),  
              "members.$.ban.referenceId":refid,  
              "members.$.ban.dataDeletionDate":new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  
            },
          }
        );
      }
       
      await sendMail(email, template.subject, body);
      return res.send("1"); 
}

exports.editteammember = async (req, res) => {
  const { ObjectId } = require("mongodb");
  
  const { formData,oldemail } = req.body;
  const { email,name } = formData;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await usersCollection.findOne({ _id: new ObjectId(decoded.user_id) });
  if (!user) return res.status(404).json({ message: "User not found" });
  
  const userDoc = await usersCollection.findOne({ email: oldemail });
  if (!userDoc) return res.status(404).json({ message: "User not found" });
  
  let updateData = {
    email, 
  };
  
  if ('firstname' in userDoc && 'lastname' in userDoc) {
    const [first, ...rest] = name.trim().split(" ");
    updateData.firstname = first;
    updateData.lastname = rest.join(" ") || "";
  } else {
    updateData.name = name;
  }
  
  await usersCollection.findOneAndUpdate(
    { email:oldemail },
    {
      $set: updateData,
    }
  );
  const teamDoc = await teamCollection.findOne({
    "members.email": oldemail,
  });
  if (teamDoc){
    await teamCollection.updateOne(
      {
        _id: teamDoc._id,
        "members.email": oldemail,
      },
      {
        $set: {
          "members.$.name": name,  
          "members.$.email": email,  
          
        },
      }
    );
  }
  return res.send("1"); 

}
exports.edituser = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { ObjectId } = require("mongodb");
  const jwt = require("jsonwebtoken");
  const nodemailer = require("nodemailer");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const requester = await usersCollection.findOne({ _id: new ObjectId(decoded.user_id) });
    if (!requester) return res.status(404).json({ message: "User not found" });

    const {
      id,
      email,
      role,
      firstname,
      lastname,
      status,
      showAds,
      name,
      reason,
      paymentIssue,
      dueDate,
      referenceId,
      amount,
    } = req.body;

    const userId = new ObjectId(id);
    const updatedUserData = {
      role,
      email,
      ...(firstname && lastname ? { firstname, lastname } : { name }),
      status,
      showAds,
    };

    if (status === "suspended") {
      // 1. Update user with suspension info
      updatedUserData.reason = reason;
      updatedUserData.bandate = new Date();

      // 2. Prepare email
      const template = await emailtemplate.findOne({ name: "Account Suspension" });
      if (!template) return res.status(404).json({ message: "Suspension template not found" });

      const fullName = name || `${firstname || ""} ${lastname || ""}`.trim();
      const suspensionDate = new Date();

      let body = template.body
        .replace(/{{user.name}}/g, fullName)
        .replace(/{{user.email}}/g, email)
        .replace(/{{user.id}}/g, id)
        .replace(/{{user.plan}}/g, requester.plan || "N/A")
        .replace(/{{suspension.date}}/g, suspensionDate.toLocaleDateString())
        .replace(/{{suspension.reason}}/g, reason || "N/A")
        .replace(/{{billing.amount}}/g, amount || "N/A")
        .replace(/{{billing.dueDate}}/g, dueDate || "N/A")
        .replace(/{{suspension.referenceId}}/g, referenceId || "N/A");

      // Conditional block for paymentIssue
      if (paymentIssue) {
        body = body.replace(/{{#if suspension.paymentIssue}}([\s\S]*?){{else}}[\s\S]*?{{\/if}}/, '$1');
      } else {
        body = body.replace(/{{#if suspension.paymentIssue}}[\s\S]*?{{else}}([\s\S]*?){{\/if}}/, '$1');
      }

      // Remove any leftover template tags
      body = body.replace(/{{#.*?}}|{{\/.*?}}/g, "");

      await sendMail(email, template.subject, body);
    }

    if (status === "active") {
      updatedUserData.status = "active";
      updatedUserData.reactivatedate = new Date();

      const user = await usersCollection.findOne({ _id: userId });
      const template = await emailtemplate.findOne({ name: "Account Reactivation" });
      if (!template) return res.status(404).json({ message: "Reactivation template not found" });

      const fullName = user.name || `${user.firstname || ""} ${user.lastname || ""}`.trim();
      const billing = user.billing || {};
      const reactivationDate = new Date();

      let body = template.body
        .replace(/{{user.name}}/g, fullName)
        .replace(/{{user.email}}/g, user.email)
        .replace(/{{user.id}}/g, user._id.toString())
        .replace(/{{user.plan}}/g, user.plan || "N/A")
        .replace(/{{reactivation.date}}/g, reactivationDate.toLocaleDateString())
        .replace(/{{billing.cycle}}/g, billing.cycle || "N/A")
        .replace(/{{billing.nextPaymentDate}}/g, billing.nextPaymentDate || "N/A")
        .replace(/{{billing.amount}}/g, billing.amount || "N/A");

      await sendMail(user.email, template.subject, body);
    }

    const updatedUser = await usersCollection.findOneAndUpdate(
      { _id: userId },
      { $set: updatedUserData },
      { returnDocument: "after" }
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired or invalid" });
    }
    res.status(500).json({ message: "Server error", error });
  }
};

// Helper to send mail
async function sendMail(to, subject, text) {
  const transporter = require("nodemailer").createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_HOST_USER,
      pass: process.env.EMAIL_HOST_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_HOST_USER,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
}


exports.registeruser = async (req, res) => {
  const { ObjectId } = require("mongodb");

  const { data, plan,fb,google,refer_token } = req.body; 
  if (!data) {
    return res.status(400).json({ message: "Invalid request format" });
  }

  const { email, password, firstName, lastName,avatar,name } = data;
  if ((!req.body.google && !req.body.fb) && (!email || !password || !firstName || !lastName || !plan)) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = await usersCollection.findOne({ email });
  if (existingUser) {
    const token = jwt.sign({ user_id: existingUser._id,email: email  }, SECRET_KEY, { expiresIn: '1h' });
  
    // return res.json({  token:token });
    await usersCollection.findOneAndUpdate(
      { email },
      { $set: { lastLogin: new Date()} }
  );  
    
    if (existingUser.fb){
      const ownerData = {
  
        token: token,
        name: name,
        email: email,
        fb: 1,
        role: existingUser.role,
        avatar: ''
      };
      return res.json({ownerData });
    }else if (existingUser.google){
      
      const ownerData = {
  
        token: token,
        name: name,
        email: email,
        google: 1,
        role: existingUser.role,
        avatar: avatar
      };
      return res.json({ownerData });
    }else{
    return res.status(409).json({ message: "Email already in use" });
// 
    }
    
  }
  console.log(refer_token)

  if (google) {
     await usersCollection.findOneAndUpdate(
        { email },
        { $set: { lastLogin: new Date()} }
    );  
    const newUser = {
      email,
      name: name,
      avater: avatar,
      plan,
      google,
      role: 'user',


      createdAt: new Date(),
      // ...(refer_token && { refer_token }), 
    };
    console.log(refer_token)
    
    const result = await usersCollection.insertOne(newUser);
    const insertedId = result.insertedId;

    try{
      const teamDoc = await teamCollection.findOne({
        "members.token": refer_token,
      });
      if (teamDoc){
        await teamCollection.updateOne(
          {
            _id: teamDoc._id,
            "members.token": refer_token,
          },
          {
            $set: {
              "members.$.status": "active",  
            },
          }
        );
        console.log(insertedId)
        console.log(insertedId)
        const updateResult = await usersCollection.updateOne(
          { _id: new ObjectId(insertedId) },
          {
            $set: {
              role: "sub_user",
              refer_token: refer_token,
            },
          }
        );
        
        console.log("Update Result:", updateResult);
      }
    }catch{

    }

    
    const token = jwt.sign({ user_id: result.insertedId,email: email  }, SECRET_KEY, { expiresIn: '1h' });
  
    // return res.json({  token:token });
  
  
  
    const ownerData = {
  
      token: token,
      name: name,
      email: email,
      google: 1,
      role: result.role,
      avatar: ''
    };
    return res.json({ownerData });
  }
  if (fb) {
    await usersCollection.findOneAndUpdate(
      { email },
      { $set: { lastLogin: new Date()} }
  );  
    const newUser = {
      email,
      name: name,
      plan,
      fb,
        role:  'user',

      createdAt: new Date(),
      // ...(refer_token && { refer_token }), 
    };
  
    const result = await usersCollection.insertOne(newUser);
    const insertedId = result.insertedId;

    const token = jwt.sign({ user_id: result.insertedId,email: email  }, SECRET_KEY, { expiresIn: '1h' });
  
    // return res.json({  token:token });
  
    
  
    const ownerData = {
  
      token: token,
      name: name,
      email: email,
      fb: 1,
      role: result.role,
      avatar: ''
    };
    try{
      console.log(refer_token)
      const teamDoc = await teamCollection.findOne({
        "members.token": refer_token,
      });
      if (teamDoc){
        await teamCollection.updateOne(
          {
            _id: teamDoc._id,
            "members.token": refer_token,
          },
          {
            $set: {
              "members.$.status": "active",  
            },
          }
        );
        await usersCollection.updateOne(
          { _id: new ObjectId(insertedId) },
          {
            $set: {
              role: "sub_user",
              refer_token: refer_token,
            },
          }
        );
      }
      
    }catch{

    }
    return res.json({ownerData });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = {
    email,
    password: hashedPassword,
    firstname: firstName,
    lastname: lastName,
    plan,
      role: 'user',

    createdAt: new Date(),
    // ...(refer_token && { refer_token }), 
  };
  
  const result = await usersCollection.insertOne(newUser);
  const insertedId = result.insertedId;
  try{
    const teamDoc = await teamCollection.findOne({
      "members.token": refer_token,
    });
    if (teamDoc){
      await teamCollection.updateOne(
        {
          _id: teamDoc._id,
          "members.token": refer_token,
        },
        {
          $set: {
            "members.$.status": "active",  
          },
        }
      );
      await usersCollection.updateOne(
        { _id: new ObjectId(insertedId) },
        {
          $set: {
            role: "sub_user",
            refer_token: refer_token,
          },
        }
      );
    }
  }catch{

  }
  const token = jwt.sign({ user_id: result.insertedId,email: email  }, SECRET_KEY, { expiresIn: '1h' });

  // return res.json({  token:token });

  await usersCollection.findOneAndUpdate(
    { email },
    { $set: { lastLogin: new Date()} }
);  

  const ownerData = {

    token: token,
    name: firstName+ ' ' + lastName,
    email: email,
    role: result.role,
    avatar: ''
  };
  return res.json({ownerData });


      return res.send("1"); 
  
      
    
  
  
};



exports.deletemember = async (req, res) => {
  const { email } = req.body;
  const { ObjectId } = require("mongodb");
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await usersCollection.findOne({ _id: new ObjectId(decoded.user_id) });
  if (!user) return res.status(404).json({ message: "User not found" });
  await teamCollection.findOneAndUpdate(
    { "members.email": email }, 
    {
      $pull: {
        members: { email: email }, 
      },
    }
  );
  await usersCollection.findOneAndUpdate(
    { email: email }, 
    {
      $set: {
        role: "user",
      },
      $unset: {
        refer_token: "",  
      },
    }
  );
  
      return res.send("1"); 

}
exports.editname = async (req, res) => {
  const { teamname,user_id } = req.body;
  const { ObjectId } = require("mongodb");
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await usersCollection.findOne({ _id: new ObjectId(decoded.user_id) });
  if (!user) return res.status(404).json({ message: "User not found" });
  await teamCollection.findOneAndUpdate(
          { user_id:decoded.user_id },
          { $set: { teamname: teamname} }
      );
      return res.send("1"); 

}
exports.register = async (req, res) => {
  const { email, password,firstName,lastName } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


 

    const user = await usersCollection.findOne({ email });
  
      if (user) {
          return res.send("2");  
      }else{
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_HOST_USER, 
            pass: process.env.EMAIL_HOST_PASSWORD, 
          },
        });
        const verificationcode = Math.floor(100000 + Math.random() * 900000);
        const mailOptions = {
          from: process.env.EMAIL_HOST_USER,
          to: email,
          subject: "Veriy Email",
          text: `Your 6 Digit Email Verification Code is: ${verificationcode}`,
        };
    
        await transporter.sendMail(mailOptions);
        await magicloginCollection.updateOne(
          { email },
          { $set: { code: verificationcode } }, 
          { upsert: true } 
      );
      return res.send("1"); 
  
      }
    
  
  
};

exports.login = async (req, res) => {
  const { email, password, mobile, fcmtoken } = req.body;
  console.log(req.body)
  try {
    // if (email === 'dallas@prophone.io' && password === 'owner') {
    //   // const token = jwt.sign({ user_id: 1 }, SECRET_KEY, { expiresIn: '1h' });
    //   const token = jwt.sign({ user_id: 1,email:  'dallas@prophone.io'  }, SECRET_KEY, { expiresIn: '1h' });

    //   const ownerData = {

    //     token: token,
    //     name: 'Dallas Reynolds',
    //     email: 'dallas@prophone.io',
    //     role: 'owner',
    //     avatar: 'https://dallasreynoldstn.com/wp-content/uploads/2025/02/26F25F1E-C8E9-4DE6-BEE2-300815C83882.png'
    //   };
    //   return res.json({ownerData });
    //   // return res.send(ownerData);
    //   // login(ownerData);
    // }
    try {
      

  
 

      const user = await usersCollection.findOne({ email });
      if (!user) {
          return res.send("0");  
      }

      // if (user.googleauth === 1) {
      //     if (user.suspened === 1) {
      //         return res.json({ reason: user.reason });
      //     } else if (user.subscribed === 1) {
      //         if (fcmtoken) {
      //             await usersCollection.findOneAndUpdate(
      //                 { email },
      //                 { $set: { fcm_token: fcmtoken, logout: 0 } }
      //             );
      //         }

             
      //         // const token = jwt.sign({ user_id: user._id }, SECRET_KEY, { expiresIn: '1h' });
      // const token = jwt.sign({ user_id: user._id,email:  user.email  }, SECRET_KEY, { expiresIn: '1h' });

      //         const ownerData = {

      //           token: token,
      //           name: user.firstname+ ' ' + user.lastname,
      //           email: user.email,
      //           role: 'user',
      //           avatar: user.avater
      //         };
      //         return res.json({ownerData }); 
      //         // return res.json({ id: user.id, token });
      //     } else {
      //         return res.send("0"); 
      //     }
      // }
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
          if (user.suspened === 1) {
              return res.json({ reason: user.reason });
          } else  {
              if (fcmtoken) {
                  await usersCollection.findOneAndUpdate(
                      { email },
                      { $set: { fcm_token: fcmtoken, logout: 0 } }
                  );
              }

              // const token = jwt.sign({ user_id: user.id }, SECRET_KEY, { expiresIn: '1h' });
      const token = jwt.sign({ user_id: user._id,email:  user.email  }, SECRET_KEY, { expiresIn: '1h' });
      await usersCollection.findOneAndUpdate(
        { email },
        { $set: { lastLogin: new Date()} }
    );        
      let ownerData;

      if (email === "dallas@prophone.io") {
        ownerData = {
          token: token,
          name: user.firstname + ' ' + user.lastname,
          email: user.email,
          role: 'owner',
          avatar: user.avatar, 
        };
        
      } else {
        ownerData = {
          token: token,
          name: user.firstname + ' ' + user.lastname,
          email: user.email,
          role: 'user',
          avatar: user.avatar,
        };
      }
      console.log(ownerData)
      return res.json({ ownerData });
      

              // return res.json({ id: user.id, token });
          }
      } else {
          return res.send("2"); 
      }

  } catch (err) {
      res.status(500).json({ message: err.message });
  }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
