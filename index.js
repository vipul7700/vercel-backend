const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/auth.js');

// Initialize express app
const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;

// Optional: Twilio setup (uncomment if you plan to use Twilio)
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
// const twilioClient = require('twilio')(accountSid, authToken);

// Middleware setup
//const cors = require('cors');
//app.use(cors({
  //  origin: 'http://localhost:3000', // Adjust the origin if necessary
//}));


//app.use(cors());
app.use(cors({
  origin: ['http://localhost:3000', 'https://vercel-frontend-ruddy.vercel.app'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test endpoint
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Twilio message endpoint (uncomment the code block if Twilio setup is enabled)
app.post('/', async (req, res) => {
    const { message, user: sender, type, members } = req.body;

    if (type === 'message.new') {
        const sendMessagePromises = members
            .filter((member) => member.user_id !== sender.id)
            .map(({ user }) => {
                if (!user.online) {
                    return twilioClient.messages.create({
                        body: `You have a new message from ${message.user.fullName} - ${message.text}`,
                        messagingServiceSid: messagingServiceSid,
                        to: user.phoneNumber
                    });
                }
            });

        try {
            await Promise.all(sendMessagePromises);
            console.log('Messages sent!');
            return res.status(200).send('Messages sent!');
        } catch (error) {
            console.error('Error sending messages:', error);
            return res.status(500).send('Failed to send messages');
        }
    }

    return res.status(200).send('Not a new message request');
});

// Auth route
app.use('/auth', authRoutes);

// Server initialization
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
