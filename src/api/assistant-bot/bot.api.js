import axiosInstance from "../axios";

const BOT_ASSIST_PATH = "https://as-clinic-management-backend.vercel.app/api/assist-bot/agentic-ai";
const USER_ASSIST_PATH = "https://as-clinic-management-backend.vercel.app/api/user-assistant/agentic-ai";

export const requestWebsiteBot = async ({ message, type = "general" }) => {
  const { data } = await axiosInstance.post(BOT_ASSIST_PATH, { message, type });
  return data;
};

export const requestUserAssistant = async ({
  role,
  action,
  payload = {},
}) => {
  const { data } = await axiosInstance.post(USER_ASSIST_PATH, {
    role,
    action,
    payload,
  });
  return data;
};

