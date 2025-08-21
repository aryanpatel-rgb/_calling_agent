// import { WebSocketServer } from 'ws';
// import { log } from '../utils/logger.js';
// import { transcribePcm16ToText } from '../stt/openai.js';
// import { replyFromLLM } from '../brain/brain.js';
// import { ttsToPcm16 } from '../tts/elevenlabs.js';
// import { pcm16ToMulaw, mulawToPcm16, mulawToBase64 } from '../utils/audio.js';
// import url from 'url';

// export function attachMediaWSServer(server) {
//   const wss = new WebSocketServer({ noServer: true });

//   server.on('upgrade', (req, socket, head) => {
//     console.log("Upgrade request to:", req.url);
//     try {
//       const { pathname } = new URL(req.url, 'http://localhost');
//       if (pathname === '/media') {
//         log('WebSocket upgrade request for /media endpoint');
//         wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
//       } else {
//         log('WebSocket upgrade request for unknown path:', pathname);
//         socket.destroy();
//       }
//     } catch (error) {
//       log('Error parsing upgrade URL:', error.message);
//       socket.destroy();
//     }
//   });

//   wss.on('connection', (ws, req) => {
//     // Add connection timeout for better error handling
//     const connectionTimeout = setTimeout(() => {
//       if (ws.readyState === ws.CONNECTING) {
//         log('Connection timeout, closing WebSocket');
//         ws.terminate();
//       }
//     }, 10000); // 10 second timeout

//     try {
//       const params = url.parse(req.url, true).query;
//       const callerCtx = {
//         name: params.name || '',
//         email: params.email || '',
//         service: params.service || ''
//       };

//       log('WebSocket connected from Twilio stream', callerCtx);

//       let history = [];
//       let collecting = []; // PCM16LE chunks
//       let lastMediaTs = Date.now();
//       let busyTalking = false;
//       let streamSid = null; // Store the stream SID for media responses

//       // Kick off: assistant says hello once connected
//       (async () => {
//         try {
//           const greet = `Hi! This is Anna. How can I help you today?`;
//           log('Sending greeting:', greet);
//           await speak(ws, greet);
//         } catch (error) {
//           log('Error sending greeting:', error.message);
//         }
//       })();

//       ws.on('message', async (msg) => {
//         try {
//           const data = JSON.parse(msg.toString());

//           if (data.event === 'start') {
//             log('Twilio stream start:', data.start);
//             streamSid = data.start.streamSid;
//             log('Stored stream SID:', streamSid);
//           }

//           if (data.event === 'media') {
//             lastMediaTs = Date.now();
            
//             // Decode base64 mulaw audio and convert to PCM16
//             try {
//               const mulawData = Buffer.from(data.media.payload, 'base64');              
//               const pcm16 = mulawToPcm16(mulawData);
//               collecting.push(pcm16);
              
//               // Log audio collection progress
//               if (collecting.length % 10 === 0) {
//                 log(`Collected ${collecting.length} audio chunks`);
//               }
              
//               // Debug: log first few media events
//               if (collecting.length <= 3) {
//                 log(`Received media chunk ${collecting.length}, payload length: ${data.media.payload.length}`);
//               }
//             } catch (error) {
//               log('Error processing incoming audio:', error.message);
//             }
//           }

//           if (data.event === 'stop') {
//             log('Twilio stream stop');
//             ws.close();
//           }

//         } catch (e) {
//           log('WS parse error', e.message);
//         }
//       });

//       ws.on('close', () => {
//         log('WebSocket closed');
//         clearTimeout(connectionTimeout);
//         clearInterval(interval);
//         clearInterval(heartbeat);
//       });

//       ws.on('error', (error) => {
//         log('WebSocket error:', error.message);
//         clearTimeout(connectionTimeout);
//       });

//       // Turn-taking: every 500ms check if caller paused; if yes, transcribe → reply
//       const interval = setInterval(async () => {
//         if (ws.readyState !== 1) { 
//           clearInterval(interval); 
//           return; 
//         }
//         const now = Date.now();

//         // Debug: log interval checks
//         if (collecting.length > 0) {
//           log(`Interval check: ${collecting.length} chunks, ${now - lastMediaTs}ms since last media, busy: ${busyTalking}`);
//         }

//         if (collecting.length > 0 && (now - lastMediaTs) > 1000) {
//           try {
//             log(`Turn-taking triggered: ${collecting.length} chunks, ${now - lastMediaTs}ms since last media`);
//             busyTalking = true;
//             const pcm16 = Buffer.concat(collecting);
//             collecting = [];

//             const userText = await transcribePcm16ToText(pcm16);
//             if (userText) {
//               log('USER>', userText);
//               const { text: bot, history: newHist } = await replyFromLLM(history, userText);
//               history = newHist;
//               log('BOT>', bot);
//               await speak(ws, bot);
//             }
//           } catch (err) {
//             log('turn error', err.message);
//           } finally {
//             busyTalking = false;
//           }
//         }
//       }, 500);

//       // Heartbeat to keep connection alive
//       const heartbeat = setInterval(() => {
//         if (ws.readyState === 1) {
//           ws.ping();
//         } else {
//           clearInterval(heartbeat);
//         }
//       }, 30000); // Every 30 seconds

//       // send a TTS sentence to Twilio by μ-law base64 frames
//       async function speak(wsConn, text) {
//         try {
//           log('Starting TTS for text:', text);
//           const pcm8k = await ttsToPcm16(text);

//           const mulaw = pcm16ToMulaw(pcm8k);

//           const FRAME = 160; // 20ms @ 8kHz
//           log(`Sending ${mulaw.length} bytes in ${Math.ceil(mulaw.length/FRAME)} frames`);
          
//           // Send all frames quickly without delays to avoid call timeout
//           for (let i = 0; i < mulaw.length; i += FRAME) {
//             // Check if WebSocket is still open before sending
//             if (wsConn.readyState !== 1) {
//               log('WebSocket closed, stopping audio send');
//               break;
//             }
            
//             const slice = mulaw.slice(i, i + FRAME);
            
//             // 🔧 CRITICAL FIX: Send media event in correct Twilio format
//             if (!streamSid) {
//               log('Warning: No stream SID available, cannot send audio');
//               break;
//             }
            
//             wsConn.send(JSON.stringify({
//               event: 'media',
//               streamSid: streamSid,
//               media: {
//                 payload: slice.toString('base64')
//               }
//             }));
            
//             // Reduced delay to 5ms for faster response
//             await wait(5);
//           }
//           log('TTS audio sent successfully');
//         } catch (e) {
//           log('speak error', e.message);
//         }
//       }
//     } catch (error) {
//       log('Error in WebSocket connection handler:', error.message);
//       ws.close();
//     }
//   });

//   function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
// }



import { WebSocketServer } from 'ws';
import { log } from '../utils/logger.js';
import { transcribePcm16ToText } from '../stt/openai.js';
import { replyFromLLM } from '../brain/brain.js';
import { ttsToPcm16 } from '../tts/elevenlabs.js';
import { pcm16ToMulaw, mulawToPcm16, mulawToBase64 } from '../utils/audio.js';
import url from 'url';

export function attachMediaWSServer(server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    console.log("Upgrade request to:", req.url);
    try {
      const { pathname } = new URL(req.url, 'http://localhost');
      if (pathname === '/media') {
        log('WebSocket upgrade request for /media endpoint');
        wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
      } else {
        log('WebSocket upgrade request for unknown path:', pathname);
        socket.destroy();
      }
    } catch (error) {
      log('Error parsing upgrade URL:', error.message);
      socket.destroy();
    }
  });

  wss.on('connection', (ws, req) => {
    // Add connection timeout for better error handling
    const connectionTimeout = setTimeout(() => {
      if (ws.readyState === ws.CONNECTING) {
        log('Connection timeout, closing WebSocket');
        ws.terminate();
      }
    }, 10000); // 10 second timeout

    try {
      // Initialize caller context - will be populated when Twilio sends customParameters
      let callerCtx = {
        name: '',
        email: '',
        service: ''
      };

      log('WebSocket connected, waiting for Twilio parameters...');

      let history = [];
      let collecting = []; // PCM16LE chunks
      let lastMediaTs = Date.now();
      let busyTalking = false;
      let streamSid = null; // Store the stream SID for media responses
      let parametersReceived = false; // Flag to track if we've received parameters

      // Don't send greeting until we have the parameters
      let greetingSent = false;

      ws.on('message', async (msg) => {
        try {
          const data = JSON.parse(msg.toString());

          if (data.event === 'start') {
            log('Twilio stream start:', data.start);
            streamSid = data.start.streamSid;
            log('Stored stream SID:', streamSid);
            
            // Extract parameters from Twilio's customParameters
            if (data.start.customParameters) {
              const customParams = data.start.customParameters;
              log('Custom parameters from Twilio:', customParams);
              
              // Update caller context with Twilio's custom parameters
              callerCtx = {
                name: customParams.name || '',
                email: customParams.email || '',
                service: customParams.service || ''
              };
              
              log('Updated caller context from Twilio:', callerCtx);
              parametersReceived = true;
              
              // Now send the greeting since we have the parameters
              if (!greetingSent) {
                greetingSent = true;
                (async () => {
                  try {
                    // Use the LLM to generate a proper greeting with user context
                    const { text: greet } = await replyFromLLM([], 'Hello', callerCtx);
                    log('Sending greeting:', greet);
                    await speak(ws, greet);
                  } catch (error) {
                    log('Error sending greeting:', error.message);
                  }
                })();
              }
            } else {
              log('Warning: No custom parameters received from Twilio');
            }
          }

          if (data.event === 'media') {
            lastMediaTs = Date.now();
            
            // Only collect audio if not currently speaking
            if (!busyTalking) {
              try {
                const mulawData = Buffer.from(data.media.payload, 'base64');              
                const pcm16 = mulawToPcm16(mulawData);
                collecting.push(pcm16);
                
                // Reduced logging to avoid spam
                if (collecting.length % 20 === 0) {
                  log(`Collected ${collecting.length} audio chunks`);
                }
              } catch (error) {
                log('Error processing incoming audio:', error.message);
              }
            }
          }

          if (data.event === 'stop') {
            log('Twilio stream stop');
            ws.close();
          }

        } catch (e) {
          log('WS parse error', e.message);
        }
      });

      ws.on('close', () => {
        log('WebSocket closed');
        clearTimeout(connectionTimeout);
        clearInterval(interval);
        clearInterval(heartbeat);
      });

      ws.on('error', (error) => {
        log('WebSocket error:', error.message);
        clearTimeout(connectionTimeout);
      });

      // Turn-taking: every 500ms check if caller paused; if yes, transcribe → reply
      const interval = setInterval(async () => {
        if (ws.readyState !== 1) { 
          clearInterval(interval); 
          return; 
        }
        const now = Date.now();

        // Only process if we have enough audio, user has paused, and we have parameters
        if (collecting.length > 10 && (now - lastMediaTs) > 1500 && !busyTalking && parametersReceived) {
          try {
            log(`Turn-taking triggered: ${collecting.length} chunks, ${now - lastMediaTs}ms since last media`);
            busyTalking = true;
            const pcm16 = Buffer.concat(collecting);
            collecting = [];

                          const userText = await transcribePcm16ToText(pcm16);
              if (userText && userText.length > 0) {
                log('USER>', userText);
                // Pass user context to the bot so it can use actual values instead of placeholders
                const { text: bot, history: newHist } = await replyFromLLM(history, userText, callerCtx);
                history = newHist;
                log('BOT>', bot);
                await speak(ws, bot);
              }
          } catch (err) {
            log('turn error', err.message);
          } finally {
            busyTalking = false;
          }
        }
      }, 500);

      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        if (ws.readyState === 1) {
          ws.ping();
        } else {
          clearInterval(heartbeat);
        }
      }, 30000); // Every 30 seconds

      // send a TTS sentence to Twilio by μ-law base64 frames
      async function speak(wsConn, text) {
        try {
          log('Starting TTS for text:', text);
          busyTalking = true; // Set busy flag before TTS
          
          const pcm8k = await ttsToPcm16(text);
          const mulaw = pcm16ToMulaw(pcm8k);

          const FRAME = 160; // 20ms @ 8kHz
          log(`Sending ${mulaw.length} bytes in ${Math.ceil(mulaw.length/FRAME)} frames`);
          
          // Send all frames quickly without delays to avoid call timeout
          for (let i = 0; i < mulaw.length; i += FRAME) {
            // Check if WebSocket is still open before sending
            if (wsConn.readyState !== 1) {
              log('WebSocket closed, stopping audio send');
              break;
            }
            
            const slice = mulaw.slice(i, i + FRAME);
            
            if (!streamSid) {
              log('Warning: No stream SID available, cannot send audio');
              break;
            }
            
            wsConn.send(JSON.stringify({
              event: 'media',
              streamSid: streamSid,
              media: {
                payload: slice.toString('base64')
              }
            }));
            
            // Reduced delay to 3ms for faster response
            await wait(3);
          }
          log('TTS audio sent successfully');
        } catch (e) {
          log('speak error', e.message);
        } finally {
          busyTalking = false; // Clear busy flag after TTS
        }
      }
    } catch (error) {
      log('Error in WebSocket connection handler:', error.message);
      ws.close();
    }
  });

  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
}