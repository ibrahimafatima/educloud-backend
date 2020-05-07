function notify(obj, channel) {
  let Pusher = require("pusher");
  let pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    cluster: process.env.PUSHER_APP_CLUSTER,
  });
  pusher.trigger("educloud", channel, obj);
}

module.exports.notify = notify;
