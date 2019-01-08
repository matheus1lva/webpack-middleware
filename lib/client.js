const { applyHmr } = require('./client-hmr');

const socket = new WebSocket(`ws://localhost:${__WS_PORT__}`);

window.addEventListener('beforeunload', () => socket.close());

socket.addEventListener('message', (message) => {
  console.log(message.data);
  const { action, data = {} } = JSON.parse(message.data);
  const { hash } = data;

  switch (action) {
    case 'connection': {
      console.log('HMR: websocket connected');
      break;
    }
    case 'close': {
      console.log('HMR: websocket connection closed');
      break;
    }
    case 'done': {
      applyHmr(hash);
      break;
    }
    default: {
      break;
    }
  }
});

if (module.hot) {
  console.log('Hot Module Replacement is active');
} else {
  console.warn('Hot Module Replacement is inactive');
}
