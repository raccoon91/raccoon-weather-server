import axios from "axios";
import { dateLog } from "../utils";

const { NODE_ENV, SLACK_WEB_HOOK_URL } = process.env;

const createNotification = (title: string, message: string, date: string, emoji: string, color: string) => ({
  username: title,
  text: message,
  icon_emoji: emoji,
  attachments: [
    {
      color,
      fields: [
        {
          title: "DATE",
          value: date,
          short: true,
        },
      ],
    },
  ],
});

export const errorLog = async (error: Error): Promise<void> => {
  const errorDate = dateLog();
  const { message, stack } = error;

  try {
    console.error("ERR_DATE", errorDate);
    console.error("ERR_MESSAGE", message);
    console.error("ERR_STACK", stack);

    if (NODE_ENV === "production") {
      const notification = createNotification("Error", message, errorDate, ":circle_fail:", "#ee7a40");

      await axios({
        method: "post",
        url: SLACK_WEB_HOOK_URL,
        data: notification,
      });
    }
  } catch (err) {
    console.error(`Failed post slack error ${errorDate}`);
  }
};

export const infoLog = async (message: string): Promise<void> => {
  const infoDate = dateLog();

  try {
    console.log(message, infoDate);

    if (NODE_ENV === "production") {
      const notification = createNotification("Info", message, infoDate, ":circle_success:", "#b4ee40");

      await axios({
        method: "post",
        url: SLACK_WEB_HOOK_URL,
        data: notification,
      });
    }
  } catch (err) {
    console.error(`Failed post slack info ${infoDate}`);
  }
};
