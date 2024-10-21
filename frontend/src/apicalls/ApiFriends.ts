import AxiosInstance from "../router/routes/Authentication/utils/AxiosInterceptor";
import { UserDetails } from "../router/routes/tournament/interfaces";

const FRIEND_URL = `/friend`;
const USER_URL = `/v1/auth`;

export const getUserDetails = async (username: string) => {
  try {
    const res = await AxiosInstance.get(`${USER_URL}/user/${username}/`);
    return res.data;
  } catch (error) {
    console.error("Error fetching user detail", error);
  }
};

export const getProfileImage = async () => {
  try {
    const res = await AxiosInstance.get(`${USER_URL}/profile/pic/`);
    return res.data.image_url;
  } catch (error) {
    console.error("Error fetching getProfileImage", error);
  }
};

export const addFriend = async (username: string) => {
  try {
    const res = await AxiosInstance.post(`${FRIEND_URL}/add/${username}/`);
    return { success: true, message: res.data };
  } catch (error) {
    console.error("Error adding friend");
  }
};

export const removeFriend = async (username: string) => {
  try {
    await AxiosInstance.post(`${FRIEND_URL}/remove/${username}/`).then((res) => {
      return res.data;
    });
  } catch (error) {
    console.error("Error removing friend:", error);
  }
};

export const getFriendsList = async () => {
  try {
    const res = await AxiosInstance.get(`${FRIEND_URL}/friends/`);
    return res.data;
  } catch (error) {
    console.error("Error fetching friends list:", error);
  }
};

// if q is empty all users are returned, else only users with their user names starting with {q string} will be returned
export async function getAllUsers(q: string) {
  let typed: UserDetails[] = [];
  try {
    const res = await AxiosInstance.get(`${USER_URL}/allusers/${q}`);
    typed = res.data;
  } catch (error) {
    console.error("Error fetching friends list:", error);
  }
  return typed;
}

export const getFriendProfile = async (username: string) => {
  try {
    const res = await AxiosInstance.get(`${FRIEND_URL}/friends/${username}`);
    return res;
  } catch (error) {
    console.error("Error fetching friends profile:", error);
  }
};

export const getFriendRequestList = async () => {
  try {
    const res = await AxiosInstance.get(`${FRIEND_URL}/friendRequests/`);
    return res.data;
  } catch (error) {
    console.error("Error fetching friendrequestlist:", error);
  }
};

export const blockUser = async (username: string) => {
  try {
    const res = await AxiosInstance.post(`${FRIEND_URL}/block/${username}/`);
    return res.data;
  } catch (error) {
    console.error("Error blocking user:", error);
  }
};

export const unblockUser = async (username: string) => {
  try {
    await AxiosInstance.post(`${FRIEND_URL}/unblock/${username}/`).then((res) => {
      return res;
    });
  } catch (error) {
    console.error("Error unblocking user:", error);
  }
};

export const getBlockedList = async () => {
  try {
    const res = await AxiosInstance.get(`${FRIEND_URL}/blocks/`);
    return res.data;
  } catch (error) {
    console.error("Error fetching blocked users list:", error);
  }
};
