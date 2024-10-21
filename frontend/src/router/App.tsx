import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import SideBar from "./routes/sidebar";
import ErrorPage from "./errorPage";
import Index from "./routes";
import ChatList, { loader as ChatListLoader } from "./routes/chat/chatList";
import ChatIndex from "./routes/chat";
import CreateRoom, { loader as CreateDMRoomLoader, action as CreateDMRoomAction } from "./routes/chat/createRoom";
import ChatRoom, { loader as ChatRoomLoader } from "./routes/chat/chatroom";
import { action as deleteAction } from "./routes/chat/delete";
import { action as leaveAction } from "./routes/chat/leave";
import Profile, { loader as ProfileLoader } from "./routes/profile/profile";
import FriendProfile, { loader as FriendProfileLoader } from "./routes/friends/friendProfile";
import FriendList, { loader as FriendListLoader } from "./routes/friends/friendsList";
import BlockedList, { loader as BlockedListLoader } from "./routes/friends/blockedList";
import { PasswordResetRequest } from "./routes/Authentication/ResetPasswordRequest";
import { PasswordReset } from "./routes/Authentication/ResetPassword";

import Login from "./routes/Authentication/Login";
import { loader as SocialLoginLoader } from "./routes/Authentication/SocialLogin";
import { Register } from "./routes/Authentication/Register";
import { VerifyEmail } from "./routes/Authentication/VerifyEmail";

import UserStats, { loader as UserStatsLoader } from "./routes/profile/UserStats";
import Leaderboard, { loader as LeaderboardLoader } from "./routes/profile/LeaderBoard";
import AuthProvider, { loader as AuthProviderLoader } from "./routes/hooks/useAuth";
import { AuthLayout } from "./AuthLayout";

import SearchUsers, { loader as SearchUsersLoader } from "./routes/search/SearchUsers";

import LocalGame, { loader as LocalUserLoader } from "./routes/LocalMatch/Local";
import Tournament, { loader as TournamentLoader } from "./routes/tournament/Tournament";
import MatchInstance from "./routes/tournament/MatchInstance";
import MatchHistory, {loader as MatchHistoryLoader} from "./routes/friends/MatchHistory";
import { WebSocketProvider } from "../WebSocketContext";

import "./App.css";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AuthProvider />} loader={AuthProviderLoader} errorElement={<ErrorPage />}>
      <Route element={<WebSocketProvider><AuthLayout /></WebSocketProvider>}>
        <Route path="/" element={<SideBar />} errorElement={<ErrorPage />}>
          <Route index element={<Index />} />


          <Route path="chat" element={<ChatList />} loader={ChatListLoader}>
            <Route index element={<ChatIndex />} />
            <Route path="createRoom" element={<CreateRoom />} action={CreateDMRoomAction} loader={CreateDMRoomLoader} />
            <Route path=":roomID" element={<ChatRoom />} loader={ChatRoomLoader} />
            <Route path=":roomID/delete" action={deleteAction} />
            <Route path=":roomID/leave" action={leaveAction} />
          </Route>

          <Route path="profile" element={<Profile />} loader={ProfileLoader}>
            <Route path="blocked" element={<BlockedList />} loader={BlockedListLoader} />
            <Route path="friends" element={<FriendList />} loader={FriendListLoader} />
            <Route path="userstats" element={<UserStats />} loader={UserStatsLoader} />
            <Route path="leaderboard" element={<Leaderboard />} loader={LeaderboardLoader} />
          </Route>

          <Route path="search" element={<SearchUsers />} loader={SearchUsersLoader}>
          </Route>

          <Route path="/profile/:username" element={<FriendProfile />} loader={FriendProfileLoader}>
            <Route path="matchhistory" element={<MatchHistory />} loader={MatchHistoryLoader}/>
          </Route>

          <Route path="local" element={<LocalGame />} loader={LocalUserLoader} />

          <Route path="tournament" element={<Tournament />} loader={TournamentLoader} />

          <Route path="/room/:matchid" element={<MatchInstance />} />

        </Route>
      </Route>

      {/* public routes */}
      <Route path="/login" element={<Login></Login>} />
      <Route path="/42" loader={SocialLoginLoader} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<VerifyEmail />} />
      <Route path="/password/reset-request" element={<PasswordResetRequest />} />
      <Route path="/password/reset/:uid/:token" element={<PasswordReset />} />
    </Route>
  )
);
