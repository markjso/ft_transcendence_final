import AxiosInstance from '../router/routes/Authentication/utils/AxiosInterceptor';

const CHAT_URL = '/chat';

export const editRoom = async (groupName: string, removeUsers: number[], room_name: string) => {
    const res = await AxiosInstance.post(`${CHAT_URL}/chat/chatroom_edit/${groupName}/`, {"toRemove": removeUsers, "roomname": room_name})
    return res.data
}

export const getDirectRooms = async () => {
    const res = await AxiosInstance.get(`${CHAT_URL}/chat/directRooms/`);
    return res.data.rooms
}

export const getRooms = async () => {
    const res = await AxiosInstance.get(`${CHAT_URL}/chat/rooms/`);
    return res.data.rooms
}

export const createDirectRooms = async (otherusername: string) => {
    const res = await AxiosInstance.post(`${CHAT_URL}/chat/create/${otherusername}/`);
    return res
}

export const createGroupRooms = async (chatgroup_name: string, people: string[]) => {
    const res = await AxiosInstance.post(`${CHAT_URL}/chat/create/group/`, { "groupchat_name": chatgroup_name, "people": people });
    return res
}

export const getroom = async (roomID: string) => {
    const res = await AxiosInstance.get(`${CHAT_URL}/chat/room/${roomID}/`);
    return res
}

export const leaveroom = async (name: string) => {
    const res = await AxiosInstance.post(`${CHAT_URL}/chat/leave/${name}/`);
    return res
}

export const deleteRoom = async (roomId: string) => {
    const res = await AxiosInstance.delete(`${CHAT_URL}/chat/delete/${roomId}/`);
    return res.data;
};

export const getRoomUsers = async (roomName: string) => {
    const res = await AxiosInstance.get(`${CHAT_URL}/users/${roomName}/`);
    return res.data;
}

export const getRoomsList = async () => {
    const res = await AxiosInstance.get(`${CHAT_URL}/rooms/`);
    return res.data;
};

export const getRoomsListByType = async (type: string) => {
    const res = await AxiosInstance.get(`${CHAT_URL}/rooms/${type}`);
    return res.data;
};

export const getRoomsBySearchParams = async (roomtype: string, q: string) => {
    try {
        const res = await AxiosInstance.get(`${CHAT_URL}/rooms/search/${roomtype}/${q}`);
        if (!res) 
            return [];
        return res.data;
    } catch (e)
    {
        console.log("error getting q", e);
    }
};

export const getMessages = async (roomId: string) => {
    const res = await AxiosInstance.get(`${CHAT_URL}/messages/${roomId}/`);
    return res.data;
};

export const getPublicRooms = async () => {
    const res = await AxiosInstance.get(`${CHAT_URL}/rooms/public/`);
    return res.data;
};

export const getDmRooms = async () => {
    const res = await AxiosInstance.get(`${CHAT_URL}/rooms/dm/`);
    return res.data;
};

export const getRoomByName = async (roomName: string) => {
    const res = await AxiosInstance.get(`${CHAT_URL}/rooms/${roomName}/`);
    return res.data;
};

export const createRoom = async (roomName: string, isDirect: boolean) => {
    const res = await AxiosInstance.post(`${CHAT_URL}/create_room/`, { room_name: roomName, isDirect: isDirect });
    return res.data;
};

export const createDMRoom = async (roomName: string) => {
    const res = await AxiosInstance.post(`${CHAT_URL}/create_dm_room/`, { friend: roomName });
    return res.data;
};

export const joinDmRoom = async (roomName: string, otherUsername: string) => {
    const res = await AxiosInstance.post(`${CHAT_URL}/join_dm_room/${otherUsername}/`,
        { room_name: roomName });
    return res.data;
};

export const joinRoom = async (roomId: number) => {
    const res = await AxiosInstance.post(`${CHAT_URL}/join_room/${roomId}/`);
    return res.data;
};

export const leaveRoom = async (roomId: number, username: string) => {
    const res = await AxiosInstance.post(`${CHAT_URL}/leave_room/${roomId}/`, { username: username });
    return res.data;
}


