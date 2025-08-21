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
    const { pathname } = new URL(req.url, 'http://localhost');
    if (pathname === '/media') {
      log('WebSocket upgrade request for /media endpoint');
      wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
    } else {
      log('WebSocket upgrade request for unknown path:', pathname);
      socket.destroy();
    }
  });

  wss.on('connection', (ws, req) => {
    try {
      const params = url.parse(req.url, true).query;
      const callerCtx = {
        name: params.name || '',
        email: params.email || '',
        service: params.service || ''
      };

      log('WebSocket connected from Twilio stream', callerCtx);

      let history = [];
      let collecting = []; // PCM16LE chunks
      let lastMediaTs = Date.now();
      let busyTalking = false;
      let streamSid = null; // Store the stream SID for media responses

      // Kick off: assistant says hello once connected
      (async () => {
        try {
          const greet = `Hi${callerCtx.name ? ' ' + callerCtx.name : ''}! I'm Anna. What service would you like to book, and when works for you?`;
          log('Sending greeting:', greet);
          await speak(ws, greet);
        } catch (error) {
          log('Error sending greeting:', error.message);
        }
      })();

      ws.on('message', async (msg) => {
        try {
          const data = JSON.parse(msg.toString());

          if (data.event === 'start') {
            log('Twilio stream start:', data.start);
            streamSid = data.start.streamSid;
            log('Stored stream SID:', streamSid);
          }

          if (data.event === 'media') {
            lastMediaTs = Date.now();
            
            // Decode base64 mulaw audio and convert to PCM16
            try {
              const mulawData = Buffer.from(data.media.payload, 'base64');              
              const pcm16 = mulawToPcm16(mulawData);
              collecting.push(pcm16);
              
              // Log audio collection progress
              if (collecting.length % 10 === 0) {
                log(`Collected ${collecting.length} audio chunks`);
              }
              
              // Debug: log first few media events
              if (collecting.length <= 3) {
                log(`Received media chunk ${collecting.length}, payload length: ${data.media.payload.length}`);
              }
            } catch (error) {
              log('Error processing incoming audio:', error.message);
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
        clearInterval(interval);
        clearInterval(heartbeat);
      });

      ws.on('error', (error) => {
        log('WebSocket error:', error.message);
      });

      // Turn-taking: every 500ms check if caller paused; if yes, transcribe → reply
      const interval = setInterval(async () => {
        if (ws.readyState !== 1) { 
          clearInterval(interval); 
          return; 
        }
        const now = Date.now();

        // Debug: log interval checks
        if (collecting.length > 0) {
          log(`Interval check: ${collecting.length} chunks, ${now - lastMediaTs}ms since last media, busy: ${busyTalking}`);
        }

        if (collecting.length > 0 && (now - lastMediaTs) > 1000) {
          try {
            log(`Turn-taking triggered: ${collecting.length} chunks, ${now - lastMediaTs}ms since last media`);
            busyTalking = true;
            const pcm16 = Buffer.concat(collecting);
            collecting = [];

            const userText = await transcribePcm16ToText(pcm16);
            if (userText) {
              log('USER>', userText);
              const { text: bot, history: newHist } = await replyFromLLM(history, userText);
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

      // send a TTS sentence to Twilio by µ-law base64 frames
      async function speak(wsConn, text) {
        try {
          log('Starting TTS for text:', text);
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
            
            // 🔧 CRITICAL FIX: Send media event in correct Twilio format
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
            
            // Reduced delay to 5ms for faster response
            await wait(5);
          }
          log('TTS audio sent successfully');
        } catch (e) {
          log('speak error', e.message);
        }
      }
    } catch (error) {
      log('Error in WebSocket connection handler:', error.message);
      ws.close();
    }
  });

  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }


}
