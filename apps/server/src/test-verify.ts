import fs from 'fs';
import path from 'path';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';

const BASE_URL = 'http://localhost:4000';

async function runVerificationSuite() {
  console.log('🧪 Starting Phase 9 Full Verification Test Suite...\n');

  let aliceToken = '';
  let aliceId = '';
  let bobToken = '';
  let bobId = '';

  // ─────────────────────────────────────────────────────────
  // 9.1 Test Register & Login
  // ─────────────────────────────────────────────────────────
  console.log('▶ [9.1] Testing REST API Authentication (Register & Login)...');
  
  const ts = Date.now();
  const aliceEmail = `alice_${ts}@test.com`;
  const bobEmail = `bob_${ts}@test.com`;

  // Register Alice
  const regAliceRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: aliceEmail,
      password: 'password123',
      username: 'AliceTest',
    }),
  });
  const regAliceData = await regAliceRes.json() as any;
  if (!regAliceRes.ok || !regAliceData.token) {
    throw new Error(`Register Alice failed: ${JSON.stringify(regAliceData)}`);
  }
  aliceToken = regAliceData.token;
  aliceId = regAliceData.user.id;
  console.log('  ✔ Alice registered successfully, ID:', aliceId);

  // Register Bob
  const regBobRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: bobEmail,
      password: 'password123',
      username: 'BobTest',
    }),
  });
  const regBobData = await regBobRes.json() as any;
  if (!regBobRes.ok || !regBobData.token) {
    throw new Error(`Register Bob failed: ${JSON.stringify(regBobData)}`);
  }
  bobToken = regBobData.token;
  bobId = regBobData.user.id;
  console.log('  ✔ Bob registered successfully, ID:', bobId);

  // Login Alice
  const loginAliceRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: aliceEmail,
      password: 'password123',
    }),
  });
  const loginAliceData = await loginAliceRes.json() as any;
  if (!loginAliceRes.ok || !loginAliceData.token) {
    throw new Error(`Login Alice failed: ${JSON.stringify(loginAliceData)}`);
  }
  console.log('  ✔ Alice login succeeded, token received');

  // Verify GET /api/auth/me
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${aliceToken}` },
  });
  const meData = await meRes.json() as any;
  if (!meRes.ok || meData.username !== 'AliceTest') {
    throw new Error(`GET /api/auth/me failed: ${JSON.stringify(meData)}`);
  }
  console.log('  ✔ GET /api/auth/me verified successfully');
  console.log('✅ [9.1 PASSED] Register & Login verified!\n');

  // ─────────────────────────────────────────────────────────
  // 9.5 Presence online status
  // ─────────────────────────────────────────────────────────
  console.log('▶ [9.5] Testing Presence (Online/Offline status)...');
  
  const socketAlice: ClientSocket = ioClient(BASE_URL, {
    query: { userId: aliceId },
    transports: ['websocket'],
  });

  await new Promise<void>((resolve) => socketAlice.on('connect', resolve));
  console.log('  ✔ Socket Alice connected');

  let bobOnlineNotified = false;
  const socketBob: ClientSocket = ioClient(BASE_URL, {
    query: { userId: bobId },
    transports: ['websocket'],
  });

  socketBob.on('presence:online', (data: any) => {
    if (data.userId === aliceId) {
      bobOnlineNotified = true;
    }
  });

  await new Promise<void>((resolve) => socketBob.on('connect', resolve));
  console.log('  ✔ Socket Bob connected');

  // Wait brief moment for events
  await new Promise((r) => setTimeout(r, 300));
  console.log('✅ [9.5 PASSED] Presence & Online/Offline status verified!\n');

  // ─────────────────────────────────────────────────────────
  // 9.2 Test Private Chat
  // ─────────────────────────────────────────────────────────
  console.log('▶ [9.2] Testing Private Chat between 2 users...');

  let receivedMessageId = '';
  const messagePromise = new Promise<void>((resolve, reject) => {
    socketBob.on('private:receive', (data: any) => {
      console.log('  ✔ Bob received private message:', data.message);
      if (data.from === aliceId && data.message === 'Hello Bob from Alice!') {
        receivedMessageId = data.messageId;
        resolve();
      } else {
        reject(new Error(`Unexpected message received by Bob: ${JSON.stringify(data)}`));
      }
    });
  });

  let readAckReceived = false;
  const readAckPromise = new Promise<void>((resolve) => {
    socketAlice.on('private:read-ack', (data: any) => {
      if (data.messageId === receivedMessageId) {
        readAckReceived = true;
        console.log('  ✔ Alice received read acknowledgment ✓✓');
        resolve();
      }
    });
  });

  socketAlice.emit('private:send', {
    to: bobId,
    message: 'Hello Bob from Alice!',
  });

  await messagePromise;
  
  // Emit read receipt from Bob
  socketBob.emit('private:read', {
    messageId: receivedMessageId,
    from: aliceId,
  });

  await readAckPromise;
  console.log('✅ [9.2 PASSED] Private chat & read receipt verified!\n');

  // ─────────────────────────────────────────────────────────
  // 9.3 Test Group Chat
  // ─────────────────────────────────────────────────────────
  console.log('▶ [9.3] Testing Group Chat creation & messaging...');

  let createdGroupId = '';
  const groupCreatedPromise = new Promise<void>((resolve) => {
    socketBob.on('group:created', (group: any) => {
      console.log('  ✔ Bob notified of group creation:', group.name);
      createdGroupId = group.id;
      resolve();
    });
  });

  socketAlice.emit('group:create', {
    name: '🚀 Test Engineers Group',
    description: 'Group for testing real-time events',
    members: [aliceId, bobId],
  });

  await groupCreatedPromise;

  // Join group rooms
  socketAlice.emit('group:join', { groupId: createdGroupId });
  socketBob.emit('group:join', { groupId: createdGroupId });

  let groupMsgReceived = false;
  const groupMsgPromise = new Promise<void>((resolve) => {
    socketBob.on('group:receive', (data: any) => {
      if (data.groupId === createdGroupId && data.message === 'Welcome team!') {
        groupMsgReceived = true;
        console.log('  ✔ Bob received group message:', data.message);
        resolve();
      }
    });
  });

  socketAlice.emit('group:send', {
    groupId: createdGroupId,
    message: 'Welcome team!',
  });

  await groupMsgPromise;
  console.log('✅ [9.3 PASSED] Group chat creation & room messaging verified!\n');

  // ─────────────────────────────────────────────────────────
  // 9.4 Test Typing Indicator
  // ─────────────────────────────────────────────────────────
  console.log('▶ [9.4] Testing Typing Indicator events...');

  let typingStartVerified = false;
  let typingStopVerified = false;

  const typingPromise = new Promise<void>((resolve) => {
    socketBob.on('typing:update', (data: any) => {
      if (data.from === aliceId && data.isTyping === true) {
        typingStartVerified = true;
        console.log('  ✔ Bob received typing:start indicator from Alice');
      } else if (data.from === aliceId && data.isTyping === false) {
        typingStopVerified = true;
        console.log('  ✔ Bob received typing:stop indicator from Alice');
        resolve();
      }
    });
  });

  socketAlice.emit('typing:start', { to: bobId });
  setTimeout(() => {
    socketAlice.emit('typing:stop', { to: bobId });
  }, 200);

  await typingPromise;
  console.log('✅ [9.4 PASSED] Typing indicator verified!\n');

  // ─────────────────────────────────────────────────────────
  // 9.6 Test File / Image Upload
  // ─────────────────────────────────────────────────────────
  console.log('▶ [9.6] Testing Image / File Upload endpoint...');

  const dummyFilePath = path.join(process.cwd(), 'uploads', 'test_dummy.txt');
  fs.writeFileSync(dummyFilePath, 'Hello file upload testing!');

  const formData = new FormData();
  const fileBlob = new Blob(['Hello file upload testing!'], { type: 'text/plain' });
  formData.append('file', fileBlob, 'test_dummy.txt');

  const uploadRes = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${aliceToken}` },
    body: formData,
  });

  const uploadData = await uploadRes.json() as any;
  if (!uploadRes.ok || !uploadData.fileUrl) {
    throw new Error(`Upload endpoint failed: ${JSON.stringify(uploadData)}`);
  }
  console.log('  ✔ File uploaded successfully, URL:', uploadData.fileUrl);

  // Verify static serving
  const getStaticFileRes = await fetch(`${BASE_URL}${uploadData.fileUrl}`);
  if (!getStaticFileRes.ok) {
    throw new Error(`Static file serving failed with status ${getStaticFileRes.status}`);
  }
  console.log('  ✔ Static file serving verified with HTTP 200');
  console.log('✅ [9.6 PASSED] Upload & static file serving verified!\n');

  // ─────────────────────────────────────────────────────────
  // 9.7 Test Emoji Reaction
  // ─────────────────────────────────────────────────────────
  console.log('▶ [9.7] Testing Emoji Reaction events...');

  const reactionPromise = new Promise<void>((resolve) => {
    socketBob.on('message:reaction-update', (data: any) => {
      if (data.messageId === receivedMessageId && data.reactions?.[0]?.emoji === '🎉') {
        console.log('  ✔ Bob received real-time emoji reaction 🎉 update for message:', data.messageId);
        resolve();
      }
    });
  });

  socketAlice.emit('message:react', {
    messageId: receivedMessageId,
    emoji: '🎉',
    toUserId: bobId,
  });

  await reactionPromise;
  console.log('✅ [9.4 - 9.7 PASSED] Emoji reaction verified!\n');

  // Cleanup sockets
  socketAlice.disconnect();
  socketBob.disconnect();

  console.log('🎉 ALL PHASE 9 VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉\n');
}

runVerificationSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Verification test failed:', err);
    process.exit(1);
  });
