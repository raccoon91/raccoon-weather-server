import axios from "axios";
import { dateLog } from "../utils";

const { NODE_ENV, SLACK_WEB_HOOK_URL } = process.env;

const createNotification = (title: string, text: string, emoji: string, color: string, where: string) => ({
  username: title,
  text,
  icon_emoji: emoji,
  attachments: [
    {
      color,
      fields: [
        {
          title: "WHERE",
          value: where,
          short: true,
        },
        {
          title: "DATE",
          value: dateLog(),
          short: true,
        },
      ],
    },
  ],
});

export const errorLog = async (text: string, where: string): Promise<void> => {
  try {
    if (NODE_ENV === "development") {
      console.error(where, text);
    } else {
      const notification = createNotification("Error", text, ":circle_fail:", "#ee7a40", where);

      await axios({
        method: "post",
        url: SLACK_WEB_HOOK_URL,
        data: notification,
      });
    }
  } catch (err) {
    console.error(`slack error post failed ${dateLog()}`);
  }
};

export const infoLog = async (title: string, text: string, where: string): Promise<void> => {
  try {
    if (NODE_ENV === "development") {
      console.log(where, title, text);
    } else {
      const notification = createNotification(title, text, ":circle_success:", "#b4ee40", where);

      await axios({
        method: "post",
        url: SLACK_WEB_HOOK_URL,
        data: notification,
      });
    }
  } catch (err) {
    console.error(`slack error post failed ${dateLog()}`);
  }
};
